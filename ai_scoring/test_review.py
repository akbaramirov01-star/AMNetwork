"""Requests for help: intake + AI review routes, with Supabase and Claude mocked.
Run: python test_review.py"""
import os, time
os.environ["AI_REVIEW_ENABLED"] = "1"
import api, review

calls = []
def fake_svc(fn, args):
    calls.append((fn, args))
    if fn == "intake_request":
        return [{"id": "11111111-2222-3333-4444-555555555555", "ref": "AMN-2026-0007"}]
    if fn == "claim_review":
        return {"story": "x", "country": "EG"}
    return None
def fake_rpc(fn, args, user_jwt=None):
    if fn == "can_review":
        return user_jwt == "good"
    if fn == "is_admin":
        return False
    return fake_svc(fn, args)
review.svc_rpc = fake_svc
review.rpc = fake_rpc
review.review_request = lambda data: {"category": "gharimin"}

c = api.app.test_client()
base = {"city": "Alexandria", "country": "EG", "currency": "EGP", "story": "s" * 80,
        "categories": ["debt", "<script>"], "members": "4", "lang": "ar"}

r = c.post("/requests/submit", json={**base, "story": "too short"})
assert r.status_code == 400 and r.json["error"] == "story_too_short", r.json
r = c.post("/requests/submit", json={**base, "currency": ""})
assert r.status_code == 400, r.json
r = c.post("/requests/submit", json=base)
assert r.status_code == 200 and r.json["ref"] == "AMN-2026-0007", r.json
intake = [a for f, a in calls if f == "intake_request"][0]["p"]
assert intake["categories"] == ["debt"] and intake["members"] == 4 and intake["country"] == "EG", intake
time.sleep(0.3)
assert ("save_review", {"p_id": "11111111-2222-3333-4444-555555555555",
        "p_review": {"category": "gharimin"}, "p_ok": True}) in calls, calls
# 3 submissions per hour per client (the 2 rejected ones above did not count toward it? they did not reach the limiter twice)
codes = [c.post("/requests/submit", json=base).status_code for _ in range(4)]
assert 429 in codes, codes

app_id = "11111111-2222-3333-4444-555555555555"
assert c.post("/requests/review", json={"id": app_id}).status_code == 400
assert c.post("/requests/review", json={"id": app_id}, headers={"Authorization": "Bearer bad"}).status_code == 403
r = c.post("/requests/review", json={"id": app_id}, headers={"Authorization": "Bearer good"})
assert r.status_code == 200 and r.json["review"] == {"category": "gharimin"}, r.json

review.run_translate = lambda app_id, lang: "перевод"
r = c.post("/requests/translate", json={"id": app_id, "lang": "ru"}, headers={"Authorization": "Bearer good"})
assert r.status_code == 403, r.json   # may_translate is not mocked → None → forbidden
_old = review.rpc
review.rpc = lambda fn, args, user_jwt=None: True if fn == "may_translate" else _old(fn, args, user_jwt)
r = c.post("/requests/translate", json={"id": app_id, "lang": "ru"}, headers={"Authorization": "Bearer good"})
assert r.status_code == 200 and r.json["text"] == "перевод", r.json
assert c.post("/requests/translate", json={"id": app_id, "lang": "xx"}, headers={"Authorization": "Bearer good"}).status_code == 400

os.environ["AI_REVIEW_ENABLED"] = ""
assert c.post("/requests/review", json={"id": app_id}, headers={"Authorization": "Bearer good"}).status_code == 410
print("OK — request intake and AI review routes")
