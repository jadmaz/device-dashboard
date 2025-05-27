import json
import os
import subprocess
import platform

def get_devices():
    """Load devices from JSON file"""
    current_script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root_dir = os.path.dirname(current_script_dir)
    json_path = os.path.join(project_root_dir, "config", "devices.json")
    
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
        if platform.system().lower() == "windows":
            response = subprocess.run(
                ['ping', '-n', '1', '-w', '1000', ip],
                capture_output=True,
                timeout=2,
                creationflags=subprocess.CREATE_NO_WINDOW
            )
        else:
            response = subprocess.run(
                ['ping', '-c', '1', '-W', '1', ip],
                capture_output=True,
                timeout=2
            )
        return response.returncode == 0
    except Exception as e:
        print(f"Error pinging {ip}: {e}")
        return False