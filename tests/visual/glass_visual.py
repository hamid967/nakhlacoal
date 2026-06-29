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

    # Navbar (top of page, full bar)
    await page.evaluate("window.scrollTo(0, 0)")
    await page.wait_for_timeout(300)
    nav = page.locator("nav").first
    try:
        await nav.screenshot(path=str(OUT / f"navbar__{tag}.png"))
    except Exception as e:
        print("navbar element shot failed, falling back:", e)
        await page.screenshot(path=str(OUT / f"navbar__{tag}.png"),
                              clip={"x": 0, "y": 0, "width": VIEWPORT["width"], "height": 140})

    # Navbar — desktop megamenu hovered (skip in reduced/mobile widths)
    try:
        trigger = page.locator('nav button:has-text("منتجات"), nav button:has-text("Products")').first
        if await trigger.count():
            await trigger.hover(timeout=1500)
            await page.wait_for_timeout(450)
            await page.screenshot(path=str(OUT / f"navbar_mega__{tag}.png"),
                                  clip={"x": 0, "y": 0, "width": VIEWPORT["width"], "height": 420})
    except Exception as e:
        print("megamenu skipped:", e)

    # Navbar — mobile drawer open
    try:
        await page.set_viewport_size({"width": 414, "height": 900})
        await page.wait_for_timeout(300)
        burger = page.locator('button[aria-label="Menu"], button[aria-label="القائمة"]').first
        if await burger.count():
            await burger.click(timeout=1500)
            await page.wait_for_timeout(500)
            await page.screenshot(path=str(OUT / f"navbar_drawer__{tag}.png"))
        await page.set_viewport_size(VIEWPORT)
    except Exception as e:
        print("drawer skipped:", e)
        await page.set_viewport_size(VIEWPORT)

    # Hero (top viewport)
    await page.evaluate("window.scrollTo(0, 0)")
    await page.wait_for_timeout(300)
    await page.screenshot(path=str(OUT / f"hero__{tag}.png"))

    # Services section (Neo glass wrapper on landing)
    try:
        await page.evaluate(
            "document.querySelector('#services')?.scrollIntoView({block:'center'})"
        )
        await page.wait_for_timeout(800)
        services = page.locator("#services").first
        if await services.count():
            await services.screenshot(path=str(OUT / f"services__{tag}.png"))
        else:
            await page.screenshot(path=str(OUT / f"services__{tag}.png"))
    except Exception as e:
        print("services skipped:", e)

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
