from datetime import datetime, date
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Task

tasks_bp = Blueprint("tasks", __name__, url_prefix="/api/tasks")


def parse_due_date(value):
    if not value:
        return None
    return datetime.strptime(value, "%Y-%m-%d").date()


@tasks_bp.route("", methods=["GET"])
@jwt_required()
def get_tasks():
    user_id  = int(get_jwt_identity())
    status   = request.args.get("status")
    priority = request.args.get("priority")
    category = request.args.get("category")
    search   = request.args.get("search", "").strip()
    page     = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 50, type=int)

    query = Task.query.filter_by(user_id=user_id)
    if status:
        query = query.filter_by(status=status)
    if priority:
        query = query.filter_by(priority=priority)
    if category:
        query = query.filter_by(category=category)
    if search:
        query = query.filter(
            Task.title.ilike(f"%{search}%") | Task.description.ilike(f"%{search}%")
        )

    total = query.count()
    tasks = (
        query.order_by(Task.created_at.desc())
        .offset((page - 1) * per_page)
        .limit(per_page)
        .all()
    )
    return jsonify({
        "tasks":    [t.to_dict() for t in tasks],
        "total":    total,
        "page":     page,
        "per_page": per_page,
    }), 200


@tasks_bp.route("/stats", methods=["GET"])
@jwt_required()
def get_stats():
    user_id   = int(get_jwt_identity())
    today     = date.today()
    all_tasks = Task.query.filter_by(user_id=user_id).all()

    return jsonify({
        "total":       len(all_tasks),
        "pending":     sum(1 for t in all_tasks if t.status == "pending"),
        "in_progress": sum(1 for t in all_tasks if t.status == "in_progress"),
        "completed":   sum(1 for t in all_tasks if t.status == "completed"),
        "overdue":     sum(
            1 for t in all_tasks
            if t.due_date and t.due_date < today and t.status != "completed"
        ),
    }), 200


@tasks_bp.route("", methods=["POST"])
@jwt_required()
def create_task():
    user_id = int(get_jwt_identity())
    data    = request.get_json() or {}

    title = data.get("title", "").strip()
    if not title:
        return jsonify({"error": "title is required"}), 400

    task = Task(
        title=title,
        description=data.get("description", ""),
        status=data.get("status", "pending"),
        priority=data.get("priority", "medium"),
        category=data.get("category", "General"),
        due_date=parse_due_date(data.get("due_date")),
        user_id=user_id,
    )
    db.session.add(task)
    db.session.commit()
    return jsonify(task.to_dict()), 201


@tasks_bp.route("/<int:task_id>", methods=["PUT"])
@jwt_required()
def update_task(task_id):
    user_id = int(get_jwt_identity())
    task    = Task.query.filter_by(id=task_id, user_id=user_id).first()
    if not task:
        return jsonify({"error": "Task not found"}), 404

    data = request.get_json() or {}
    task.title       = data.get("title",       task.title)
    task.description = data.get("description", task.description)
    task.status      = data.get("status",      task.status)
    task.priority    = data.get("priority",    task.priority)
    task.category    = data.get("category",    task.category)
    if "due_date" in data:
        task.due_date = parse_due_date(data.get("due_date"))
    task.updated_at = datetime.utcnow()

    db.session.commit()
    return jsonify(task.to_dict()), 200


@tasks_bp.route("/<int:task_id>", methods=["DELETE"])
@jwt_required()
def delete_task(task_id):
    user_id = int(get_jwt_identity())
    task    = Task.query.filter_by(id=task_id, user_id=user_id).first()
    if not task:
        return jsonify({"error": "Task not found"}), 404

    db.session.delete(task)
    db.session.commit()
    return jsonify({"message": "Task deleted"}), 200
