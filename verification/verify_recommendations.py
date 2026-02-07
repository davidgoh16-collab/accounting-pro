from playwright.sync_api import Page, expect, sync_playwright

def test_smart_recommendations(page: Page):
    # 1. Go to the dashboard.
    page.goto("http://localhost:3000/")

    # 2. Wait for the dashboard to load.
    # The dashboard has "Welcome back" text.
    expect(page.get_by_text("Welcome back")).to_be_visible(timeout=10000)

    # 3. Check for "Focus Required" card.
    # The component renders "Focus Required" if there are low scores.
    # We mocked one assessment with 45%.
    expect(page.get_by_text("Focus Required")).to_be_visible()

    # Check for the topic name "Physical Landscapes: Coasts"
    expect(page.get_by_text("Physical Landscapes: Coasts")).to_be_visible()

    # Check for percentage "45%"
    expect(page.get_by_text("45%")).to_be_visible()

    # 4. Take a screenshot.
    page.screenshot(path="verification/verification_recommendations.png", full_page=True)

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            test_smart_recommendations(page)
            print("Verification successful!")
        except Exception as e:
            print(f"Verification failed: {e}")
            page.screenshot(path="verification/verification_failed.png")
        finally:
            browser.close()
