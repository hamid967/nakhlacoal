"""Automated visual tests for the Splash/Intro screen.

Captures snapshots of the intro across dark + light themes and 3
viewports, then asserts that no unwanted green-dominant pixels
appear in the gradient (regression guard for the emerald → neutral
fix in HomeIntro.tsx / SplashScreen.tsx).

Run:
    python tests/visual/intro_visual_test.py

Output:
    tests/visual/__screenshots__/intro-<theme>-<viewport>.png
    tests/visual/__screenshots__/report.json

Exits non-zero on regression so it can gate CI.
"""

from __future__ import annotations

import asyncio
import json
import os
import sys
from pathlib import Path

from PIL import Image
from playwright.async_api import async_playwright

BASE = os.environ.get("BASE_URL", "http://localhost:8080")
OUT = Path(__file__).parent / "__screenshots__"
OUT.mkdir(parents=True, exist_ok=True)

VIEWPORTS = [
    ("desktop", 1440, 900),
    ("tablet", 1024, 1366),
    ("mobile", 390, 844),
]
THEMES = ("dark", "light")

# Fail if more than this fraction of sampled pixels are saturated-green.
GREEN_THRESHOLD = 0.005  # 0.5%


def green_ratio(path: Path) -> float:
    """Return fraction of pixels where green dominates red & blue."""
    img = Image.open(path).convert("RGB")
    w, h = img.size
    px = img.load()
    total = bad = 0
    for y in range(0, h, 4):
        for x in range(0, w, 4):
            r, g, b = px[x, y]
            total += 1
            if max(r, g, b) - min(r, g, b) < 25:
                continue  # near-grayscale → ignore
            if g > r + 12 and g > b + 12:
                bad += 1
    return bad / max(total, 1)


async def capture(browser, name: str, width: int, height: int, theme: str):
    ctx = await browser.new_context(
        viewport={"width": width, "height": height},
        color_scheme=theme,
        reduced_motion="reduce",
    )
    page = await ctx.new_page()
    await page.add_init_script(
        "try { sessionStorage.clear(); localStorage.removeItem('theme'); } catch(e){}"
    )
    await page.goto(BASE, wait_until="domcontentloaded")
    await page.evaluate(
        """(t) => {
            const r = document.documentElement;
            r.classList.remove('dark','light');
            r.classList.add(t);
            r.style.colorScheme = t;
        }""",
        theme,
    )
    await page.wait_for_timeout(1200)
    out = OUT / f"intro-{theme}-{name}.png"
    await page.screenshot(path=str(out))
    await ctx.close()
    ratio = green_ratio(out)
    return {
        "theme": theme,
        "viewport": name,
        "file": str(out.relative_to(Path.cwd())) if out.is_relative_to(Path.cwd()) else str(out),
        "green_ratio": round(ratio, 5),
        "pass": ratio < GREEN_THRESHOLD,
    }


async def main() -> int:
    results = []
    failed = False
    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=True)
        for name, w, h in VIEWPORTS:
            for theme in THEMES:
                r = await capture(browser, name, w, h, theme)
                results.append(r)
                tag = "PASS" if r["pass"] else "FAIL"
                if not r["pass"]:
                    failed = True
                print(
                    f"{tag}  {theme:<5} {name:<7} "
                    f"green={r['green_ratio'] * 100:.3f}%  → {r['file']}"
                )
        await browser.close()
    (OUT / "report.json").write_text(json.dumps(results, indent=2))
    if failed:
        print("\nFAIL: Unwanted green tint detected in intro snapshots.")
        return 1
    print("\nOK: All intro snapshots clean (no unwanted green).")
    return 0


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
