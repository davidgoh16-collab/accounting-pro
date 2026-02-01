
from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Listen for console logs
        page.on("console", lambda msg: print(f"CONSOLE: {msg.text}"))

        try:
            page.goto("http://localhost:3002")

            # Wait for app load
            page.get_by_text("Learning Academy", exact=False).wait_for(timeout=5000)
            print("App loaded successfully.")

        except Exception as e:
            # It might timeout if login is required, but SW registration happens early
            pass

        browser.close()

if __name__ == "__main__":
    run()
