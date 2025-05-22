import logging
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.firefox.options import Options as FirefoxOptions
from selenium.webdriver.firefox.service import Service as FirefoxService
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

class BrowserManager:
    """Manages the Selenium WebDriver instance and browser operations."""
    def __init__(self, timeout=15):
        self.driver = None
        self.timeout = timeout
        self.logger = logging.getLogger(__name__)

    def get_firefox_options(self):
        """Return configured Firefox options."""
        firefox_options = FirefoxOptions()
        firefox_options.set_preference("dom.webdriver.enabled", False)
        firefox_options.set_preference("useAutomationExtension", False)
        return firefox_options

    def setup_driver(self):
        """Initialize or reset Firefox WebDriver with required options."""
        firefox_service = FirefoxService()
        firefox_options = self.get_firefox_options()
        self.driver = webdriver.Firefox(service=firefox_service, options=firefox_options)

    def is_alive(self):
        """Check if the browser is still responsive."""
        try:
            if self.driver:
                self.driver.current_window_handle
                return True
        except Exception as e:
            self.logger.warning(f"Browser is not alive: {e}")
        return False

    def ensure_browser(self):
        """Ensure there is a working browser instance."""
        if not self.is_alive():
            self.quit_driver()
            self.setup_driver()

    def quit_driver(self):
        """Quit the WebDriver instance."""
        try:
            if self.driver:
                self.driver.quit()
        except Exception as e:
            self.logger.error(f"Error while quitting driver: {e}")
        self.driver = None

    def close_unwanted_tabs(self, main_handle):
        """Close all tabs except the main handle."""
        for handle in self.driver.window_handles:
            if handle != main_handle:
                self.driver.switch_to.window(handle)
                if 'data:' in self.driver.current_url:
                    self.driver.close()
        self.driver.switch_to.window(main_handle)

    def handle_login(self, username, password):
        """Handle login form submission and clean up data tabs."""
        wait = WebDriverWait(self.driver, self.timeout)
        userfield = wait.until(EC.element_to_be_clickable((By.NAME, "user[name]")))
        passfield = wait.until(EC.element_to_be_clickable((By.NAME, "user[password]")))
        submit_btn = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "button[type='submit']")))
        userfield.clear()
        userfield.send_keys(username)
        passfield.clear()
        passfield.send_keys(password)
        submit_btn.click()
        main_handle = self.driver.current_window_handle
        self.close_unwanted_tabs(main_handle)

    def navigate_to(self, url):
        """Navigate the browser to a specific URL."""
        self.ensure_browser()
        self.driver.get(url)

    def open_device(self, ip, username, password):
        """Open a device in the browser and handle login if needed."""
        self.navigate_to(f"http://{ip}")
        wait = WebDriverWait(self.driver, self.timeout)
        wait.until(EC.presence_of_element_located((By.TAG_NAME, "body")))

        if "signin.php" in self.driver.current_url:
            self.handle_login(username, password)
            wait.until(lambda d: "signin.php" not in d.current_url)