from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        print("Navigating...")
        page.goto("http://localhost:5173")
        page.wait_for_timeout(3000)

        try:
            # We should be logged in automatically as Test Student
            print("Checking dashboard...")
            assert page.is_visible('text="Welcome back, Test"')

            # Navigate to Question Practice Hub
            print("Clicking Question Practice...")
            page.click('text="Question Practice"')
            page.wait_for_timeout(1000)

            # Check Hub
            assert page.is_visible('text="Start New Session"')
            assert page.is_visible('text="Lesson Practice"')

            # Click Lesson Practice
            print("Clicking Lesson Practice...")
            page.click('text="Lesson Practice"')
            page.wait_for_timeout(1000)

            # Verify Elements
            assert page.is_visible('text="Lesson Practice"')
            assert page.is_visible('text="Upload Photo of Work"')

            print("Taking pre-switch screenshot...")
            page.screenshot(path="verification/pre_switch.png")

            # Switch to Record Existing Mark
            print("Switching mode...")
            # Use a more lenient selector
            page.click('button:has-text("Record Existing Mark")')
            page.wait_for_timeout(500)

            page.screenshot(path="verification/lesson_practice.png")
            print("Success!")
        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error_state.png")

        browser.close()

if __name__ == "__main__":
    run()
