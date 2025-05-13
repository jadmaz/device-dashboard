from flask import Flask, request, jsonify, make_response, Response
import requests
from flask_cors import CORS
import uuid
from bs4 import BeautifulSoup
from auth import check_credentials
from devices import get_devices_for_user, add_device_to_user
from urllib.parse import urlparse, parse_qs, urlencode, urlunparse

app = Flask(__name__)
CORS(app)

device_sessions = {}

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
    email = data.get("email")
    device = data.get("device")
    success = add_device_to_user(email, device)
    return jsonify({"success": success})

@app.route("/api/open-device", methods=["POST"])
def open_device():
    try:
        import hashlib
        data = request.get_json()
        ip = data["ip"]
        username = data["username"]
        password = data["password"]

        print(f"\n🔐 Attempting login for {username} on {ip}")

        headers = {
            "User-Agent": "Mozilla/5.0",
            "Accept": "application/json, text/javascript, */*; q=0.01",
            "X-Requested-With": "XMLHttpRequest",
            "Referer": f"http://{ip}/sdcard/cpt/app/signin.php",
            "Origin": f"http://{ip}"
        }

        session = requests.Session()
        token_url = f"http://{ip}/sdcard/cpt/app/signin.php"
        print(f"🌐 Fetching token from: {token_url}")

        token_response = session.get(token_url, params={"user[name]": username}, headers=headers, verify=False)

        try:
            auth_token_data = token_response.json()
            auth_token = auth_token_data.get("authToken")
            print(f"🆔 Received authToken: {auth_token}")
        except Exception as e:
            print(f"❌ Failed to parse token JSON: {e}")
            return jsonify({"success": False, "error": "Invalid JSON from device"}), 500

        if not auth_token or "_" not in auth_token:
            print("❌ Missing or malformed authToken")
            return jsonify({"success": False, "error": "Missing or invalid authToken"}), 403

        token1, token2 = auth_token.split("_")

        def sha256(text):
            return hashlib.sha256(text.encode("utf-8")).hexdigest()

        auth_hash = sha256(sha256(password + token1) + token2)
        print("🔐 Computed authHash, logging in...")

        login_data = {
            "user[name]": username,
            "user[authHash]": auth_hash,
            "remember_me": "false"
        }

        session.post(token_url, data=login_data, headers=headers, verify=False)
        print("✅ Login POST sent")

        # Trigger session and verify login succeeded
        check = session.get(f"http://{ip}/sdcard/cpt/app/graphic.php", headers=headers, verify=False)
        print(f"🔁 Final check redirected to: {check.url}")
        if "signin.php" in check.url:
            print("❌ Login failed: redirected back to signin")
            return jsonify({"success": False, "error": "Login failed (redirected to signin)"}), 403

        token = str(uuid.uuid4())
        device_sessions[token] = {"ip": ip, "session": session, "token": token}
        cpt_cookie = session.cookies.get_dict().get("CPTSESSID")

        print("✅ Login success")
        print(f"🧾 Session token: {token}")
        print(f"🍪 CPTSESSID cookie: {cpt_cookie}")

        return jsonify({
            "success": True,
            "token": token,
            "cookie": cpt_cookie,
            "ip": ip
        })

    except Exception as e:
        print(f"❌ Exception during login: {e}")
        return jsonify({"success": False, "error": str(e)}), 500



def is_safe_static_file(path):
    return any(path.endswith(ext) for ext in [
        ".js", ".css", ".png", ".jpg", ".jpeg", ".gif", ".svg", ".woff", ".ttf"
    ])

def is_dynamic_php_page(path):
    return path.endswith(".php")

def add_token_to_url(url, token):
    parsed = urlparse(url)
    qs = parse_qs(parsed.query)
    qs["token"] = token
    new_query = urlencode(qs, doseq=True)
    return urlunparse(parsed._replace(query=new_query))

# Add this new route to handle direct redirection with token
@app.route("/proxy/<ip>/sdcard/cpt/app/grdata.php")
def grdata_redirect(ip):
    # Get most recent token if available
    if device_sessions:
        # Use the most recently created token
        token = list(device_sessions.keys())[-1]
        # Reconstruct the URL with the token
        query_string = request.query_string.decode('utf-8')
        if query_string:
            new_url = f"/proxy/{ip}/sdcard/cpt/app/grdata.php?{query_string}&token={token}"
        else:
            new_url = f"/proxy/{ip}/sdcard/cpt/app/grdata.php?token={token}"
        
        # Redirect to the same URL but with token
        print(f"🔄 Redirecting to grdata.php with token: {new_url}")
        return f'<script>window.location.href = "{new_url}";</script>'
    
    return "No active sessions available", 403

@app.route("/proxy/<ip>/<path:subpath>", methods=["GET", "POST"])
def proxy(ip, subpath):
    token = request.args.get("token")
    target_url = f"http://{ip}/{subpath}"

    print("➡️ Requesting:", target_url)
    print("➡️ Token:", token)
    print("➡️ Available sessions:", list(device_sessions.keys()))

    # Special handling for grdata.php requests (ensure they always have a token)
    if "grdata.php" in subpath and not token and device_sessions:
        # Use the most recently created token
        token = list(device_sessions.keys())[-1]
        print(f"🔍 Auto-adding token {token} to grdata.php request")
    
    # 1. Serve static files (no session needed)
    if is_safe_static_file(subpath):
        try:
            resp = requests.get(target_url, stream=True)
            excluded_headers = ["content-encoding", "content-length", "transfer-encoding", "connection"]
            headers = [(k, v) for k, v in resp.headers.items() if k.lower() not in excluded_headers]
            return Response(resp.iter_content(chunk_size=8192), status=resp.status_code, headers=headers)
        except Exception as e:
            return f"Static file proxy error: {e}", 500

    # 2. Validate token/session
    if not token or token not in device_sessions:
        if "grdata.php" in subpath:
            print("⚠️ Missing token for grdata.php request. Checking for any active sessions...")
            if device_sessions:
                # Use the most recently created token
                token = list(device_sessions.keys())[-1]
                print(f"✅ Using existing session token: {token}")
            else:
                print("⚠️ No active sessions found. Login required.")
                return "Login required. No active sessions.", 403
        else:
            print("⚠️ Session not found. Attempting auto-login...")
            return "Missing or invalid token", 403

    session = device_sessions[token]["session"]

    try:
        # Fallback: auto-add token to grdata.php if missing
        if "grdata.php" in subpath and "token=" not in target_url and token:
            target_url = add_token_to_url(target_url, token)
            print(f"🔁 Injected token into grdata.php request: {target_url}")

        resp = session.get(target_url)
        content_type = resp.headers.get("Content-Type", "")

        # 3. Rewrite HTML content
        if "text/html" in content_type:
            soup = BeautifulSoup(resp.text, "html.parser")

            for tag in soup.find_all(["script", "link", "img", "iframe"]):
                attr = "src" if tag.name in ["script", "img", "iframe"] else "href"
                if tag.has_attr(attr):
                    original = tag[attr]
                    if not original.startswith("http"):
                        parsed = urlparse(original.lstrip("./"))
                        path = parsed.path
                        query = parsed.query

                        if is_safe_static_file(path) or path.startswith(("js/", "css/", "images/")):
                            proxied_base = f"/proxy/{ip}/sdcard/cpt/{path}"
                        else:
                            proxied_base = f"/proxy/{ip}/sdcard/cpt/app/{path}"

                        proxied_url = f"{proxied_base}?{query}" if query else proxied_base
                        if is_dynamic_php_page(path):
                            proxied_url = add_token_to_url(proxied_url, token)

                        tag[attr] = proxied_url
                        print(f"🔗 Rewritten {attr} = {tag[attr]}")

            # 4. Patch inline JS: rewrite grdata.php calls
            # Rewrite any occurrence of grdata.php inside inline JS (even with + or variables)
            for script_tag in soup.find_all("script"):
                if script_tag.string and "grdata.php" in script_tag.string:
                    print("🛠️ Rewriting JS calls to grdata.php")
                    old = script_tag.string

                    # Match both 'grdata.php and "grdata.php regardless of what follows
                    new = old.replace(
                        '"grdata.php',
                        f'"/proxy/{ip}/sdcard/cpt/app/grdata.php?token={token}'
                    ).replace(
                        "'grdata.php",
                        f"'/proxy/{ip}/sdcard/cpt/app/grdata.php?token={token}"
                    )

                    script_tag.string = new
                    print("📄 JS patched:")
                    print(new[:300])  # show preview

            # 5. Add auto-inject script that will add tokens to AJAX requests
            token_script = soup.new_tag("script")
            token_script.string = f"""
            // Auto-inject token for AJAX requests to grdata.php
            (function() {{
                var originalOpen = XMLHttpRequest.prototype.open;
                XMLHttpRequest.prototype.open = function() {{
                    originalOpen.apply(this, arguments);
                    var url = arguments[1];
                    if (url && url.includes('grdata.php') && !url.includes('token=')) {{
                        // Add token to URL
                        var separator = url.includes('?') ? '&' : '?';
                        this._tokenUrl = url + separator + 'token={token}';
                        var self = this;
                        this.addEventListener('readystatechange', function() {{
                            if (self.readyState === 1) {{
                                if (self._tokenUrl) {{
                                    self.abort();
                                    originalOpen.call(self, arguments[0], self._tokenUrl, arguments[2], arguments[3], arguments[4]);
                                    delete self._tokenUrl;
                                }}
                            }}
                        }}, false);
                    }}
                }};
            }})();
            """
            soup.head.append(token_script)

            return Response(str(soup), status=resp.status_code, content_type=content_type)

        # 6. Other content (JSON, XML, etc.)
        excluded_headers = ["content-encoding", "content-length", "transfer-encoding", "connection"]
        headers = [(k, v) for k, v in resp.headers.items() if k.lower() not in excluded_headers]
        return Response(resp.content, status=resp.status_code, headers=headers)

    except Exception as e:
        return f"Proxy error: {e}", 500
