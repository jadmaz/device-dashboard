from flask import Flask, request, jsonify, make_response, Response
import requests
from flask_cors import CORS
import uuid
from bs4 import BeautifulSoup
from auth import check_credentials
from devices import get_devices_for_user, add_device_to_user
from urllib.parse import urlparse, parse_qs, urlencode, urlunparse
import time
import hashlib
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options as ChromeOptions
from selenium.webdriver.firefox.options import Options as FirefoxOptions
from selenium.webdriver.firefox.service import Service as FirefoxService
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

app = Flask(__name__)
CORS(app)

device_sessions = {}
DEBUG_MODE = True  # Add this to control debug output

def sha256(data):
    return hashlib.sha256(data.encode('utf-8')).hexdigest()

@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")
    if check_credentials(username, password):
        return jsonify({"success": True})
    return jsonify({"success": False, "error": "Invalid credentials"}), 401

@app.route("/api/devices", methods=["POST"])
def get_devices():
    data = request.get_json()
    username = data.get("username")
    devices = get_devices_for_user(username)
    return jsonify({"devices": devices})

@app.route("/api/add-device", methods=["POST"])
def add_device():
    data = request.get_json()
    username = data.get("username")
    device = data.get("device")
    success = add_device_to_user(username, device)
    return jsonify({"success": success})

@app.route("/api/open-device", methods=["POST"])
def open_device():
    try:
        data = request.get_json()
        ip = data.get("ip")
        username = data.get("username")
        password = data.get("password")

        # Setup Firefox with optimized options
        firefox_options = FirefoxOptions()
        firefox_options.add_argument("--no-sandbox")
        firefox_options.set_preference("detach", True)
        firefox_options.set_preference("dom.webdriver.enabled", False)
        firefox_options.set_preference("useAutomationExtension", False)
        firefox_options.set_preference("network.http.pipelining", True)
        firefox_options.set_preference("network.http.proxy.pipelining", True)
        firefox_options.set_preference("network.http.max-connections", 256)
        firefox_options.set_preference("browser.cache.disk.enable", False)
        firefox_options.set_preference("browser.cache.memory.enable", False)
        
        driver = webdriver.Firefox(options=firefox_options)
        driver.set_page_load_timeout(10)
        
        # Execute login script directly
        login_script = f"""
            document.getElementsByName('user[name]')[0].value = '{username}';
            document.getElementsByName('user[password]')[0].value = '{password}';
            document.querySelector("button[type='submit']").click();
        """
        
        # Navigate and execute script
        login_url = f"http://{ip}/sdcard/cpt/app/signin.php"
        driver.get(login_url)
        driver.execute_script(login_script)
        
        # Wait for redirect with shorter timeout
        WebDriverWait(driver, 5).until(
            lambda x: "/graphic.php" in x.current_url
        )
        
        final_url = driver.current_url
        cookies = driver.get_cookies()
        
        return jsonify({
            "success": True,
            "url": final_url,
            "cookies": cookies
        })

    except Exception as e:
        if driver:
            try:
                driver.quit()
            except:
                pass
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route("/api/close-device", methods=["POST"])
def close_device():
    try:
        data = request.get_json()
        session_id = data.get("sessionId")
        
        if session_id in device_sessions:
            driver = device_sessions[session_id]['driver']
            try:
                driver.quit()
            except:
                pass
            finally:
                del device_sessions[session_id]
            return jsonify({"success": True})
            
        return jsonify({"success": False, "error": "Session not found"}), 404
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route("/api/hash", methods=["POST"])
def compute_hash():
    try:
        data = request.get_json()
        password = data['password']
        token1 = data['token1']
        token2 = data['token2']
        
        # Generate hash using the same algorithm as the device
        hash1 = sha256(password + token1)
        final_hash = sha256(hash1 + token2)
        
        return jsonify({"hash": final_hash})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
