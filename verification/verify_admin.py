
from playwright.sync_api import sync_playwright, expect

def verify_admin(page):
    print("Navigating to home...")
    page.goto("http://localhost:3001")

    # Wait for the Admin button (Header)
    print("Waiting for Admin button...")
    admin_btn = page.get_by_role("button", name="Admin")
    expect(admin_btn).to_be_visible(timeout=10000)
    admin_btn.click()

    # Wait for Student List
    print("Waiting for Student list...")
    # Using text locator for Alice Student
    alice_btn = page.get_by_role("button", name="Alice Student")
    expect(alice_btn).to_be_visible()
    alice_btn.click()

    # Wait for Inspector Tabs
    print("Waiting for Exam Prep tab...")
    exam_tab = page.get_by_role("button", name="Exam Prep")
    expect(exam_tab).to_be_visible()
    exam_tab.click()

    # Wait for Mock Progress Viewer content
    print("Waiting for Mock Progress content...")

    # Try finding either the populated header OR the empty state message
    try:
        expect(page.get_by_text("Exam Prep Progress")).to_be_visible(timeout=3000)
        print("Found populated state.")
    except:
        print("Populated state not found, checking for empty state...")
        expect(page.get_by_text("No exam prep started yet")).to_be_visible()
        print("Found empty state.")

    print("Taking screenshot...")
    page.screenshot(path="/home/jules/verification/admin_mock_progress.png")
    print("Screenshot saved.")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_admin(page)
        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="/home/jules/verification/error.png")
        finally:
            browser.close()
