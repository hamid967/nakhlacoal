"""
Smoke test: /admin loads end-to-end.

Unauthenticated visitors must be bounced to /auth (ProtectedRoute behavior),
which proves the route is wired, the bundle compiled, and the SPA hydrated.
"""
import asyncio
from pathlib import Path
from playwright.async_api import async_playwright

SCREENSHOTS = Path(__file__).parent / "screenshots"
SCREENSHOTS.mkdir(parents=True, exist_ok=True)

BASE = "http://localhost:8080"


async def main() -> None:
    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=True)
        context = await browser.new_context(viewport={"width": 1280, "height": 1800})
        page = await context.new_page()

        console_errors: list[str] = []
        page.on("console", lambda m: console_errors.append(m.text) if m.type == "error" else None)

        resp = await page.goto(f"{BASE}/admin", wait_until="domcontentloaded")
        assert resp is not None, "no response from /admin"
        assert resp.status < 400, f"/admin returned HTTP {resp.status}"

        # Wait for ProtectedRoute to resolve auth state and redirect.
        await page.wait_for_url("**/auth**", timeout=15_000)
        await page.wait_for_load_state("networkidle")
        await page.screenshot(path=str(SCREENSHOTS / "admin_redirect.png"))

        assert "/auth" in page.url, f"expected redirect to /auth, got {page.url}"
        assert "from=" in page.url, f"expected ?from= preservation, got {page.url}"

        # SPA actually hydrated — root has children.
        root_children = await page.evaluate("document.getElementById('root')?.children.length ?? 0")
        assert root_children > 0, "React root never hydrated"

        # No runtime console errors from the admin bundle.
        fatal = [e for e in console_errors if "Failed to load resource" not in e]
        assert not fatal, f"console errors during /admin load: {fatal}"

        print(f"OK: /admin smoke passed (final url: {page.url})")
        await browser.close()


asyncio.run(main())
