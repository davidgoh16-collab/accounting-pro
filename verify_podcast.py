
from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()
    try:
        # Navigate to the local server
        print("Navigating...")
        page.goto("http://localhost:3002", timeout=60000)

        # Wait for DOM content loaded
        print("Waiting for DOM...")
        page.wait_for_load_state("domcontentloaded")
        page.wait_for_timeout(3000)

        # Take a screenshot
        page.screenshot(path="verification_screenshot_podcast.png")
        print("Screenshot taken successfully.")

    except Exception as e:
        print(f"Error: {e}")
    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)
