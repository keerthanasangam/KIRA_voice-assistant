import sys
import json
import urllib.request
import urllib.error

BASE_URL = "http://127.0.0.1:8000"

def run_test(name, func):
    try:
        result = func()
        print(f"  \033[92m[PASS]\033[0m {name}: {result}")
        return True
    except Exception as e:
        print(f"  \033[91m[FAIL]\033[0m {name}: {e}")
        return False

def test_health():
    req = urllib.request.Request(f"{BASE_URL}/health")
    with urllib.request.urlopen(req, timeout=5) as res:
        data = json.loads(res.read())
        assert data.get("status") == "healthy", f"Status degraded: {data}"
        assert data.get("database") == "connected", f"Database not connected: {data}"
        return f"Status={data['status']}, Database={data['database']}"

def test_root():
    req = urllib.request.Request(f"{BASE_URL}/")
    with urllib.request.urlopen(req, timeout=5) as res:
        data = json.loads(res.read())
        assert data.get("status") == "online"
        return f"Status={data['status']}"

def test_analytics():
    req = urllib.request.Request(f"{BASE_URL}/analytics")
    with urllib.request.urlopen(req, timeout=5) as res:
        data = json.loads(res.read())
        return f"Total Calls={data.get('total_calls')}, High Urgency={data.get('high_urgency')}"

def test_call_lifecycle():
    # 1. Start call
    start_payload = json.dumps({
        "caller_name": "Automated Test Runner",
        "caller_phone": "9999000011",
        "mode": "Student",
        "purpose": "Verifying production test suite"
    }).encode("utf-8")
    
    start_req = urllib.request.Request(
        f"{BASE_URL}/calls/start",
        data=start_payload,
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(start_req, timeout=10) as res:
        start_data = json.loads(res.read())
        call_id = start_data.get("call_id")
        assert call_id, "No call_id returned from start"

    # 2. End call and verify summary
    end_req = urllib.request.Request(
        f"{BASE_URL}/calls/{call_id}/end",
        data=b"{}",
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(end_req, timeout=15) as res:
        end_data = json.loads(res.read())
        assert end_data.get("status") == "completed", "Call not marked completed"
        summary = end_data.get("summary", {})
        call_type = summary.get("call_type")
        return f"Call ID={call_id} successfully created and ended with AI classification '{call_type}'"

def test_actions():
    req = urllib.request.Request(f"{BASE_URL}/actions")
    with urllib.request.urlopen(req, timeout=5) as res:
        data = json.loads(res.read())
        actions = data.get("actions", [])
        return f"Fetched {len(actions)} action items successfully"

def test_auth():
    req = urllib.request.Request(f"{BASE_URL}/auth/me")
    with urllib.request.urlopen(req, timeout=5) as res:
        data = json.loads(res.read())
        return f"Auth active={data.get('authenticated')}"

if __name__ == "__main__":
    print("\n==================================================")
    print("  KIRA AI Voice Agent — Production Test Suite")
    print(f"  Target: {BASE_URL}")
    print("==================================================")

    tests = [
        ("Health & PostgreSQL Connectivity", test_health),
        ("Root API Status", test_root),
        ("Executive Analytics Endpoint", test_analytics),
        ("Call Session & Gemini Summary Pipeline", test_call_lifecycle),
        ("Action Items & Follow-ups Feed", test_actions),
        ("Authentication Status", test_auth),
    ]

    passed = 0
    for name, func in tests:
        if run_test(name, func):
            passed += 1

    print("\n--------------------------------------------------")
    print(f"  Summary: {passed}/{len(tests)} tests passed successfully.")
    print("==================================================\n")
    if passed == len(tests):
        sys.exit(0)
    else:
        sys.exit(1)
