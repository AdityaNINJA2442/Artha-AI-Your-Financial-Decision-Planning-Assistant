import sys
import os
import requests
import json

BASE_URL = "http://127.0.0.1:8001"

DEMO_USERS = [
    ("Arjun Mehta", "arjun.demo@artha.ai"),
    ("Riya Sharma", "riya.demo@artha.ai"),
    ("Rahul Verma", "rahul.demo@artha.ai"),
    ("Neha Kapoor", "neha.demo@artha.ai"),
    ("Vikram Singh", "vikram.demo@artha.ai"),
    ("Ananya Das", "ananya.demo@artha.ai"),
    ("Karan Joshi", "karan.demo@artha.ai"),
    ("Priya Nair", "priya.demo@artha.ai"),
    ("Aman Gupta", "aman.demo@artha.ai"),
    ("Sneha Iyer", "sneha.demo@artha.ai"),
]

PASSWORD = "Demo@123"

def run_browser_verification():
    print("==================================================")
    print("  REAL ENDPOINT & NETWORK VERIFICATION FOR ALL 10 USERS")
    print("==================================================")

    results = []

    for name, email in DEMO_USERS:
        print(f"\n--- TESTING USER: {name} ({email}) ---")

        user_res = {"name": name, "email": email}

        # 1. POST /api/v1/auth/login
        login_res = requests.post(f"{BASE_URL}/api/v1/auth/login", json={"email": email, "password": PASSWORD})
        user_res["login_status"] = login_res.status_code
        print(f"  POST /api/v1/auth/login     -> HTTP {login_res.status_code}")
        if login_res.status_code != 200:
            print(f"    ERROR BODY: {login_res.text}")
            results.append(user_res)
            continue

        token = login_res.json().get("access_token")
        headers = {"Authorization": f"Bearer {token}"}

        # 2. GET /api/v1/auth/me
        me_res = requests.get(f"{BASE_URL}/api/v1/auth/me", headers=headers)
        user_res["me_status"] = me_res.status_code
        print(f"  GET /api/v1/auth/me         -> HTTP {me_res.status_code}")
        if me_res.status_code == 200:
            me_json = me_res.json()
            print(f"    Authenticated User: {me_json.get('email')} (Profile Name: {me_json.get('profile', {}).get('name')})")

        # 3. GET /api/v1/users/profile
        prof_res = requests.get(f"{BASE_URL}/api/v1/users/profile", headers=headers)
        user_res["profile_status"] = prof_res.status_code
        print(f"  GET /api/v1/users/profile   -> HTTP {prof_res.status_code}")
        if prof_res.status_code == 200:
            p_json = prof_res.json()
            print(f"    Income: Rs.{p_json.get('monthly_income', 0):,.0f} | Savings: Rs.{p_json.get('current_savings', 0):,.0f}")

        # 4. GET /api/v1/financial-health/
        health_res = requests.get(f"{BASE_URL}/api/v1/financial-health/", headers=headers)
        user_res["health_status"] = health_res.status_code
        print(f"  GET /api/v1/financial-health/ -> HTTP {health_res.status_code}")
        if health_res.status_code == 200:
            h_json = health_res.json()
            print(f"    Financial Score: {h_json.get('overall_score')} / 100")

        # 5. GET /api/v1/transactions/
        tx_res = requests.get(f"{BASE_URL}/api/v1/transactions/", headers=headers)
        user_res["transactions_status"] = tx_res.status_code
        print(f"  GET /api/v1/transactions/   -> HTTP {tx_res.status_code}")
        if tx_res.status_code == 200:
            tx_json = tx_res.json()
            print(f"    Transactions Count: {len(tx_json)}")

        # 6. GET /api/v1/goals/
        goals_res = requests.get(f"{BASE_URL}/api/v1/goals/", headers=headers)
        user_res["goals_status"] = goals_res.status_code
        print(f"  GET /api/v1/goals/          -> HTTP {goals_res.status_code}")
        if goals_res.status_code == 200:
            g_json = goals_res.json()
            print(f"    Goals Count: {len(g_json)}")

        # 7. GET /api/v1/loans/
        loans_res = requests.get(f"{BASE_URL}/api/v1/loans/", headers=headers)
        user_res["loans_status"] = loans_res.status_code
        print(f"  GET /api/v1/loans/          -> HTTP {loans_res.status_code}")
        if loans_res.status_code == 200:
            l_json = loans_res.json()
            print(f"    Loans Count: {len(l_json)}")

        results.append(user_res)

    print("\n==================================================")
    print("  SUMMARY AUDIT VERIFICATION")
    print("==================================================")
    all_pass = all(r.get("login_status") == 200 and r.get("me_status") == 200 and r.get("profile_status") == 200 and r.get("health_status") == 200 and r.get("transactions_status") == 200 and r.get("goals_status") == 200 and r.get("loans_status") == 200 for r in results)
    if all_pass:
        print("  RESULT: ALL 10 USERS PASSED 100% REAL HTTP NETWORK VERIFICATION! (HTTP 200 OK across all endpoints)")
    else:
        print("  RESULT: SOME ENDPOINTS FAILED. SEE DETAILED LOG ABOVE.")
    print("==================================================")

if __name__ == "__main__":
    run_browser_verification()
