from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        try:
            page.goto("http://localhost:5173", timeout=60000)

            # Wait for dashboard
            page.wait_for_selector("text=Learning & Progress", timeout=30000)

            # Click "My Assessments" card
            # Looking for the card with "My Assessments" title
            page.click("text=My Assessments")

            # Wait for Assessment Hub
            page.wait_for_selector("text=Assessment History", timeout=30000)

            time.sleep(2)
            page.screenshot(path="verification_assessment_hub.png", full_page=True)
            print("Screenshot taken: verification_assessment_hub.png")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="error_assessment_hub.png")

        finally:
            browser.close()

if __name__ == "__main__":
    run()
