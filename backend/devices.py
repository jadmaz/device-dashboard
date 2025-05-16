import json
import os

def get_devices():
    """Load devices from JSON file"""
    json_path = "/config/devices.json"
    
    try:
        if os.path.exists(json_path):
            with open(json_path, 'r') as f:
                data = json.load(f)
                return data.get("devices", [])
    except Exception as e:
        print(f"Error loading devices: {str(e)}")
    return []
