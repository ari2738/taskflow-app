import urllib.request, json, time

BASE = "http://localhost:5000/api"

def post(path, body, token=None):
    data = json.dumps(body).encode()
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    req = urllib.request.Request(f"{BASE}{path}", data=data, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req) as r:
            return r.status, json.loads(r.read())
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read())

def get(path, token, params=""):
    req = urllib.request.Request(
        f"{BASE}{path}{params}",
        headers={"Authorization": f"Bearer {token}"}
    )
    try:
        with urllib.request.urlopen(req) as r:
            return r.status, json.loads(r.read())
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read())

def delete(path, token):
    req = urllib.request.Request(
        f"{BASE}{path}",
        headers={"Authorization": f"Bearer {token}"},
        method="DELETE"
    )
    try:
        with urllib.request.urlopen(req) as r:
            return r.status, json.loads(r.read())
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read())

OK  = "\033[92m OK\033[0m"
ERR = "\033[91m FAIL\033[0m"

print("=" * 55)
print("  FULL API TEST")
print("=" * 55)

# ── 1. Register ──────────────────────────────────────────
print("\n[1] REGISTER")
email = f"tester_{int(time.time())}@test.com"
s, r = post("/auth/register", {"name": "Test User", "email": email, "password": "pass123"})
if s == 201:
    print(f"  {OK}  user={r['user']['name']}  id={r['user']['id']}")
    token = r["token"]
else:
    print(f"  {ERR}  {r}")
    exit(1)

# ── 2. Create task ───────────────────────────────────────
print("\n[2] CREATE TASK")
s, r = post("/tasks", {
    "title": "Finish ML assignment",
    "description": "Complete chapters 4-6",
    "status": "pending",
    "priority": "high",
    "category": "College",
    "due_date": "2026-07-10"
}, token)
if s == 201:
    task_id = r["id"]
    print(f"  {OK}  id={task_id}  title={r['title']}  priority={r['priority']}  category={r['category']}")
else:
    print(f"  {ERR}  {r}")
    exit(1)

# ── 3. Get tasks ─────────────────────────────────────────
print("\n[3] GET TASKS")
s, r = get("/tasks", token)
if s == 200 and r["total"] >= 1:
    titles = [t["title"] for t in r["tasks"]]
    print(f"  {OK}  total={r['total']}  tasks={titles}")
else:
    print(f"  {ERR}  {r}")

# ── 4. Stats ─────────────────────────────────────────────
print("\n[4] GET STATS")
s, r = get("/tasks/stats", token)
if s == 200:
    print(f"  {OK}  {r}")
else:
    print(f"  {ERR}  {r}")

# ── 5. Update task ───────────────────────────────────────
print("\n[5] UPDATE TASK (status → in_progress)")
req = urllib.request.Request(
    f"{BASE}/tasks/{task_id}",
    data=json.dumps({"status": "in_progress"}).encode(),
    headers={"Content-Type": "application/json", "Authorization": f"Bearer {token}"},
    method="PUT"
)
try:
    with urllib.request.urlopen(req) as resp:
        s, r = resp.status, json.loads(resp.read())
except urllib.error.HTTPError as e:
    s, r = e.code, json.loads(e.read())
if s == 200 and r["status"] == "in_progress":
    print(f"  {OK}  new status={r['status']}")
else:
    print(f"  {ERR}  {r}")

# ── 6. AI Suggest ────────────────────────────────────────
print("\n[6] AI SUGGEST")
s, r = post("/ai/suggest", {"title": "Prepare for data structures viva"}, token)
if s == 200:
    print(f"  {OK}")
    print(f"       desc    : {r.get('description', '')[:80]}...")
    print(f"       due_date: {r.get('due_date', '')}")
elif s == 503:
    print(f"  SKIP  (API key not set — {r.get('error')})")
else:
    print(f"  {ERR}  {r}")

# ── 7. AI Chat ───────────────────────────────────────────
print("\n[7] AI CHAT")
s, r = post("/ai/chat", {"message": "What is my highest priority task?"}, token)
if s == 200:
    print(f"  {OK}")
    print(f"       reply: {r.get('reply', '')[:120]}...")
elif s == 503:
    print(f"  SKIP  (API key not set)")
else:
    print(f"  {ERR}  {r}")

# ── 8. Delete task ───────────────────────────────────────
print("\n[8] DELETE TASK")
s, r = delete(f"/tasks/{task_id}", token)
if s == 200:
    print(f"  {OK}  {r}")
else:
    print(f"  {ERR}  {r}")

print("\n" + "=" * 55)
print("  TEST COMPLETE")
print("=" * 55)
