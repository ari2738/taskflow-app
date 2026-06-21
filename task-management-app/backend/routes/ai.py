import os
import json
from datetime import date
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import Task

ai_bp = Blueprint("ai", __name__, url_prefix="/api/ai")


def get_gemini_model():
    api_key = os.environ.get("GEMINI_API_KEY", "").strip()
    if not api_key or api_key == "your-gemini-api-key-here":
        return None
    try:
        import google.generativeai as genai
        genai.configure(api_key=api_key)
        return genai.GenerativeModel("gemini-2.5-flash")
    except Exception:
        return None


@ai_bp.route("/suggest", methods=["POST"])
@jwt_required()
def suggest_task():
    data  = request.get_json() or {}
    title = data.get("title", "").strip()
    if not title:
        return jsonify({"error": "title is required"}), 400

    model = get_gemini_model()
    if not model:
        return jsonify({"error": "Gemini API key not configured"}), 503

    today  = date.today().isoformat()
    prompt = (
        f"Today is {today}. A user wants to create a task titled: \"{title}\".\n"
        "Respond with a JSON object (no markdown, no code fences) with exactly two keys:\n"
        "  \"description\": a concise actionable 1-2 sentence description,\n"
        "  \"due_date\": a realistic due date in YYYY-MM-DD format (1-30 days from today).\n"
        "Return ONLY raw JSON."
    )

    try:
        response = model.generate_content(prompt)
        raw = response.text.strip()
        # Strip markdown fences if Gemini wraps in ```json ... ```
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        suggestion = json.loads(raw.strip())
        return jsonify({
            "description": suggestion.get("description", ""),
            "due_date":    suggestion.get("due_date", ""),
        }), 200
    except Exception as e:
        return jsonify({"error": f"AI suggestion failed: {str(e)}"}), 500


@ai_bp.route("/chat", methods=["POST"])
@jwt_required()
def chat():
    user_id = int(get_jwt_identity())
    data    = request.get_json() or {}
    message = data.get("message", "").strip()
    if not message:
        return jsonify({"error": "message is required"}), 400

    model = get_gemini_model()
    if not model:
        return jsonify({"error": "Gemini API key not configured"}), 503

    tasks = Task.query.filter_by(user_id=user_id).order_by(Task.created_at.desc()).limit(50).all()
    today = date.today()

    if tasks:
        lines = []
        for t in tasks:
            overdue = " [OVERDUE]" if (t.due_date and t.due_date < today and t.status != "completed") else ""
            lines.append(
                f"- [{t.status.upper()}][{t.priority.upper()}] {t.title}"
                f"{(' – due ' + t.due_date.isoformat()) if t.due_date else ''}"
                f"{overdue}"
                f"{(' – ' + t.category) if t.category else ''}"
            )
        task_summary = "\n".join(lines)
    else:
        task_summary = "No tasks yet."

    prompt = (
        f"You are a helpful productivity assistant inside a Task Management app.\n"
        f"Today is {today.isoformat()}.\n"
        f"The user's tasks:\n{task_summary}\n\n"
        f"Answer concisely (under 150 words unless asked for more).\n"
        f"User: {message}\nAssistant:"
    )

    try:
        response = model.generate_content(prompt)
        return jsonify({"reply": response.text.strip()}), 200
    except Exception as e:
        return jsonify({"error": f"Chat failed: {str(e)}"}), 500
