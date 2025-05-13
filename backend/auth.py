import json
import os

DATA_FILE = os.path.join(os.path.dirname(__file__), "data", "users.json")


def load_users():
    if not os.path.exists(DATA_FILE):
        return []

    with open(DATA_FILE, "r") as f:
        return json.load(f).get("users", [])


def find_user_by_username(username):
    users = load_users()
    for user in users:
        if user["username"] == username:
            return user
    return None


def check_credentials(username, password):
    user = find_user_by_username(username)
    if user and user["password"] == password:
        return True
    return False
