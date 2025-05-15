import json
import os

def get_devices():
    """Load devices from JSON file in standard locations"""
    possible_paths = [
        "/Users/Shared/devices.json",
        "C:/ProgramData/devices.json",
    ]
    
    for path in possible_paths:
        try:
            if os.path.exists(path):
                with open(path, 'r') as f:
                    data = json.load(f)
                    return data.get("devices", [])
        except Exception as e:
            continue
    

    return []
