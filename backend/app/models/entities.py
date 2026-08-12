import datetime
from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship

# 1. User Entity
class User(SQLModel, table=True):
    __tablename__ = "users"
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True, nullable=False)
    password_hash: str = Field(nullable=False)
    is_active: bool = Field(default=True)
    is_admin: bool = Field(default=False)
    reset_token_hash: Optional[str] = Field(default=None)
    reset_token_expires_at: Optional[datetime.datetime] = Field(default=None)
    created_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)
    updated_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)

    profile: Optional["UserProfile"] = Relationship(back_populates="user")

# 2. User Profile Entity
class UserProfile(SQLModel, table=True):
    __tablename__ = "user_profiles"
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", unique=True, index=True, nullable=False)
    name: str = Field(nullable=False)
    age: int = Field(default=28)
    occupation: str = Field(default="Salaried")
    country: str = Field(default="India")
    city: Optional[str] = Field(default="Bengaluru")
    annual_income: float = Field(default=1200000.0)
    monthly_income: float = Field(default=100000.0)
    expected_income_growth_pct: float = Field(default=8.0)
    family_status: str = Field(default="Single")
    monthly_fixed_expenses: float = Field(default=40000.0)
    current_savings: float = Field(default=250000.0)
    current_investments: float = Field(default=120000.0)
    emergency_fund: float = Field(default=80000.0)
    existing_loans_count: int = Field(default=0)
    existing_total_emi: float = Field(default=0.0)
    risk_preference: str = Field(default="Moderate")
    created_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)
    updated_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)

    user: Optional[User] = Relationship(back_populates="profile")

# 3. Session Entity
class UserSession(SQLModel, table=True):
    __tablename__ = "sessions"
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True, nullable=False)
    token_jti: str = Field(unique=True, index=True, nullable=False)
    user_agent: Optional[str] = Field(default=None)
    expires_at: datetime.datetime = Field(nullable=False)
    created_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)

# 4. Income Record Entity
class IncomeRecord(SQLModel, table=True):
    __tablename__ = "income_records"
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True, nullable=False)
    source: str = Field(nullable=False)
    amount: float = Field(nullable=False)
    frequency: str = Field(default="Monthly")
    date: datetime.date = Field(default_factory=datetime.date.today)
    notes: Optional[str] = Field(default=None)

# 5. Category Entity
class Category(SQLModel, table=True):
    __tablename__ = "categories"
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(unique=True, nullable=False)
    icon: str = Field(default="wallet")
    type: str = Field(default="Expense")
    is_essential: bool = Field(default=False)
    is_default: bool = Field(default=True)

# 6. Transaction Entity
class Transaction(SQLModel, table=True):
    __tablename__ = "transactions"
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True, nullable=False)
    merchant: str = Field(index=True, nullable=False)
    amount: float = Field(nullable=False)
    date: datetime.date = Field(default_factory=datetime.date.today, index=True)
    category_id: Optional[int] = Field(foreign_key="categories.id", nullable=True)
    type: str = Field(default="Expense")
    payment_method: str = Field(default="UPI")
    notes: Optional[str] = Field(default=None)
    source: str = Field(default="Manual")
    is_recurring: bool = Field(default=False)
    is_shared: bool = Field(default=False) # Privacy default: False
    created_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)

# 7. Merchant Mapping Entity
class MerchantMapping(SQLModel, table=True):
    __tablename__ = "merchant_mappings"
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: Optional[int] = Field(foreign_key="users.id", nullable=True)
    raw_merchant: str = Field(index=True, nullable=False)
    mapped_category_id: int = Field(foreign_key="categories.id", nullable=False)
    confidence: float = Field(default=1.0)
    is_user_verified: bool = Field(default=True)

# 8. Financial Goal Entity
class FinancialGoal(SQLModel, table=True):
    __tablename__ = "financial_goals"
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True, nullable=False)
    goal_name: str = Field(nullable=False)
    target_amount: float = Field(nullable=False)
    current_amount: float = Field(default=0.0)
    target_date: datetime.date = Field(nullable=False)
    priority: str = Field(default="Medium")
    monthly_contribution: float = Field(default=0.0)
    is_shared: bool = Field(default=False)
    status: str = Field(default="In Progress")
    created_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)

# 9. Goal Progress Entity
class GoalProgress(SQLModel, table=True):
    __tablename__ = "goal_progress"
    id: Optional[int] = Field(default=None, primary_key=True)
    goal_id: int = Field(foreign_key="financial_goals.id", index=True, nullable=False)
    date: datetime.date = Field(default_factory=datetime.date.today)
    amount_added: float = Field(nullable=False)
    source: str = Field(default="Manual Contribution")
    note: Optional[str] = Field(default=None)

# 10. Budget Plan Entity
class BudgetPlan(SQLModel, table=True):
    __tablename__ = "budget_plans"
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True, nullable=False)
    month_year: str = Field(nullable=False, index=True)
    total_budget_limit: float = Field(nullable=False)
    created_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)

# 11. Budget Category Entity
class BudgetCategory(SQLModel, table=True):
    __tablename__ = "budget_categories"
    id: Optional[int] = Field(default=None, primary_key=True)
    budget_plan_id: int = Field(foreign_key="budget_plans.id", index=True, nullable=False)
    category_id: int = Field(foreign_key="categories.id", nullable=False)
    allocated_amount: float = Field(nullable=False)
    spent_amount: float = Field(default=0.0)

# 12. Portfolio Asset Entity
class PortfolioAsset(SQLModel, table=True):
    __tablename__ = "portfolio_assets"
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True, nullable=False)
    asset_type: str = Field(nullable=False)
    asset_name: str = Field(nullable=False)
    invested_amount: float = Field(nullable=False)
    current_value: float = Field(nullable=False)
    quantity: float = Field(default=1.0)
    purchase_date: datetime.date = Field(default_factory=datetime.date.today)
    notes: Optional[str] = Field(default=None)

# 13. Financial Score Entity
class FinancialScore(SQLModel, table=True):
    __tablename__ = "financial_scores"
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True, nullable=False)
    overall_score: int = Field(nullable=False)
    savings_ratio_score: int = Field(default=0)
    emergency_fund_score: int = Field(default=0)
    debt_burden_score: int = Field(default=0)
    investment_ratio_score: int = Field(default=0)
    spending_discipline_score: int = Field(default=0)
    subscription_burden_score: int = Field(default=0)
    lifestyle_inflation_score: int = Field(default=0)
    cash_flow_score: int = Field(default=0)
    computed_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)

# 14. Financial Score History Entity
class FinancialScoreHistory(SQLModel, table=True):
    __tablename__ = "financial_score_history"
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True, nullable=False)
    score: int = Field(nullable=False)
    month_year: str = Field(nullable=False)
    breakdown_json: str = Field(default="{}")

# 15. Subscription Entity
class Subscription(SQLModel, table=True):
    __tablename__ = "subscriptions"
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True, nullable=False)
    name: str = Field(nullable=False)
    amount: float = Field(nullable=False)
    billing_cycle: str = Field(default="Monthly")
    merchant: str = Field(nullable=False)
    category_id: Optional[int] = Field(foreign_key="categories.id", nullable=True)
    next_renewal_date: datetime.date = Field(default_factory=datetime.date.today)
    status: str = Field(default="Active")

# 16. AI Insight Entity
class AIInsight(SQLModel, table=True):
    __tablename__ = "ai_insights"
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True, nullable=False)
    title: str = Field(nullable=False)
    category: str = Field(default="General")
    impact_level: str = Field(default="Medium")
    narrative: str = Field(nullable=False)
    action_label: Optional[str] = Field(default=None)
    action_url: Optional[str] = Field(default=None)
    is_llm_generated: bool = Field(default=False)
    is_read: bool = Field(default=False)
    created_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)

# 17. AI Report Entity
class AIReport(SQLModel, table=True):
    __tablename__ = "ai_reports"
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True, nullable=False)
    report_month: str = Field(nullable=False)
    summary_markdown: str = Field(nullable=False)
    score: int = Field(default=0)
    top_leaks_json: str = Field(default="[]")
    savings_growth: float = Field(default=0.0)
    is_llm_generated: bool = Field(default=False)
    created_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)

# 18. Uploaded Document Entity
class UploadedDocument(SQLModel, table=True):
    __tablename__ = "uploaded_documents"
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True, nullable=False)
    filename: str = Field(nullable=False)
    file_path: str = Field(nullable=False)
    mime_type: str = Field(nullable=False)
    file_size: int = Field(nullable=False)
    status: str = Field(default="Uploaded")
    created_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)

# 19. OCR Result Entity
class OCRResult(SQLModel, table=True):
    __tablename__ = "ocr_results"
    id: Optional[int] = Field(default=None, primary_key=True)
    document_id: int = Field(foreign_key="uploaded_documents.id", unique=True, index=True, nullable=False)
    raw_text: str = Field(default="")
    extracted_merchant: Optional[str] = Field(default=None)
    extracted_date: Optional[datetime.date] = Field(default=None)
    extracted_amount: Optional[float] = Field(default=0.0)
    extracted_tax: Optional[float] = Field(default=0.0)
    extracted_category: Optional[str] = Field(default=None)
    confidence_score: float = Field(default=0.0)

# 20. Chat Conversation Entity
class ChatConversation(SQLModel, table=True):
    __tablename__ = "chat_conversations"
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True, nullable=False)
    title: str = Field(default="New Conversation")
    created_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)

# 21. Chat Message Entity
class ChatMessage(SQLModel, table=True):
    __tablename__ = "chat_messages"
    id: Optional[int] = Field(default=None, primary_key=True)
    conversation_id: int = Field(foreign_key="chat_conversations.id", index=True, nullable=False)
    sender: str = Field(nullable=False) # user / coach
    message: str = Field(nullable=False)
    sources_json: str = Field(default="[]")
    is_llm_generated: bool = Field(default=False)
    created_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)

# 22. Notification Entity
class Notification(SQLModel, table=True):
    __tablename__ = "notifications"
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True, nullable=False)
    title: str = Field(nullable=False)
    message: str = Field(nullable=False)
    type: str = Field(default="info")
    is_read: bool = Field(default=False)
    created_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)

# 23. Market Data Cache Entity
class MarketDataCache(SQLModel, table=True):
    __tablename__ = "market_data_cache"
    symbol: str = Field(primary_key=True)
    name: str = Field(nullable=False)
    price: float = Field(nullable=False)
    change: float = Field(default=0.0)
    percent_change: float = Field(default=0.0)
    asset_type: str = Field(default="Index")
    market_status: str = Field(default="Open")
    data_source: str = Field(default="Market API")
    updated_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)

# 24. User Settings Entity
class UserSettings(SQLModel, table=True):
    __tablename__ = "user_settings"
    user_id: int = Field(foreign_key="users.id", primary_key=True)
    theme: str = Field(default="dark")
    currency: str = Field(default="INR")
    language: str = Field(default="en")
    notify_email: bool = Field(default=True)
    notify_budget: bool = Field(default=True)
    notify_goals: bool = Field(default=True)

# 25. Audit Log Entity
class AuditLog(SQLModel, table=True):
    __tablename__ = "audit_logs"
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: Optional[int] = Field(foreign_key="users.id", nullable=True)
    action: str = Field(nullable=False)
    resource: str = Field(nullable=False)
    ip_address: Optional[str] = Field(default=None)
    timestamp: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)

# 26. Loan Entity
class Loan(SQLModel, table=True):
    __tablename__ = "loans"
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True, nullable=False)
    loan_name: str = Field(nullable=False)
    loan_type: str = Field(default="Car Loan") # Home Loan, Car Loan, Personal Loan, Education Loan, Gold Loan, Custom
    original_principal: float = Field(nullable=False)
    outstanding_principal: float = Field(nullable=False)
    interest_rate: float = Field(nullable=False)
    emi_amount: float = Field(nullable=False)
    tenure_months: int = Field(nullable=False)
    start_date: datetime.date = Field(default_factory=datetime.date.today)
    end_date: datetime.date = Field(default_factory=datetime.date.today)
    next_payment_date: datetime.date = Field(default_factory=datetime.date.today)
    lender_name: Optional[str] = Field(default=None)
    processing_fee: float = Field(default=0.0)
    status: str = Field(default="Active") # Active, Paid Off, Closed
    created_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)

# 27. Loan Payment Entity (Mark EMI as Paid)
class LoanPayment(SQLModel, table=True):
    __tablename__ = "loan_payments"
    id: Optional[int] = Field(default=None, primary_key=True)
    loan_id: int = Field(foreign_key="loans.id", index=True, nullable=False)
    user_id: int = Field(foreign_key="users.id", index=True, nullable=False)
    payment_date: datetime.date = Field(default_factory=datetime.date.today)
    amount_paid: float = Field(nullable=False)
    principal_component: float = Field(nullable=False) # Only this reduces outstanding principal
    interest_component: float = Field(nullable=False)
    linked_transaction_id: Optional[int] = Field(foreign_key="transactions.id", nullable=True)
    notes: Optional[str] = Field(default=None)
    created_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)

# 28. Loan Schedule Entity
class LoanSchedule(SQLModel, table=True):
    __tablename__ = "loan_schedules"
    id: Optional[int] = Field(default=None, primary_key=True)
    loan_id: int = Field(foreign_key="loans.id", index=True, nullable=False)
    month_number: int = Field(nullable=False)
    payment_date: datetime.date = Field(nullable=False)
    emi: float = Field(nullable=False)
    principal: float = Field(nullable=False)
    interest: float = Field(nullable=False)
    remaining_balance: float = Field(nullable=False)

# 29. Loan Prepayment Entity
class LoanPrepayment(SQLModel, table=True):
    __tablename__ = "loan_prepayments"
    id: Optional[int] = Field(default=None, primary_key=True)
    loan_id: int = Field(foreign_key="loans.id", index=True, nullable=False)
    prepayment_date: datetime.date = Field(default_factory=datetime.date.today)
    amount: float = Field(nullable=False)
    payment_mode: str = Field(default="Lump Sum")
    months_saved: int = Field(default=0)
    interest_saved: float = Field(default=0.0)

# 30. Loan Scenario Entity
class LoanScenario(SQLModel, table=True):
    __tablename__ = "loan_scenarios"
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True, nullable=False)
    scenario_type: str = Field(nullable=False) # Comparison, Stress Test, Prepayment
    loan_amount: float = Field(nullable=False)
    rate: float = Field(nullable=False)
    tenure: int = Field(nullable=False)
    result_json: str = Field(default="{}")
    created_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)

# 31. Purchase Affordability Check Entity
class PurchaseAffordabilityCheck(SQLModel, table=True):
    __tablename__ = "purchase_affordability_checks"
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True, nullable=False)
    purchase_name: str = Field(nullable=False)
    amount: float = Field(nullable=False)
    category_id: Optional[int] = Field(foreign_key="categories.id", nullable=True)
    result_status: str = Field(nullable=False) # Comfortable, Caution, Financially Risky
    emergency_impact_months: float = Field(default=0.0)
    goal_delay_months: float = Field(default=0.0)
    created_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)

# 32. Financial Shock Scenario Entity
class FinancialShockScenario(SQLModel, table=True):
    __tablename__ = "financial_shock_scenarios"
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True, nullable=False)
    scenario_type: str = Field(nullable=False) # 1_month_no_income, medical_emergency, etc.
    shock_amount: float = Field(default=0.0)
    income_drop_pct: float = Field(default=0.0)
    runway_months_left: float = Field(nullable=False)
    risk_level: str = Field(default="SAFE") # SAFE, CAUTION, HIGH RISK
    computed_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)

# 33. Financial Projection Entity (FutureView)
class FinancialProjection(SQLModel, table=True):
    __tablename__ = "financial_projections"
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True, nullable=False)
    scenario_name: str = Field(nullable=False) # Current Path, Save More, Reduce Spending
    projected_1yr: float = Field(default=0.0)
    projected_3yr: float = Field(default=0.0)
    projected_5yr: float = Field(default=0.0)
    projected_10yr: float = Field(default=0.0)
    assumptions_json: str = Field(default="{}")
    created_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)

# 34. Projection Assumption Entity
class ProjectionAssumption(SQLModel, table=True):
    __tablename__ = "projection_assumptions"
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", primary_key=True)
    income_growth_rate: float = Field(default=8.0)
    expense_growth_rate: float = Field(default=6.0)
    assumed_return_rate: float = Field(default=10.0)
    inflation_rate: float = Field(default=5.5)

# 35. Salary Allocation Entity (Salary Flow)
class SalaryAllocation(SQLModel, table=True):
    __tablename__ = "salary_allocations"
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True, nullable=False)
    month_year: str = Field(nullable=False)
    needs_amount: float = Field(default=0.0)
    needs_pct: float = Field(default=0.0)
    wants_amount: float = Field(default=0.0)
    wants_pct: float = Field(default=0.0)
    future_amount: float = Field(default=0.0)
    future_pct: float = Field(default=0.0)
    computed_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)

# 36. Financial First Aid Plan Entity
class FinancialFirstAidPlan(SQLModel, table=True):
    __tablename__ = "financial_first_aid_plans"
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True, nullable=False)
    trigger_reason: str = Field(nullable=False) # Expenses > Income, Emergency Fund Low
    severity_level: str = Field(default="Medium") # High, Medium, Low
    recovery_steps_json: str = Field(default="[]")
    is_resolved: bool = Field(default=False)
    created_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)

# 37. Spending Investigation Entity
class SpendingInvestigation(SQLModel, table=True):
    __tablename__ = "spending_investigations"
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True, nullable=False)
    category_id: int = Field(foreign_key="categories.id", nullable=False)
    month_year: str = Field(nullable=False)
    spending_delta: float = Field(default=0.0)
    primary_driver_merchant: Optional[str] = Field(default=None)
    narrative: str = Field(nullable=False)
    created_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)

# 38. Financial Habit Entity
class FinancialHabit(SQLModel, table=True):
    __tablename__ = "financial_habits"
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True, nullable=False)
    habit_name: str = Field(nullable=False)
    current_streak_days: int = Field(default=0)
    last_checked_date: datetime.date = Field(default_factory=datetime.date.today)
    is_active: bool = Field(default=True)

# 39. Education Content Entity (Artha Learn)
class EducationContent(SQLModel, table=True):
    __tablename__ = "education_content"
    id: Optional[int] = Field(default=None, primary_key=True)
    term: str = Field(unique=True, nullable=False)
    title: str = Field(nullable=False)
    simple_explanation: str = Field(nullable=False)
    why_it_matters: str = Field(nullable=False)
    example_scenario: str = Field(nullable=False)
    remember_points: str = Field(default="[]")

# 40. Family Account Entity
class FamilyAccount(SQLModel, table=True):
    __tablename__ = "family_accounts"
    id: Optional[int] = Field(default=None, primary_key=True)
    household_name: str = Field(nullable=False)
    owner_user_id: int = Field(foreign_key="users.id", index=True, nullable=False)
    created_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)

# 41. Family Member Entity
class FamilyMember(SQLModel, table=True):
    __tablename__ = "family_members"
    id: Optional[int] = Field(default=None, primary_key=True)
    family_account_id: int = Field(foreign_key="family_accounts.id", index=True, nullable=False)
    user_id: int = Field(foreign_key="users.id", index=True, nullable=False)
    role: str = Field(default="Contributor") # Owner, Contributor, Viewer
    member_name: str = Field(nullable=False)

# 42. Chat Context Metadata Entity
class ChatContextMetadata(SQLModel, table=True):
    __tablename__ = "chat_context_metadata"
    id: Optional[int] = Field(default=None, primary_key=True)
    message_id: int = Field(foreign_key="chat_messages.id", unique=True, index=True, nullable=False)
    intent_detected: str = Field(nullable=False)
    tools_executed_json: str = Field(default="[]") # Stores real backend function names & results
    user_context_summary: str = Field(default="")

# 43. Financial Decision History Entity
class FinancialDecisionHistory(SQLModel, table=True):
    __tablename__ = "financial_decision_history"
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True, nullable=False)
    decision_type: str = Field(nullable=False, index=True) # Affordability, Loan Comparison, Shock Test, FutureView, Prepayment
    title: str = Field(nullable=False)
    input_data_json: str = Field(default="{}")
    result_data_json: str = Field(default="{}")
    risk_level: str = Field(default="Manageable") # Comfortable/Manageable, Caution, High Risk
    created_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow, index=True)
