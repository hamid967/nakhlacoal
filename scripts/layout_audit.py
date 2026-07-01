#!/usr/bin/env python3
"""
Automated layout audit for the Home page across mobile (390), tablet (768),
and desktop (1440). Exits with code 1 if any top-level <section> overlaps
another vertically, or if the page has horizontal overflow.

Usage:  python3 scripts/layout_audit.py [url]
        url defaults to http://localhost:8080/

Requires: Python playwright (already installed in the Lovable sandbox).
"""
import asyncio
import sys
from playwright.async_api import async_playwright

URL = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8080/"
VIEWPORTS = [
    ("mobile", 390, 844),
    ("tablet", 768, 1024),
    ("desktop", 1440, 900),
]
TOLERANCE = 2  # px


async def audit_viewport(browser, name, w, h):
    ctx = await browser.new_context(viewport={"width": w, "height": h})
    page = await ctx.new_page()
    await page.goto(URL, wait_until="networkidle")
    await page.wait_for_timeout(1200)

    # Force lazy sections to mount.
    total = await page.evaluate("document.body.scrollHeight")
    for i in range(11):
        await page.evaluate(f"window.scrollTo(0, {int(total * i / 10)})")
        await page.wait_for_timeout(150)
    await page.evaluate("window.scrollTo(0, 0)")
    await page.wait_for_timeout(300)

    data = await page.evaluate(
        """() => {
            const main = document.querySelector('main') || document.body;
            // Top-level sections only (skip nested subsections).
            const all = [...main.querySelectorAll('section')];
            const top = all.filter(el => !all.some(o => o !== el && o.contains(el)));
            const rects = top.map(s => {
                const r = s.getBoundingClientRect();
                return {
                    top: r.top + window.scrollY,
                    bottom: r.bottom + window.scrollY,
                    tag: (s.getAttribute('aria-label') || s.className || s.tagName).toString().slice(0, 60),
                };
            });
            return {
                rects,
                overflowX: document.documentElement.scrollWidth > document.documentElement.clientWidth,
                sw: document.documentElement.scrollWidth,
                cw: document.documentElement.clientWidth,
            };
        }"""
    )

    sorted_rects = sorted(data["rects"], key=lambda r: r["top"])
    overlaps = []
    for a, b in zip(sorted_rects, sorted_rects[1:]):
        if b["top"] < a["bottom"] - TOLERANCE:
            overlaps.append((a["tag"], b["tag"], a["bottom"] - b["top"]))

    bad = bool(overlaps) or data["overflowX"]
    print(f"\n[{name} {w}x{h}] sections={len(data['rects'])} "
          f"overflowX={data['overflowX']} (sw={data['sw']}, cw={data['cw']})")
    if overlaps:
        print("  Overlaps:")
        for a, b, d in overlaps:
            print(f"   - {a}  <>  {b}   (Δ {d:.1f}px)")
    else:
        print("  ✓ No section overlap")

    await ctx.close()
    return bad


async def main():
    failed = False
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        for name, w, h in VIEWPORTS:
            failed = (await audit_viewport(browser, name, w, h)) or failed
        await browser.close()
    if failed:
        print("\n✗ Layout audit failed")
        sys.exit(1)
    print("\n✓ Layout audit passed on all viewports")


asyncio.run(main())
