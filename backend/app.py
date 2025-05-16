from flask import Flask, request, jsonify
from flask_cors import CORS
from devices import get_devices as load_devices
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options as ChromeOptions
from selenium.webdriver.chrome.service import Service as ChromeService
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from dotenv import load_dotenv
import os
import time

app = Flask(__name__)
CORS(app)
chrome_driver = None

load_dotenv()
DEVICE_USERNAME = os.getenv('DEVICE_USERNAME')
DEVICE_PASSWORD = os.getenv('DEVICE_PASSWORD')

@app.route("/api/devices", methods=["POST"])
def get_devices_route():
    """Get list of available devices"""
    devices = load_devices()
    return jsonify({"devices": devices})

def setup_chrome_driver():
    """Initialize or reset Chrome WebDriver with required options"""
    global chrome_driver
    chrome_options = ChromeOptions()
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    chrome_options.add_experimental_option("detach", True)
    chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
    chrome_options.add_experimental_option('useAutomationExtension', False)
    chrome_service = ChromeService()
    chrome_driver = webdriver.Chrome(service=chrome_service, options=chrome_options)

def handle_login(username, password):
    """Handle login form submission and clean up data tabs"""
    wait = WebDriverWait(chrome_driver, 10)
    userfield = wait.until(EC.element_to_be_clickable((By.NAME, "user[name]")))
    passfield = wait.until(EC.element_to_be_clickable((By.NAME, "user[password]")))
    submit_btn = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "button[type='submit']")))
    userfield.clear()
    userfield.send_keys(username)
    passfield.clear()
    passfield.send_keys(password)
    submit_btn.click()
    time.sleep(1)
    main_handle = chrome_driver.current_window_handle
    for handle in chrome_driver.window_handles:
        if handle != main_handle:
            chrome_driver.switch_to.window(handle)
            if 'data:' in chrome_driver.current_url:
                chrome_driver.close()
    chrome_driver.switch_to.window(main_handle)

def is_browser_alive():
    """Check if browser is still responsive"""
    try:
        if chrome_driver:
            chrome_driver.current_window_handle
            return True
    except:
        return False
    return False

def ensure_browser():
    """Ensure we have a working browser instance"""
    global chrome_driver
    if not is_browser_alive():
        try:
            if chrome_driver:
                chrome_driver.quit()
        except:
            pass
        setup_chrome_driver()

@app.route("/api/open-device", methods=["POST"])
def open_device():
    """Open device in new tab and handle login if needed"""
    global chrome_driver
    data = request.get_json()
    ip = data.get("ip")
    devices = load_devices()
    device = next((d for d in devices if d["ip"] == ip), None)
    
    if not device:
        return jsonify({"error": "Device not found"}), 404
        
    try:
        ensure_browser()
        chrome_driver.execute_script(f"window.open('http://{ip}', '_blank');")
        chrome_driver.switch_to.window(chrome_driver.window_handles[-1])
        wait = WebDriverWait(chrome_driver, 15)
        wait.until(EC.presence_of_element_located((By.TAG_NAME, "body")))
        
        if "signin.php" in chrome_driver.current_url:
            handle_login(DEVICE_USERNAME, DEVICE_PASSWORD)
            wait.until(lambda d: "signin.php" not in d.current_url)
        return jsonify({"success": True})
        
    except Exception as e:
        try:
            chrome_driver.quit()
        except:
            pass
        chrome_driver = None
        
        try:
            ensure_browser()
            chrome_driver.execute_script(f"window.open('http://{ip}', '_blank');")
            chrome_driver.switch_to.window(chrome_driver.window_handles[-1])
            wait = WebDriverWait(chrome_driver, 15)
            wait.until(EC.presence_of_element_located((By.TAG_NAME, "body")))
            
            if "signin.php" in chrome_driver.current_url:
                handle_login(DEVICE_USERNAME, DEVICE_PASSWORD)
                wait.until(lambda d: "signin.php" not in d.current_url)
            return jsonify({"success": True})
            
        except Exception as retry_error:
            return jsonify({"error": "Failed to open device after retry"}), 500

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5001, debug=False)