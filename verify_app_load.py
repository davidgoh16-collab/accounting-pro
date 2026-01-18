from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()
    try:
        # Navigate to the local server
        print("Navigating...")
        page.goto("http://localhost:3001", timeout=60000)

        # Wait for DOM content loaded
        print("Waiting for DOM...")
        page.wait_for_load_state("domcontentloaded")

        # Wait a fixed amount just to be safe (since networkidle failed)
        page.wait_for_timeout(5000)

        # Take a screenshot
        page.screenshot(path="verification_screenshot.png")
        print("Screenshot taken successfully.")

    except Exception as e:
        print(f"Error: {e}")
    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)
