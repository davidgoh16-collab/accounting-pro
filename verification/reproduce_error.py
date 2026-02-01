
from playwright.sync_api import sync_playwright, expect

def check_errors(page):
    # Capture console errors
    page.on("console", lambda msg: print(f"Console {msg.type}: {msg.text}") if msg.type == "error" else None)
    page.on("pageerror", lambda exc: print(f"Page Error: {exc}"))

    print("Navigating to home...")
    page.goto("http://localhost:3001")
    page.wait_for_timeout(3000)

    # Check title
    print(f"Page Title: {page.title()}")

    # Check if we are on Login or Dashboard
    if page.get_by_text("Sign in with Microsoft").is_visible():
        print("On Login Page. Attempting to click sign in...")
        # Since we use a popup, this might fail in headless or if not configured?
        # But auth is mocked in previous steps?
        # Let's check firebase.ts status.
        # It was restored to original. The original uses real firebase.
        # Wait, I restored firebase.ts. The original one requires real auth.
        # The user provided screenshot shows them logged in.
        # I need to mock auth to reproduce the internal app error.
        # Or I can try to bypass it.
        # The App.tsx has `const [user, setUser] = useState<AuthUser | null>({ ... uid: 'test-admin-uid' ... })` commented out or enabled?
        # Let's check App.tsx again.
        pass
    elif page.get_by_text("Welcome back").is_visible():
        print("On Dashboard.")
    else:
        print("Unknown state. taking screenshot.")
        page.screenshot(path="debug_state.png")

    # ... rest of navigation ...

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            check_errors(page)
        except Exception as e:
            print(f"Script Error: {e}")
        finally:
            browser.close()
