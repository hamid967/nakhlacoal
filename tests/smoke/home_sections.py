#!/usr/bin/env python3
"""
Home page smoke test — verifies that after the BrokenGridHome merge:
  1. All 8 top-level <section> elements render inside <main>.
  2. Each section has non-zero height (nothing collapsed / missing).
  3. No network request 404s (missing assets/routes).
  4. No console errors during load + full-page scroll.

Runs on desktop + tablet + mobile viewports.

Usage:  python3 tests/smoke/home_sections.py [url]
        url defaults to http://localhost:8080/
Exit 0 on success, 1 on any failure.
"""
import asyncio
import sys
from playwright.async_api import async_playwright

URL = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8080/"
EXPECTED_SECTIONS = 8
VIEWPORTS = [
    ("mobile", 390, 844),
    ("tablet", 768, 1024),
    ("desktop", 1440, 900),
]

# Ignore known-noisy or third-party requests that don't affect Home rendering.
IGNORE_404_SUBSTR = (
    "favicon",
    "hot-update",
    "chrome-extension",
    "google-analytics",
    "googletagmanager",
    "gstatic",
    "cloudflareinsights",
)


async def audit(browser, name, w, h):
    ctx = await browser.new_context(viewport={"width": w, "height": h})
    page = await ctx.new_page()

    failed_requests: list[str] = []
    console_errors: list[str] = []

    def on_response(resp):
        if resp.status >= 400 and not any(s in resp.url for s in IGNORE_404_SUBSTR):
            failed_requests.append(f"{resp.status} {resp.url}")

    def on_console(msg):
        if msg.type == "error":
            text = msg.text
            # Ignore benign React Router future-flag / dev warnings.
            if "React Router Future Flag" in text:
                return
            console_errors.append(text)

    page.on("response", on_response)
    page.on("console", on_console)

    await page.goto(URL, wait_until="networkidle")
    await page.wait_for_timeout(800)

    # Scroll to force any lazy sections to mount.
    total = await page.evaluate("document.body.scrollHeight")
    for i in range(11):
        await page.evaluate(f"window.scrollTo(0, {int(total * i / 10)})")
        await page.wait_for_timeout(120)
    await page.evaluate("window.scrollTo(0, 0)")
    await page.wait_for_timeout(300)

    heights = await page.evaluate(
        """() => [...document.querySelectorAll('main > section')]
              .map(s => Math.round(s.getBoundingClientRect().height))"""
    )

    errors: list[str] = []
    if len(heights) != EXPECTED_SECTIONS:
        errors.append(
            f"expected {EXPECTED_SECTIONS} <main > section>, got {len(heights)}"
        )
    zero = [i for i, hgt in enumerate(heights) if hgt < 40]
    if zero:
        errors.append(f"collapsed sections at indices {zero} (heights={heights})")
    if failed_requests:
        errors.append("failed requests:\n    " + "\n    ".join(failed_requests[:10]))
    if console_errors:
        errors.append("console errors:\n    " + "\n    ".join(console_errors[:10]))

    status = "✓" if not errors else "✗"
    print(f"\n[{name} {w}x{h}] {status} sections={len(heights)} heights={heights}")
    for e in errors:
        print(f"   - {e}")

    await ctx.close()
    return not errors


async def main():
    ok = True
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        for name, w, h in VIEWPORTS:
            ok = (await audit(browser, name, w, h)) and ok
        await browser.close()
    if not ok:
        print("\n✗ Home sections smoke failed")
        sys.exit(1)
    print("\n✓ Home sections smoke passed on all viewports")


asyncio.run(main())
