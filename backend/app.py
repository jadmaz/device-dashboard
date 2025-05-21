from flask import Flask, request, jsonify
from flask_cors import CORS
from devices import get_devices, ping_device
from browserManager import BrowserManager
from dotenv import load_dotenv
import os

app = Flask(__name__)
CORS(app)

load_dotenv()
DEVICE_USERNAME = os.getenv('DEVICE_USERNAME')
DEVICE_PASSWORD = os.getenv('DEVICE_PASSWORD')

browser_manager = BrowserManager()

@app.route("/api/devices", methods=["GET"])
def get_devices_route():
    """Get list of available devices and their ping status."""
    devices = get_devices()
    return jsonify({"devices": devices})

@app.route("/api/open-device", methods=["POST"])
def open_device():
    """Open device in new tab and handle login if needed."""
    data = request.get_json()
    ip = data.get("ip")
    devices = get_devices()
    device = next((d for d in devices if d["ip"] == ip), None)
    
    if not device:
        return jsonify({"error": "Device not found"}), 404

    try:
        browser_manager.open_device(ip, DEVICE_USERNAME, DEVICE_PASSWORD)
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/show-dashboard-in-selenium", methods=["GET"])
def show_dashboard_in_selenium_route():
    """Navigates the Selenium browser to the frontend dashboard URL."""
    try:
        frontend_dashboard_url = "http://localhost:3000/en/dashboard"
        browser_manager.navigate_to(frontend_dashboard_url)
        return jsonify({"success": True, "message": f"Selenium browser is now attempting to display: {frontend_dashboard_url}"})
    except Exception as e:
        return jsonify({"error": f"Failed to navigate Selenium to dashboard: {str(e)}"}), 500

@app.route("/api/devices/status", methods=["GET"])
def get_devices_status():
    """Get ping status for all devices."""
    try:
        devices = get_devices()
        status = {device['ip']: ping_device(device['ip']) for device in devices}
        return jsonify({"status": status})
    except Exception as e:
        print(f"Error checking status: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host='127.0.0.1', port=5001, debug=False)