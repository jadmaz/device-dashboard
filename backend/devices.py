import json
import os
import subprocess

def get_devices():
    """Load devices from JSON file"""
    json_path = "../config/devices.json"
    
    try:
        if os.path.exists(json_path):
            with open(json_path, 'r') as f:
                data = json.load(f)
                return data.get("devices", [])
    except Exception as e:
        print(f"Error loading devices: {str(e)}")
    return []

def ping_device(ip):
    """Ping a device and return True if reachable, False otherwise."""
    try:
        response = subprocess.run(
            ['ping', '-c', '1', '-W', '1', ip], 
            capture_output=True, 
            timeout=1
        )
        return response.returncode == 0
    except:
        return False