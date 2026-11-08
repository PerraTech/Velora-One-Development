import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

// Real Chrome via its native debugging protocol; no application dependencies.
// Run against a running production server: node tests/velora-one-browser.mjs
const base = process.env.TEST_BASE_URL || "http://localhost:3005";
const browserPath = process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe";
const artifacts = mkdtempSync(path.join(tmpdir(), "velora-one-qa-"));
const chrome = spawn(browserPath, ["--headless=new", "--disable-gpu", "--in-process-gpu", "--no-first-run", "--no-default-browser-check", "--remote-debugging-port=9335", `--user-data-dir=${path.join(artifacts, "profile")}`, "about:blank"], { windowsHide: true, stdio: ["ignore", "ignore", "pipe"] });
let browserLog = "";
chrome.stderr.on("data", chunk => { browserLog += chunk.toString(); });
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
let socket;
try {
  let tabs;
  for (let attempt = 0; attempt < 60; attempt++) {
    try { tabs = await (await fetch("http://localhost:9335/json/list")).json(); break; } catch { await sleep(250); }
  }
  assert.ok(tabs, "Chrome must start");
  socket = new WebSocket(tabs.find(tab => tab.type === "page").webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
  let id = 0;
  const pending = new Map();
  const errors = [];
  socket.onmessage = ({ data }) => {
    const message = JSON.parse(data);
    if (message.method === "Runtime.exceptionThrown") errors.push(message.params.exceptionDetails.text);
    if (message.id) { const entry = pending.get(message.id); pending.delete(message.id); if (message.error) entry.reject(message.error); else entry.resolve(message.result); }
  };
  const send = (method, params = {}) => new Promise((resolve, reject) => { const key = ++id; const timer = setTimeout(() => reject(new Error(`CDP timeout: ${method}; browser: ${browserLog.slice(-2000)}`)), 15000); pending.set(key, { resolve: result => { clearTimeout(timer); resolve(result); }, reject: error => { clearTimeout(timer); reject(error); } }); socket.send(JSON.stringify({ id: key, method, params })); });
  async function evaluate(expression) {
    const result = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
    return result.result?.value;
  }
  async function waitFor(expression) {
    for (let attempt = 0; attempt < 80; attempt++) { if (await evaluate(`Boolean(${expression})`)) return; await sleep(100); }
    throw new Error(`Timed out: ${expression}`);
  }
  const click = async text => { await evaluate(`(() => { const button = [...document.querySelectorAll('button')].find(b => b.textContent.trim() === ${JSON.stringify(text)}); if (!button) throw Error('Button missing: ' + ${JSON.stringify(text)}); if (button.disabled) throw Error('Button disabled'); button.click(); })()`); await sleep(120); };
  const select = async (selector, value) => { await evaluate(`(() => { const element = document.querySelector(${JSON.stringify(selector)}); element.value = ${JSON.stringify(value)}; element.dispatchEvent(new Event('change', { bubbles: true })); })()`); await sleep(100); };
  const navigate = async route => { await send("Page.navigate", { url: base + route }); await waitFor("document.readyState === 'complete'"); await sleep(350); };
  const screenshot = async name => { const shot = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false }); writeFileSync(path.join(artifacts, name), Buffer.from(shot.data, "base64")); };
  const viewport = (width, height) => send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: false });
  await send("Page.enable"); await send("Runtime.enable");
  await viewport(1280, 1000);
  await navigate("/previews/velora-one");
  await waitFor("document.querySelector('.one-nav')");
  assert.equal(await evaluate("document.querySelector('.one-stat strong').textContent"), "6/18");
  await screenshot("dashboard.png");
  await click("Naar kamerdetails");
  await waitFor("document.querySelector('.one-page-heading h2').textContent === 'Kamer 102'");
  await click("Schoonmaak starten");
  assert.equal(await evaluate("[...document.querySelectorAll('button')].find(b=>b.textContent.includes('Taak afronden')).disabled"), true);
  await evaluate("document.querySelector('.one-checklist input').click()");
  await click("Pauzeren");
  assert.equal(await evaluate("document.querySelector('.one-checklist input').checked && document.querySelector('.one-checklist input').disabled"), true);
  await click("Taak hervatten");
  await evaluate("document.querySelectorAll('.one-checklist input:not(:checked)').forEach(input=>input.click())");
  await sleep(150);
  await click("Taak afronden");
  assert.equal(await evaluate("document.querySelector('.one-status').textContent"), "Gereed");
  await click("Overzicht");
  assert.equal(await evaluate("document.querySelector('.one-stat strong').textContent"), "7/18");
  await click("Kamers");
  await select(".one-filters select", "2");
  assert.equal(await evaluate("document.querySelectorAll('.one-room-card').length"), 6);
  await evaluate("[...document.querySelectorAll('.one-chips button')].find(b=>b.textContent.startsWith('Niet storen')).click()"); await sleep(100);
  assert.equal(await evaluate("document.querySelectorAll('.one-room-card').length"), 1);
  await evaluate("document.querySelector('.one-room-card').click()"); await sleep(100);
  assert.equal(await evaluate("[...document.querySelectorAll('button')].find(b=>b.textContent.trim()==='Schoonmaak starten').disabled"), true);
  await select(".one-field select", "dirty");
  await click("Schoonmaak starten");
  await select(".one-field select", "clean");
  assert.equal(await evaluate("document.querySelector('.one-status').textContent"), "Gereed");
  await screenshot("room-detail.png");
  await evaluate("[...document.querySelectorAll('.one-nav button')].find(b=>b.textContent.startsWith('Verzoeken')).click()"); await sleep(120);
  await click("Afhandelen");
  assert.equal(await evaluate("document.querySelectorAll('.one-request').length"), 2);
  await click("Afgehandeld");
  assert.equal(await evaluate("document.querySelectorAll('.one-request').length"), 1);
  await click("Instellingen");
  await evaluate("document.querySelector('.one-setting input').click()"); await sleep(100);
  assert.ok(await evaluate("!!document.querySelector('.one-large-text')"));
  await click("Demogegevens herstellen");
  await click("Overzicht");
  assert.equal(await evaluate("document.querySelector('.one-stat strong').textContent"), "6/18");
  for (const width of [320, 390, 768, 1024, 1440]) {
    await viewport(width, 1000); await sleep(100);
    for (const screen of ["Overzicht", "Kamers", "Taken", "Instellingen"]) {
      await click(screen);
      assert.ok(await evaluate("document.documentElement.scrollWidth <= innerWidth"), `No overflow: ${width} ${screen}`);
    }
  }
  await viewport(390, 1000); await click("Overzicht"); await screenshot("mobile.png");
  await viewport(1280, 1000);
  await navigate("/portal/velora-one");
  await click("Open Tablet Simulator");
  await waitFor("document.querySelector('.one-simulator').open");
  // The fullscreen native dialog must center its panel independently of the
  // scrolled module page and any parent clipping or transformed containing block.
  await evaluate("(() => { const parent = document.querySelector('.development-panel'); parent.style.transform = 'translate(25px, 15px)'; parent.style.overflow = 'hidden'; parent.style.position = 'relative'; parent.style.zIndex = '1'; })()");
  for (const [width, height] of [[1920, 1080], [1366, 768], [1280, 800], [1024, 768], [768, 1024], [390, 844], [320, 568], [812, 375]]) {
    await viewport(width, height); await sleep(150);
    const geometry = await evaluate(`(() => {
      const dialog = document.querySelector('.one-simulator');
      const panel = dialog.querySelector('.one-simulator-panel');
      const frame = dialog.querySelector('.one-tablet-frame').getBoundingClientRect();
      const overlay = dialog.getBoundingClientRect();
      const box = panel.getBoundingClientRect();
      const screen = dialog.querySelector('.one-tablet-screen');
      return { fixed: getComputedStyle(dialog).position === 'fixed', fullscreen: Math.abs(overlay.left) < 1 && Math.abs(overlay.top) < 1 && Math.abs(overlay.width - innerWidth) < 1 && Math.abs(overlay.height - innerHeight) < 1,
        centered: Math.abs((box.left + box.right) / 2 - innerWidth / 2) < 2 && Math.abs((box.top + box.bottom) / 2 - innerHeight / 2) < 2,
        contained: box.left >= 0 && box.top >= 0 && box.right <= innerWidth + 1 && box.bottom <= innerHeight + 1,
        noOverflow: panel.scrollWidth <= panel.clientWidth && screen.scrollWidth <= screen.clientWidth,
        topLayer: document.elementFromPoint(1, 1) === dialog,
        ratio: frame.width / frame.height,
        innerScrollable: screen.scrollHeight > screen.clientHeight };
    })()`);
    for (const property of ["fixed", "fullscreen", "centered", "contained", "noOverflow", "topLayer", "innerScrollable"]) assert.ok(geometry[property], `${width}x${height}: ${property} ${JSON.stringify(geometry)}`);
    if (width >= 1024 && height >= 768) assert.ok(Math.abs(geometry.ratio - 1.6) < .08, `Tablet aspect ratio at ${width}x${height}`);
    await screenshot(`simulator-${width}x${height}.png`);
  }
  await viewport(1366, 768);
  await click("Sluiten");
  await evaluate("window.scrollTo(0, document.documentElement.scrollHeight)");
  await click("Open Tablet Simulator");
  await waitFor("document.querySelector('.one-simulator').open");
  assert.ok(await evaluate("(() => { const box = document.querySelector('.one-simulator-panel').getBoundingClientRect(); return Math.abs((box.top + box.bottom) / 2 - innerHeight / 2) < 2; })()"), "Centered after page scroll and reopen");
  assert.equal(await evaluate("document.activeElement.getAttribute('aria-label')"), "Tablet Simulator sluiten");
  assert.ok(await evaluate("!!document.querySelector('.one-simulator .one-app')"));
  for (let index = 0; index < 20; index++) { await send("Input.dispatchKeyEvent", { type: "keyDown", key: "Tab", code: "Tab", windowsVirtualKeyCode: 9 }); await send("Input.dispatchKeyEvent", { type: "keyUp", key: "Tab", code: "Tab", windowsVirtualKeyCode: 9 }); assert.ok(await evaluate("document.querySelector('.one-simulator').contains(document.activeElement)"), "Focus stays in dialog"); }
  await screenshot("simulator.png");
  await viewport(320, 900); await sleep(100);
  assert.ok(await evaluate("document.querySelector('.one-simulator').scrollWidth <= document.querySelector('.one-simulator').clientWidth"), "No dialog overflow");
  await send("Input.dispatchKeyEvent", { type: "keyDown", key: "Escape", code: "Escape", windowsVirtualKeyCode: 27 });
  await send("Input.dispatchKeyEvent", { type: "keyUp", key: "Escape", code: "Escape", windowsVirtualKeyCode: 27 });
  await waitFor("!document.querySelector('.one-simulator').open");
  assert.equal(await evaluate("document.activeElement.textContent.trim()"), "Open Tablet Simulator");
  await click("Open Tablet Simulator");
  await click("Sluiten");
  assert.equal(await evaluate("document.querySelector('.one-simulator').open"), false);
  await click("Open Tablet Simulator");
  await evaluate("[...document.querySelectorAll('.one-simulator a')].find(a=>a.textContent.includes('Open volledig scherm')).click()");
  await waitFor("location.pathname === '/previews/velora-one' && !!document.querySelector('.one-app')");
  await navigate("/portal");
  assert.equal(await evaluate("document.querySelectorAll('.status-badge[data-status=preview]').length"), 1);
  assert.equal(await evaluate("document.querySelectorAll('.status-badge[data-status=planned]').length"), 6);
  for (const route of ["/login", "/portal/manager-dashboard", "/portal/housekeeping", "/portal/guest-wall-panel", "/portal/smart-dispensers", "/portal/velora-air", "/portal/velora-dock"]) {
    const response = await fetch(base + route); assert.equal(response.status, 200, route);
  }
  assert.deepEqual(errors, [], "No browser runtime exceptions");
  console.log(`PASS: tablet workflows, filters, DND, settings/reset, responsive overflow, modal centering at 1920x1080/1366x768 and six tablet/mobile sizes, transformed/clipped parent, page scroll, focus/Escape/close/fullscreen, seven module statuses and preserved routes. Screenshots: ${artifacts}`);
} finally {
  socket?.close();
  chrome.kill();
}
