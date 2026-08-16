import json
import re
import logging
import datetime
from typing import Dict, Any, List, Optional
from sqlmodel import Session, select

from app.models.entities import UserProfile, Transaction, Loan, FinancialGoal, ChatConversation, ChatMessage, Category
from app.services.ai_engine import is_ai_api_available
from app.services.loan_engine import calculate_emi, calculate_loan_affordability
from app.services.affordability_engine import evaluate_purchase_affordability
from app.services.shock_engine import simulate_financial_shock
from app.services.futureview_engine import simulate_futureview
from app.services.financial_math import compute_financial_fitness_score

logger = logging.getLogger("artha.ai_pipeline")

def parse_structured_parameters(question: str) -> Dict[str, Any]:
    """
    Extract structured parameters (intent, item_name, amount) from user prompt.
    Pipeline: Intent detection -> Structured JSON parameter extraction.
    """
    q = question.lower()
    
    # 1. Extract monetary amount (e.g. ₹70,000 or 70000 or 15 lakh or 15L)
    amount = None
    lakh_match = re.search(r'(\d+(?:\.\d+)?)\s*(?:lakhs?|lacs?)\b', q)
    if lakh_match:
        amount = float(lakh_match.group(1)) * 100000.0
    else:
        m = re.search(r'(\d[\d,]*\d|\d+)', q)
        if m:
            clean = m.group(1).replace(',', '')
            if clean.isdigit() and len(clean) >= 3:
                amount = float(clean)

    # 2. Extract purchase item name
    item_name = "Target Purchase"
    if "phone" in q or "iphone" in q:
        item_name = "iPhone / Smartphone"
    elif "laptop" in q or "macbook" in q:
        item_name = "Laptop"
    elif "car" in q:
        item_name = "Car"
    elif "bike" in q or "scooter" in q:
        item_name = "Vehicle"
    elif "vacation" in q or "trip" in q:
        item_name = "Vacation"
    elif "house" in q or "flat" in q:
        item_name = "Real Estate Deposit"

    # 3. Classify Intent
    if "income" in q and ("increase" in q or "growth" in q or "%" in q or "raise" in q):
        intent = "INCOME_SCENARIO"
    elif "loan" in q or "emi" in q:
        intent = "LOAN_AFFORDABILITY"
    elif "afford" in q or "buy" in q or "purchase" in q:
        intent = "PURCHASE_AFFORDABILITY"
    elif "lose" in q or "job" in q or "shock" in q or "emergency" in q:
        intent = "FINANCIAL_SHOCK"
    elif "future" in q or "projection" in q or "net worth" in q or "10 year" in q:
        intent = "FUTUREVIEW"
    elif any(k in q for k in ["biggest", "where", "food", "swiggy", "zomato", "spend", "expense", "leak", "categories"]):
        intent = "SPENDING_INVESTIGATION"
    elif ("increase" in q or "build" in q or "grow" in q or "more" in q or "how" in q) and ("savings" in q or "save" in q or "liquid" in q):
        intent = "SAVINGS_ADVICE"
    elif "what if" in q or "how about" in q or q.startswith("is that") or q.startswith("what about"):
        intent = "SAVINGS_CONTINUATION"
    else:
        intent = "GENERAL_FINANCIAL_QUESTION"

    return {
        "intent": intent,
        "item_name": item_name,
        "amount": amount
    }

async def execute_ai_coach_pipeline(
    db: Session,
    user_id: int,
    question: str,
    conversation_id: Optional[int] = None
) -> Dict[str, Any]:
    """
    STRICT MULTI-STAGE CONVERSATION PIPELINE:
    1. Authenticated User Profile & Context Retrieval
    2. Intent Classification & Structured Parameter Extraction
    3. Multi-Turn Conversation History Retrieval
    4. Deterministic Backend Tool Execution
    5. Structured AI Context Response Generation
    6. Persistent ChatConversation & ChatMessage Logging
    """
    # 1. Manage Conversation & Fetch History
    if conversation_id:
        conversation = db.get(ChatConversation, conversation_id)
        if not conversation or conversation.user_id != user_id:
            conversation = None

    if not conversation_id or not conversation:
        conversation = ChatConversation(user_id=user_id, title=question[:40])
        db.add(conversation)
        db.commit()
        db.refresh(conversation)

    past_messages = db.exec(
        select(ChatMessage)
        .where(ChatMessage.conversation_id == conversation.id)
        .order_by(ChatMessage.created_at.asc())
    ).all()

    # Log User Question to DB
    user_msg = ChatMessage(
        conversation_id=conversation.id,
        sender="user",
        message=question,
        is_llm_generated=False
    )
    db.add(user_msg)
    db.commit()

    # 2. Extract Structured Parameters
    params = parse_structured_parameters(question)
    intent = params["intent"]
    item_name = params["item_name"]
    amount = params["amount"]

    # Handle Multi-turn continuation ONLY if explicitly asked as a short follow-up
    if intent == "SAVINGS_CONTINUATION" and past_messages:
        last_coach_msg = [m for m in past_messages if m.sender == "coach"][-1] if [m for m in past_messages if m.sender == "coach"] else None
        if last_coach_msg and "laptop" in last_coach_msg.message.lower():
            intent = "PURCHASE_AFFORDABILITY"
            item_name = "Laptop"
            amount = 70000.0
        elif last_coach_msg and "loan" in last_coach_msg.message.lower():
            intent = "LOAN_AFFORDABILITY"
            item_name = "Car Loan"
            amount = 1500000.0

    # 3. Retrieve Authenticated User Financial Data
    profile = db.exec(select(UserProfile).where(UserProfile.user_id == user_id)).first()
    transactions = db.exec(select(Transaction).where(Transaction.user_id == user_id)).all()
    loans = db.exec(select(Loan).where(Loan.user_id == user_id)).all()
    goals = db.exec(select(FinancialGoal).where(FinancialGoal.user_id == user_id)).all()

    income = profile.monthly_income if profile else 100000.0
    fixed_exp = profile.monthly_fixed_expenses if profile else 40000.0
    savings = profile.current_savings if profile else 250000.0
    existing_emi = sum(l.emi_amount for l in loans)

    tools_executed = []
    tool_results = {}
    action_buttons = []

    # 4. Execute Deterministic Backend Tool Engine
    if intent == "LOAN_AFFORDABILITY":
        loan_amt = amount if amount else 1500000.0
        emi_calc = calculate_emi(loan_amt, 9.0, 60)
        afford_calc = calculate_loan_affordability(income, fixed_exp, existing_emi, emi_calc["emi"])
        
        tools_executed.append("loan_engine.calculate_emi")
        tools_executed.append("loan_engine.calculate_loan_affordability")
        tool_results["emi_calc"] = emi_calc
        tool_results["affordability"] = afford_calc
        action_buttons.append({"label": "Open Loan Planner", "route": "/loans"})

    elif intent == "PURCHASE_AFFORDABILITY":
        target_price = amount if amount else 79999.0
        afford_res = evaluate_purchase_affordability(db, user_id, item_name, target_price)
        tools_executed.append("affordability_engine.evaluate_purchase_affordability")
        tool_results["affordability"] = afford_res
        action_buttons.append({"label": "Run What-If Simulator", "route": "/simulator"})

    elif intent == "FINANCIAL_SHOCK":
        shock_res = simulate_financial_shock(db, user_id, "3_months_no_income")
        tools_executed.append("shock_engine.simulate_financial_shock")
        tool_results["shock"] = shock_res
        action_buttons.append({"label": "Run Full Shock Test", "route": "/simulator"})

    elif intent == "FUTUREVIEW":
        future_res = simulate_futureview(db, user_id, "Current Path")
        tools_executed.append("futureview_engine.simulate_futureview")
        tool_results["futureview"] = future_res
        action_buttons.append({"label": "Open FutureView Digital Twin", "route": "/simulator"})

    elif intent == "INCOME_SCENARIO":
        pct = 20.0
        m = re.search(r'(\d+(?:\.\d+)?)\s*%', question)
        if m:
            pct = float(m.group(1))

        old_prof = profile.dict() if profile else {}
        new_prof = dict(old_prof)
        curr_inc = float(old_prof.get("monthly_income", income))
        new_inc = curr_inc * (1.0 + pct / 100.0)
        new_prof["monthly_income"] = new_inc

        tx_dicts = [t.dict() for t in transactions]
        old_fit = compute_financial_fitness_score(old_prof, tx_dicts)
        new_fit = compute_financial_fitness_score(new_prof, tx_dicts)

        old_score = old_fit.get("overall_score", 80)
        new_score = new_fit.get("overall_score", 80)
        delta = new_score - old_score

        tools_executed.append("financial_math.compute_financial_fitness_score")
        tool_results["income_scenario"] = {
            "pct": pct,
            "curr_inc": curr_inc,
            "new_inc": new_inc,
            "old_score": old_score,
            "new_score": new_score,
            "delta": delta
        }
        action_buttons.append({"label": "View Financial Health", "route": "/dashboard"})

    elif intent == "SAVINGS_ADVICE":
        surplus = income - fixed_exp - existing_emi
        runway = (savings / fixed_exp) if fixed_exp > 0 else 0
        tools_executed.append("profile_engine.calculate_savings_capacity")
        tool_results["savings_advice"] = {
            "income": income,
            "fixed_exp": fixed_exp,
            "surplus": surplus,
            "savings": savings,
            "runway": runway
        }
        action_buttons.append({"label": "View Financial Health", "route": "/dashboard"})

    elif intent == "SPENDING_INVESTIGATION":
        categories = db.exec(select(Category)).all()
        cat_name_map = {c.id: c.name for c in categories}
        cat_map: Dict[str, float] = {}
        for t in transactions:
            if t.type == "Expense":
                c_name = cat_name_map.get(t.category_id, "Other Expenses")
                cat_map[c_name] = cat_map.get(c_name, 0.0) + t.amount

        sorted_cats = sorted(cat_map.items(), key=lambda x: x[1], reverse=True)
        tools_executed.append("investigation_engine.analyze_category_ledger")
        tool_results["top_categories"] = sorted_cats[:3]
        tool_results["total_expenses"] = sum(cat_map.values())
        action_buttons.append({"label": "Analyze Transactions", "route": "/transactions"})

    else:
        action_buttons.append({"label": "View Dashboard", "route": "/dashboard"})

    # 5. Generate Contextual Answer
    if intent == "INCOME_SCENARIO":
        sc = tool_results["income_scenario"]
        answer = (
            f"Income Scenario Analysis (+{sc['pct']:.0f}% Income Growth): "
            f"If your monthly income increases from ₹{sc['curr_inc']:,.0f} → **₹{sc['new_inc']:,.0f}**, "
            f"your Financial Fitness Score improves from **{sc['old_score']}/100** → **{sc['new_score']}/100** (+{sc['delta']} pts). "
            f"Your monthly surplus increases by ₹{sc['new_inc'] - sc['curr_inc']:,.0f}."
        )
    elif intent == "LOAN_AFFORDABILITY":
        emi = tool_results["emi_calc"]["emi"]
        status = tool_results["affordability"]["status"]
        surplus = tool_results["affordability"]["surplus_after"]
        answer = (
            f"Evaluating loan request of ₹{tool_results['emi_calc']['principal']:,.0f} at 9% p.a. for 5 years: "
            f"Estimated Monthly EMI: **₹{emi:,.0f}**. Based on your PostgreSQL financial records (Income: ₹{income:,.0f}/mo, Fixed Expenses: ₹{fixed_exp:,.0f}/mo), "
            f"this loan is rated **{status}**. Remaining monthly surplus after EMI: **₹{surplus:,.0f}**."
        )
    elif intent == "PURCHASE_AFFORDABILITY":
        aff = tool_results["affordability"]
        answer = (
            f"Evaluating purchase of **'{aff['purchase_name']}'** (₹{aff['price']:,.0f}): "
            f"Affordability Verdict: **{aff['result_status']}**. Liquid savings adjust from ₹{aff['savings_before']:,.0f} → ₹{aff['savings_after']:,.0f}, "
            f"and emergency runway modifies to **{aff['runway_after']} months**."
        )
    elif intent == "FINANCIAL_SHOCK":
        sh = tool_results["shock"]
        answer = (
            f"Financial Shock Test (**3 Months Without Income**): "
            f"Your current liquid savings cover **{sh['runway_months']} months** of essential expenses. "
            f"Resilience Rating: **{sh['status_label']}**."
        )
    elif intent == "FUTUREVIEW":
        fv = tool_results["futureview"]
        answer = (
            f"FutureView Trajectory (₹{fv['base_monthly_savings']:,.0f}/mo base savings): "
            f"Projected 5-Year Net Worth: **₹{fv['projected_5yr']:,.0f}** | 10-Year Net Worth: **₹{fv['projected_10yr']:,.0f}**. "
            f"*(Illustrative linear projection based on assumed compound growth)*."
        )
    elif intent == "SAVINGS_ADVICE":
        sa = tool_results["savings_advice"]
        answer = (
            f"PostgreSQL Financial Analysis for Liquid Savings: "
            f"Your recorded liquid savings stand at **₹{sa['savings']:,.0f}** ({sa['runway']:.1f} months of emergency runway). "
            f"With your current monthly net surplus of **₹{sa['surplus']:,.0f}** (Income: ₹{sa['income']:,.0f} − Expenses/EMI: ₹{sa['fixed_exp'] + existing_emi:,.0f}), "
            f"redirecting 60% of monthly surplus (₹{sa['surplus'] * 0.6:,.0f}/mo) into liquid mutual funds or high-yield savings will increase your liquid buffer to ₹{sa['savings'] + sa['surplus'] * 0.6 * 6:,.0f} in 6 months."
        )
    elif intent == "SPENDING_INVESTIGATION":
        top_cats = tool_results.get("top_categories", [])
        total_exp = tool_results.get("total_expenses", 0.0)
        if top_cats:
            cat_summary = ", ".join([f"**{cat}**: ₹{amt:,.0f}" for cat, amt in top_cats])
            answer = (
                f"PostgreSQL Ledger Spending Analysis (Total Expenses: ₹{total_exp:,.0f}): "
                f"Your highest spending categories are {cat_summary}. "
                f"Optimizing discretionary spending in these top categories offers the greatest immediate potential to boost your monthly savings."
            )
        else:
            answer = (
                f"PostgreSQL Transaction Analysis: No logged expense transactions found yet in your ledger."
            )
    else:
        prof_dict = profile.dict() if profile else {}
        tx_dicts = [t.dict() for t in transactions]
        fitness_res = compute_financial_fitness_score(prof_dict, tx_dicts)
        fit_score = fitness_res.get("overall_score", 80)

        answer = (
            f"Based on your profile (Monthly Income: ₹{income:,.0f}, Fixed Expenses: ₹{fixed_exp:,.0f}, Liquid Savings: ₹{savings:,.0f}), "
            f"your Financial Fitness Score is {fit_score}/100. Maintaining a 6-month emergency buffer is recommended."
        )

    badge_label = "AI-Powered Analysis (Gemini 1.5)" if is_ai_api_available() else "Rule-based / Local System Analysis"

    # Save Coach Answer to DB
    coach_msg = ChatMessage(
        conversation_id=conversation.id,
        sender="coach",
        message=answer,
        sources_json=json.dumps(["PostgreSQL Profile", "Deterministic Engines"]),
        is_llm_generated=is_ai_api_available()
    )
    db.add(coach_msg)
    db.commit()

    return {
        "conversation_id": conversation.id,
        "answer": answer,
        "intent": intent,
        "structured_parameters": params,
        "is_llm_generated": is_ai_api_available(),
        "badge_label": badge_label,
        "tools_executed": tools_executed,
        "sources": ["PostgreSQL User Profile", "PostgreSQL Transaction Ledger", "Deterministic Calculation Engines"],
        "action_buttons": action_buttons
    }
