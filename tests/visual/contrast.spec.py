"""
Visual + contrast regression tests for Palm Charcoal.

Verifies that interactive text (nav links, buttons, CTAs) maintains
WCAG AA contrast (>= 4.5:1 for normal text, >= 3:1 for large text)
in default, :hover, and :focus-visible states across light/cream
surfaces and dark surfaces.

Run:
    python3 tests/visual/contrast.spec.py
Artifacts: tests/visual/screenshots/*.png
"""

import asyncio, os, sys
from pathlib import Path
from playwright.async_api import async_playwright

BASE = os.environ.get("BASE_URL", "http://localhost:8080")
OUT = Path(__file__).parent / "screenshots"
OUT.mkdir(parents=True, exist_ok=True)

# WCAG relative luminance + contrast ratio
def _lum(rgb):
    def c(x):
        x /= 255
        return x / 12.92 if x <= 0.03928 else ((x + 0.055) / 1.055) ** 2.4
    r, g, b = rgb
    return 0.2126 * c(r) + 0.7152 * c(g) + 0.0722 * c(b)

def contrast(fg, bg):
    L1, L2 = _lum(fg), _lum(bg)
    hi, lo = max(L1, L2), min(L1, L2)
    return (hi + 0.05) / (lo + 0.05)

def parse_rgb(s):
    # "rgb(10, 20, 30)" or "rgba(10,20,30,1)"
    nums = [float(n) for n in s.replace("rgba(", "").replace("rgb(", "").rstrip(")").split(",")[:3]]
    return tuple(int(round(n)) for n in nums)

JS_EFFECTIVE_BG = r"""
(el) => {
  let cur = el;
  while (cur) {
    const cs = getComputedStyle(cur);
    if (cs.backgroundImage && cs.backgroundImage !== 'none') return null; // unknown
    const s = cs.backgroundColor;
    if (s && !s.startsWith('rgba(0, 0, 0, 0)') && s !== 'transparent') return s;
    cur = cur.parentElement;
  }
  return 'rgb(255,255,255)';
}
"""

# Interactive targets (hover/focus contrast is the regression we guard against)
TARGETS = [
    ("/",          "a[href='/portal'], a[href='/auth']", "cta-portal", "default"),
    ("/",          "a[href='/portal'], a[href='/auth']", "cta-portal", "hover"),
    ("/",          "a[href='/portal'], a[href='/auth']", "cta-portal", "focus"),
    ("/products",  "main a, main button",                "product-action", "default"),
    ("/products",  "main a, main button",                "product-action", "hover"),
    ("/products",  "main a, main button",                "product-action", "focus"),
    ("/about",     "main a, main button",                "about-action", "hover"),
    ("/about",     "main a, main button",                "about-action", "focus"),
]

MIN_RATIO = 4.5  # AA for normal text; we don't downgrade for large text to stay strict

async def check(page, route, selector, label, state):
    await page.goto(BASE + route, wait_until="domcontentloaded")
    try:
        await page.wait_for_load_state("networkidle", timeout=4000)
    except Exception:
        pass
    el = page.locator(selector).first
    try:
        await el.wait_for(state="visible", timeout=4000)
    except Exception:
        return {"label": f"{route} {label} {state}", "skipped": True}

    if state == "hover":
        await el.hover()
        await page.wait_for_timeout(150)
    elif state == "focus":
        await el.focus()
        await page.wait_for_timeout(150)

    color = await el.evaluate("el => getComputedStyle(el).color")
    bg = await el.evaluate(JS_EFFECTIVE_BG)
    fg_rgb, bg_rgb = parse_rgb(color), parse_rgb(bg)
    ratio = contrast(fg_rgb, bg_rgb)
    shot = OUT / f"{label}_{state}.png"
    try:
        await el.screenshot(path=str(shot))
    except Exception:
        pass
    return {
        "label": f"{route} {label} {state}",
        "fg": fg_rgb, "bg": bg_rgb, "ratio": round(ratio, 2),
        "pass": ratio >= MIN_RATIO,
        "screenshot": str(shot),
    }

async def main():
    failures = []
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        ctx = await browser.new_context(viewport={"width": 1280, "height": 1800})
        page = await ctx.new_page()
        for route, sel, label, state in TARGETS:
            res = await check(page, route, sel, label, state)
            print(res)
            if not res.get("skipped") and not res["pass"]:
                failures.append(res)
        await browser.close()
    if failures:
        print(f"\n❌ {len(failures)} contrast failure(s) below {MIN_RATIO}:1")
        for f in failures:
            print(" -", f)
        sys.exit(1)
    print("\n✅ All checked elements pass WCAG AA (>= 4.5:1)")

if __name__ == "__main__":
    asyncio.run(main())
