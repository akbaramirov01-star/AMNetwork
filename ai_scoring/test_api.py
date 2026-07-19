"""
End-to-end test for api.py — starts the real Flask server, sends real HTTP
requests to it, and asserts on the real responses. Not mocked.

Run: python test_api.py
"""
import subprocess
import sys
import time
import urllib.request
import urllib.error
import json
import os

BASE = "http://127.0.0.1:8000"


def request(path, payload=None):
    url = BASE + path
    if payload is None:
        req = urllib.request.Request(url)
    else:
        data = json.dumps(payload).encode()
        req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"}, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=5) as resp:
            return resp.status, json.loads(resp.read())
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read())


def wait_for_server(timeout=10):
    start = time.time()
    while time.time() - start < timeout:
        try:
            request("/health")
            return True
        except Exception:
            time.sleep(0.3)
    return False


def main():
    env = os.environ.copy()
    server = subprocess.Popen(
        [sys.executable, "api.py"],
        cwd=os.path.dirname(os.path.abspath(__file__)),
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        env=env,
    )
    checks_passed = 0
    checks_total = 0

    def check(label, cond):
        nonlocal checks_passed, checks_total
        checks_total += 1
        status = "PASS" if cond else "FAIL"
        print(f"[{status}] {label}")
        if cond:
            checks_passed += 1

    try:
        if not wait_for_server():
            print("Server did not start in time")
            sys.exit(1)

        status, body = request("/health")
        check("GET /health returns 200", status == 200)
        check("GET /health reports ok status", body.get("status") == "ok")

        status, body = request("/score", {})
        check("POST /score with no country -> 400", status == 400)

        status, body = request("/score", {"country": "EG", "asset_level": "not_a_real_value"})
        check("POST /score with bad enum -> 400", status == 400)

        refugee_widow = {
            "name": "Test Refugee Widow",
            "country": "SY",
            "monthly_income_usd": 0,
            "months_without_income": 8,
            "family_size": 5,
            "num_dependents": 4,
            "num_minor_children": 3,
            "is_widow": True,
            "is_sole_breadwinner": True,
            "is_refugee": True,
            "asset_level": "no_assets_no_savings",
            "housing_status": "refugee_camp",
            "employment_status": "none",
            "crisis_type": "death_or_incapacity_of_breadwinner",
            "is_food_insecure": True,
            "documents_verified": True,
            "local_oracle_confirmed": True,
        }
        status, body = request("/score", refugee_widow)
        check("POST /score refugee widow -> 200", status == 200)
        check("refugee widow scores CRITICAL tier", body.get("priority_tier") == "CRITICAL")
        check("refugee widow score >= 75", body.get("final_score", 0) >= 75)
        check("Ibn Al-Sabil category matched", any("Ibn Al-Sabil" in c for c in body.get("asnaf_categories", [])))

        wealthy = {
            "name": "Test Wealthy Applicant",
            "country": "AE",
            "monthly_income_usd": 15000,
            "asset_level": "above_nisab_threshold",
            "employment_status": "full_time",
            "housing_status": "owned_stable",
        }
        status, body = request("/score", wealthy)
        check("POST /score wealthy applicant -> 200", status == 200)
        check("wealthy applicant scores INELIGIBLE", body.get("priority_tier") == "INELIGIBLE")
        check("wealthy applicant flagged for fraud/verification", len(body.get("fraud_flags", [])) > 0)

        print(f"\n{checks_passed}/{checks_total} checks passed")
        if checks_passed != checks_total:
            sys.exit(1)
    finally:
        server.terminate()
        server.wait(timeout=5)


if __name__ == "__main__":
    main()
