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
ROOT = Path(__file__).parent
OUT = ROOT / "__screenshots__"
BASELINE = ROOT / "__baseline__"
DIFFS = OUT / "__diff__"
OUT.mkdir(parents=True, exist_ok=True)
BASELINE.mkdir(parents=True, exist_ok=True)

UPDATE = os.environ.get("UPDATE_SNAPSHOTS") in {"1", "true", "yes"}

VIEWPORTS = [
    ("desktop", 1440, 900),
    ("tablet", 1024, 1366),
    ("mobile", 390, 844),
]
THEMES = ("dark", "light")

# Fail if more than this fraction of sampled pixels are saturated-green.
GREEN_THRESHOLD = 0.005  # 0.5%
# Fail if more than this fraction of pixels differ from the baseline.
DIFF_THRESHOLD = 0.02   # 2%


def diff_ratio(a: Path, b: Path, out: Path) -> float:
    """Per-pixel diff ratio between two PNGs; writes a red-highlighted diff."""
    ia = Image.open(a).convert("RGB")
    ib = Image.open(b).convert("RGB")
    if ia.size != ib.size:
        return 1.0
    pa, pb = ia.load(), ib.load()
    w, h = ia.size
    diff = Image.new("RGB", (w, h), (0, 0, 0))
    pd = diff.load()
    total = w * h
    bad = 0
    for y in range(h):
        for x in range(w):
            r1, g1, b1 = pa[x, y]
            r2, g2, b2 = pb[x, y]
            if abs(r1 - r2) + abs(g1 - g2) + abs(b1 - b2) > 30:
                bad += 1
                pd[x, y] = (255, 0, 0)
            else:
                pd[x, y] = (r1 // 4, g1 // 4, b1 // 4)
    out.parent.mkdir(parents=True, exist_ok=True)
    diff.save(out)
    return bad / total



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
    baseline = BASELINE / out.name
    info = {
        "theme": theme,
        "viewport": name,
        "file": str(out),
        "green_ratio": round(ratio, 5),
        "green_pass": ratio < GREEN_THRESHOLD,
        "diff_ratio": None,
        "diff_pass": True,
        "baseline": str(baseline),
    }
    if UPDATE or not baseline.exists():
        baseline.write_bytes(out.read_bytes())
        info["updated_baseline"] = True
    else:
        d = diff_ratio(out, baseline, DIFFS / out.name)
        info["diff_ratio"] = round(d, 5)
        info["diff_pass"] = d < DIFF_THRESHOLD
    info["pass"] = info["green_pass"] and info["diff_pass"]
    return info


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
                d = "—" if r["diff_ratio"] is None else f"{r['diff_ratio'] * 100:.2f}%"
                print(
                    f"{tag}  {theme:<5} {name:<7} "
                    f"green={r['green_ratio'] * 100:.3f}%  diff={d}"
                )
        await browser.close()
    (OUT / "report.json").write_text(json.dumps(results, indent=2))
    if UPDATE:
        print("\nBaselines updated in tests/visual/__baseline__/")
        return 0
    if failed:
        print("\nFAIL: Visual regression detected. Review diffs in")
        print("      tests/visual/__screenshots__/__diff__/")
        print("      Run `npm run test:intro:update` if the change is intentional.")
        return 1
    print("\nOK: Intro snapshots match baseline and contain no unwanted green.")
    return 0



if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
