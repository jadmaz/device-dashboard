import json
import os

DATA_FILE = os.path.join(os.path.dirname(__file__), "data", "users.json")


def load_data():
    if not os.path.exists(DATA_FILE):
        return {"users": []}

    with open(DATA_FILE, "r") as f:
        return json.load(f)


def save_data(data):
    with open(DATA_FILE, "w") as f:
        json.dump(data, f, indent=2)


def get_devices_for_user(username):
    data = load_data()
    for user in data["users"]:
        if user["username"] == username:
            return user.get("devices", [])
    return []


def add_device_to_user(email, device):
    data = load_data()
    for user in data["users"]:
        if user["email"] == email:
            if "devices" not in user:
                user["devices"] = []
            user["devices"].append(device)
            save_data(data)
            return True
    return False
