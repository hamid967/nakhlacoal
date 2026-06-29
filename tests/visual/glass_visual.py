"""
Visual regression for Neo Glassmorphism 2.0 surfaces.

Captures Hero, Gallery, Footer, and a Modal across:
  - themes: emerald (light), noir (dark)
  - motion: normal, reduced
Outputs PNGs to tests/visual/__screenshots__/glass/

Run:  python3 tests/visual/glass_visual.py
Requires the dev server already on http://localhost:8080.
"""
import asyncio
import json
from pathlib import Path
from playwright.async_api import async_playwright

OUT = Path(__file__).parent / "__screenshots__" / "glass"
OUT.mkdir(parents=True, exist_ok=True)

BASE = "http://localhost:8080"
THEMES = ["emerald", "noir"]       # light + dark presets (pc-theme)
MOTION = [("normal", "no-preference"), ("reduced", "reduce")]
VIEWPORT = {"width": 1280, "height": 1800}


async def set_theme(page, theme: str):
    await page.evaluate(f"localStorage.setItem('pc-theme', {json.dumps(theme)})")
    await page.evaluate(f"document.documentElement.setAttribute('data-theme', {json.dumps(theme)})")


async def shoot(page, name: str):
    path = OUT / f"{name}.png"
    await page.screenshot(path=str(path))
    print("saved", path.relative_to(Path(__file__).parent))


async def capture_home(page, tag: str):
    await page.goto(f"{BASE}/", wait_until="domcontentloaded")
    # Force-dismiss intro splash if it sneaks in
    await page.evaluate(
        "document.querySelectorAll('[data-intro-splash], .home-intro').forEach(n => n.remove())"
    )
    await page.wait_for_timeout(1200)

    # Hero (top viewport)
    await page.evaluate("window.scrollTo(0, 0)")
    await page.wait_for_timeout(300)
    await page.screenshot(path=str(OUT / f"hero__{tag}.png"))

    # Footer
    await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
    await page.wait_for_timeout(800)
    await page.screenshot(path=str(OUT / f"footer__{tag}.png"))


async def capture_gallery(page, tag: str):
    await page.goto(f"{BASE}/quality", wait_until="domcontentloaded")
    await page.wait_for_timeout(1500)
    # Scroll until a figure is visible, then screenshot the viewport
    try:
        await page.evaluate(
            "document.querySelector('figure')?.scrollIntoView({block:'center'})"
        )
        await page.wait_for_timeout(600)
        await page.screenshot(path=str(OUT / f"gallery__{tag}.png"))
    except Exception as e:
        print("gallery skipped:", e)


async def capture_modal(page, tag: str):
    await page.goto(f"{BASE}/products", wait_until="networkidle")
    await page.wait_for_timeout(500)
    # Find any button that opens a Radix dialog
    triggers = page.locator('[data-state="closed"], button:has-text("اطلب")')
    count = await triggers.count()
    opened = False
    for i in range(min(count, 5)):
        try:
            await triggers.nth(i).click(timeout=1500)
            await page.wait_for_selector('[role="dialog"]', timeout=2000)
            opened = True
            break
        except Exception:
            continue
    if not opened:
        print("modal: no trigger found, skipping", tag)
        return
    await page.wait_for_timeout(500)
    await shoot(page, f"modal__{tag}")


async def run():
    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=True)
        for theme in THEMES:
            for motion_name, motion_value in MOTION:
                ctx = await browser.new_context(
                    viewport=VIEWPORT,
                    reduced_motion=motion_value,
                    color_scheme="dark" if theme == "noir" else "light",
                )
                page = await ctx.new_page()
                # Seed theme + skip intro splash before first paint
                await page.add_init_script(
                    f"try {{ localStorage.setItem('pc-theme', {json.dumps(theme)});"
                    f" sessionStorage.setItem('palm-home-intro-played', '1'); }} catch (_) {{}}"
                )
                tag = f"{theme}_{motion_name}"
                print(f"\n== {tag} ==")
                try:
                    await capture_home(page, tag)
                    await capture_gallery(page, tag)
                    await capture_modal(page, tag)
                except Exception as e:
                    print(f"!! {tag} failed:", e)
                await ctx.close()
        await browser.close()


if __name__ == "__main__":
    asyncio.run(run())
