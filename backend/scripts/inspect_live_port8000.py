import requests
import json

url = "http://127.0.0.1:8000/api/v1/auth/login"
payload = {"email": "arjun.demo@artha.ai", "password": "Demo@123"}

print("==================================================")
print("  INSPECTING LIVE PORT 8000 SERVER RESPONSE")
print("==================================================")
try:
    res = requests.post(url, json=payload, timeout=5)
    print(f"HTTP Status Code: {res.status_code}")
    print(f"Response Headers: {dict(res.headers)}")
    print(f"Response Text: {res.text}")
except Exception as e:
    print(f"Request Exception: {e}")
print("==================================================")
