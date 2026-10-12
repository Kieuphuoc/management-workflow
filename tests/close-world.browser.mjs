import { chromium, expect } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

const baseURL = process.env.TEST_URL || 'http://localhost:3060';
const artifacts = '.artifacts/close-world';
await mkdir(artifacts, { recursive: true });
const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL || 'chrome', headless: true });
const errors = [];
const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
page.setDefaultTimeout(30000);
page.on('pageerror', error => errors.push(error.message));
page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
const world = page.locator('.close-world');
const chapters = page.locator('.close-world__chapter');
const tour = page.locator('.close-world__tour');
const point = () => page.locator('[data-stage-key="warehouse"]').evaluate(node => node.style.transform);
const capture = name => world.screenshot({ path: `${artifacts}/${name}.png`, animations: 'disabled', style: 'header, [role="status"] { visibility: hidden !important; }' });
const stopMotion = async () => {
  const pause = page.getByRole('button', { name: 'Tạm dừng chuyển động', exact: true });
  if (await pause.count()) await pause.click();
};

try {
  await page.goto(`${baseURL}/dashboard`);
  await page.locator('[data-scene-state="ready"]').waitFor();
  await world.scrollIntoViewIfNeeded();
  await expect(tour).toBeEnabled();
  await stopMotion();
  await page.waitForTimeout(1600);
  await capture('desktop');
  console.log('PASS: 3D world renders and overview displays live progress.');

  const originalCanvas = await page.locator('.close-world canvas').elementHandle();
  for (let i = 0; i < 5; i++) {
    const before = await point();
    await chapters.nth(i).click();
    await expect(chapters.nth(i)).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('.close-world__eyebrow')).toContainText(`0${i + 1} / 05`);
    await page.waitForTimeout(1600);
    expect(await point()).not.toBe(before);
    await expect(page.getByRole('progressbar')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Xem công việc', exact: true })).toHaveAttribute('href', '/admin/checklist');
    if (i === 1) await capture('cost');
  }
  console.log('PASS: All five chapters change the camera and show task progress.');

  await page.getByRole('button', { name: 'Đặt lại góc nhìn', exact: true }).click();
  await page.waitForTimeout(1600);
  await expect(page.getByRole('button', { name: 'Toàn cảnh', exact: true })).toHaveAttribute('aria-pressed', 'true');
  const beforeZoom = await point();
  await page.getByRole('button', { name: 'Phóng to', exact: true }).click();
  await page.waitForTimeout(250);
  expect(await point()).not.toBe(beforeZoom);
  await page.getByRole('button', { name: 'Thu nhỏ', exact: true }).click();
  await page.waitForTimeout(350);
  const beforeDrag = await point();
  const box = await page.locator('.close-world__canvas').boundingBox();
  const x = box.x + box.width * .67, y = box.y + box.height * .65;
  await page.mouse.move(x, y); await page.mouse.down();
  await page.mouse.move(x + 90, y + 25, { steps: 12 }); await page.mouse.up();
  await page.waitForTimeout(800);
  expect(await point()).not.toBe(beforeDrag);
  const beforeWheel = await point();
  await page.mouse.wheel(0, -150); await page.waitForTimeout(600);
  expect(await point()).not.toBe(beforeWheel);
  console.log('PASS: Drag, wheel, zoom buttons and camera reset affect the 3D view.');

  await page.getByRole('button', { name: 'Đặt lại góc nhìn', exact: true }).click();
  await page.waitForTimeout(1600);
  await page.getByRole('button', { name: 'Khám phá Công nợ', exact: true }).click();
  await expect(chapters.nth(2)).toHaveAttribute('aria-pressed', 'true');
  await tour.click();
  await expect(tour).toHaveAttribute('aria-pressed', 'true');
  await page.waitForTimeout(5900);
  await expect(chapters.nth(3)).toHaveAttribute('aria-pressed', 'true');
  await chapters.nth(0).click();
  await expect(tour).toHaveAttribute('aria-pressed', 'false');
  await tour.click();
  await page.getByRole('button', { name: 'Tạm dừng chuyển động', exact: true }).click();
  await expect(tour).toHaveAttribute('aria-pressed', 'false');
  await expect(page.getByRole('button', { name: 'Tiếp tục chuyển động', exact: true })).toHaveAttribute('aria-pressed', 'true');
  console.log('PASS: Hotspots, automatic tour, manual interruption and pause.');

  await page.getByRole('textbox', { name: 'Kỳ chốt mới' }).fill('2026-12');
  await page.getByRole('button', { name: 'Tạo kỳ chốt', exact: true }).click();
  await expect(page.locator('.close-world__period')).toHaveText('Tháng 12/2026');
  expect(await originalCanvas.evaluate(element => element === document.querySelector('.close-world canvas'))).toBe(true);
  console.log('PASS: Changing period updates data without recreating the canvas.');

  for (const width of [1024, 768, 390, 360]) {
    await page.setViewportSize({ width, height: 900 });
    await page.getByRole('button', { name: 'Toàn cảnh', exact: true }).click();
    await page.waitForTimeout(1700);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await expect(chapters.nth(4)).toBeVisible();
    if (width === 390) await capture('mobile');
  }
  await chapters.nth(4).click();
  await expect(chapters.nth(4)).toHaveAttribute('aria-pressed', 'true');
  await chapters.nth(4).focus(); await page.keyboard.press('Enter');
  await expect(page.getByRole('progressbar')).toBeVisible();
  console.log('PASS: Responsive layouts at 360, 390, 768 and 1024px; keyboard selection.');

  const touchPage = await browser.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  await touchPage.goto(`${baseURL}/dashboard`);
  await touchPage.locator('[data-scene-state="ready"]').waitFor();
  await touchPage.locator('.close-world__canvas').evaluate(element => window.scrollTo(0, element.getBoundingClientRect().top + window.scrollY - 80));
  await touchPage.waitForTimeout(1600);
  const touchLabel = touchPage.locator('[data-stage-key="warehouse"]');
  const beforeTouch = await touchLabel.evaluate(element => element.style.transform);
  const cdp = await touchPage.context().newCDPSession(touchPage);
  const dispatch = (type, touchPoints) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints });
  await dispatch('touchStart', [{ x: 170, y: 530, id: 0 }]);
  for (let i = 1; i <= 8; i++) await dispatch('touchMove', [{ x: 170 + i * 8, y: 530 + i * 2, id: 0 }]);
  await dispatch('touchEnd', []);
  await touchPage.waitForTimeout(600);
  expect(await touchLabel.evaluate(element => element.style.transform)).not.toBe(beforeTouch);
  const beforePinch = await touchLabel.evaluate(element => element.style.transform);
  await dispatch('touchStart', [{ x: 150, y: 530, id: 0 }, { x: 220, y: 530, id: 1 }]);
  for (let i = 1; i <= 8; i++) await dispatch('touchMove', [{ x: 150 - i * 3, y: 530, id: 0 }, { x: 220 + i * 3, y: 530, id: 1 }]);
  await dispatch('touchEnd', []);
  await touchPage.waitForTimeout(600);
  expect(await touchLabel.evaluate(element => element.style.transform)).not.toBe(beforePinch);
  await expect(touchPage.getByRole('button', { name: 'Toàn cảnh', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await touchPage.close();
  console.log('PASS: One-finger rotation and two-finger pinch zoom without accidental stage selection.');

  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.getByRole('button', { name: 'Tiếp tục chuyển động', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await chapters.nth(1).click();
  await page.waitForTimeout(500);
  const still = await page.locator('.close-world canvas').screenshot();
  await page.waitForTimeout(900);
  expect(await page.locator('.close-world canvas').screenshot()).toEqual(still);
  expect(errors).toEqual([]);
  console.log('PASS: Reduced motion pauses ambient animation; no browser errors.');

  await page.locator('.close-world canvas').evaluate(canvas => canvas.getContext('webgl2').getExtension('WEBGL_lose_context').loseContext());
  await page.locator('[data-scene-state="fallback"]').waitFor();
  await expect(page.locator('.close-world__fallback')).toBeVisible();
  console.log('PASS: Losing the WebGL context switches to a usable illustration.');

  const fallback = await browser.newPage();
  await fallback.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      return /webgl/i.test(type) ? null : original.call(this, type, ...args);
    };
  });
  await fallback.goto(`${baseURL}/dashboard`);
  await fallback.locator('[data-scene-state="fallback"]').waitFor();
  await expect(fallback.locator('.close-world__fallback button')).toHaveCount(5);
  await fallback.locator('.close-world__fallback button').nth(2).click();
  await expect(fallback.locator('.close-world__chapter').nth(2)).toHaveAttribute('aria-pressed', 'true');
  await expect(fallback.getByRole('link', { name: 'Xem công việc', exact: true })).toBeVisible();
  await expect(fallback.locator('.close-world__tour')).toBeDisabled();
  await fallback.locator('.close-world').screenshot({ path: `${artifacts}/fallback.png`, animations: 'disabled', style: 'header { visibility: hidden !important; }' });
  await fallback.close();
  console.log('PASS: WebGL fallback remains navigable and shows stage data.');
  console.log(`All browser checks passed. Screenshots: ${artifacts}/`);
} finally { await browser.close(); }
