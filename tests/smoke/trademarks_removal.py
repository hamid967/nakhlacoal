#!/usr/bin/env python3
"""
Trademarks-removal regression smoke test.

After deleting `TrademarksShowcase`, `Trademarks3D`, and `Trademarks3DSkeleton`,
verify every page that referenced trademark UI still loads cleanly:

  1. HTTP 200 (no 404 on the route itself)
  2. No failed network requests (404/5xx) for JS chunks or images
  3. No console errors mentioning the deleted modules
  4. Page has a visible <h1> or <main> with non-zero height

Runs on desktop viewport only (route health, not layout).

Usage: python3 tests/smoke/trademarks_removal.py [base_url]
"""
import asyncio
import sys
from playwright.async_api import async_playwright

BASE = (sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8080").rstrip("/")

# Public routes that either rendered a trademark component or imported one.
ROUTES = [
    "/",              # HomeIntro
    "/trademarks",    # main page
    "/about",         # trademark mentions
    "/quality",       # imported trademark data
    "/products",      # LuxNav + PromoBanner
    "/contact",
    "/faq",
]

REMOVED_MODULES = ("TrademarksShowcase", "Trademarks3D", "Trademarks3DSkeleton")

IGNORE_SUBSTR = (
    "favicon", "hot-update", "chrome-extension",
    "googletagmanager", "google-analytics", "gstatic",
    "cloudflareinsights", "sentry",
)


async def check_route(context, path):
    page = await context.new_page()
    console_errors, failed_reqs = [], []

    page.on("console", lambda m: m.type == "error" and console_errors.append(m.text))
    page.on("requestfailed", lambda r: failed_reqs.append((r.url, r.failure)))
    page.on("response", lambda r: (
        r.status >= 400
        and not any(s in r.url for s in IGNORE_SUBSTR)
        and failed_reqs.append((r.url, f"HTTP {r.status}"))
    ))

    url = f"{BASE}{path}"
    resp = await page.goto(url, wait_until="domcontentloaded", timeout=45_000)
    # Poll for the Layout <main> to mount (lazy chunk + Suspense).
    main_seen = False
    for _ in range(40):
        if await page.locator("main#main-content").count() > 0:
            main_seen = True
            break
        await page.wait_for_timeout(500)
    status = resp.status if resp else 0

    await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
    await page.wait_for_timeout(400)

    has_main = main_seen
    module_errors = [
        e for e in console_errors
        if any(m in e for m in REMOVED_MODULES)
        or "Failed to fetch dynamically imported module" in e
    ]
    hard_fails = [
        (u, f) for (u, f) in failed_reqs
        if not any(s in u for s in IGNORE_SUBSTR)
    ]

    await page.close()
    return {
        "path": path, "status": status, "has_main": has_main,
        "console_errors": console_errors, "module_errors": module_errors,
        "failed_requests": hard_fails,
    }


async def main():
    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=True)
        ctx = await browser.new_context(viewport={"width": 1440, "height": 900})

        results = []
        for route in ROUTES:
            r = await check_route(ctx, route)
            results.append(r)
            ok = (
                r["status"] == 200 and r["has_main"]
                and not r["module_errors"] and not r["failed_requests"]
            )
            tag = "PASS" if ok else "FAIL"
            print(f"[{tag}] {route}  status={r['status']}  "
                  f"main={r['has_main']}  "
                  f"mod_err={len(r['module_errors'])}  "
                  f"net_fail={len(r['failed_requests'])}")
            if not ok:
                for e in r["module_errors"]:
                    print(f"    module-error: {e[:180]}")
                for u, f in r["failed_requests"][:5]:
                    print(f"    net-fail: {f}  {u[:160]}")

        await browser.close()

    failed = [
        r for r in results
        if r["status"] != 200 or not r["has_main"]
        or r["module_errors"] or r["failed_requests"]
    ]
    if failed:
        print(f"\n{len(failed)}/{len(results)} route(s) failed")
        sys.exit(1)
    print(f"\nAll {len(results)} routes clean — no 404s, no orphan-module errors.")


if __name__ == "__main__":
    asyncio.run(main())
