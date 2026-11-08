import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

// Test the actual production UI using public fictional demo credentials.
const base = process.env.TEST_BASE_URL || "http://localhost:3008";
const chromePath = process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe";
const profile = mkdtempSync(path.join(tmpdir(), "velora-login-qa-"));
const chrome = spawn(chromePath, ["--headless=new", "--disable-gpu", "--in-process-gpu", "--no-first-run", "--no-default-browser-check", "--remote-debugging-port=9336", `--user-data-dir=${profile}`, "about:blank"], { windowsHide: true, stdio: "ignore" });
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
let socket;
try {
  let tabs;
  for (let attempt = 0; attempt < 60; attempt++) {
    try { tabs = await (await fetch("http://localhost:9336/json/list")).json(); break; } catch { await sleep(250); }
  }
  assert.ok(tabs, "Chrome starts");
  socket = new WebSocket(tabs.find(tab => tab.type === "page").webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
  let sequence = 0;
  const pending = new Map();
  const runtimeErrors = [];
  socket.onmessage = ({ data }) => {
    const message = JSON.parse(data);
    if (message.method === "Runtime.exceptionThrown") runtimeErrors.push(message.params.exceptionDetails.text);
    if (message.id) {
      const entry = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) entry.reject(message.error); else entry.resolve(message.result);
    }
  };
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++sequence;
    const timer = setTimeout(() => reject(Error(`CDP timeout: ${method}`)), 15000);
    pending.set(id, { resolve: value => { clearTimeout(timer); resolve(value); }, reject: error => { clearTimeout(timer); reject(error); } });
    socket.send(JSON.stringify({ id, method, params }));
  });
  async function evaluate(expression) {
    const result = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
    if (result.exceptionDetails) throw Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
    return result.result?.value;
  }
  async function waitFor(expression) {
    for (let attempt = 0; attempt < 100; attempt++) { if (await evaluate(`Boolean(${expression})`)) return; await sleep(100); }
    throw Error(`Timed out: ${expression}`);
  }
  async function click(selector) { await evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`); await sleep(100); }
  async function fill(selector, value) {
    await evaluate(`(() => { const input = document.querySelector(${JSON.stringify(selector)}); Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, ${JSON.stringify(value)}); input.dispatchEvent(new Event('input', { bubbles: true })); })()`);
  }
  await send("Page.enable");
  await send("Runtime.enable");
  await send("Page.navigate", { url: base + "/login" });
  await waitFor("document.querySelector('.login-form')");
  await sleep(500);
  await click("button[type=submit]");
  await waitFor("document.querySelector('#username-error')");
  assert.equal(await evaluate("document.activeElement.id"), "username");
  await fill("#username", "admin@velora.com");
  await click("button[type=submit]");
  await waitFor("document.querySelector('#password-error')");
  await fill("#password", "incorrect");
  await click(".password-toggle");
  assert.equal(await evaluate("document.querySelector('#password').type"), "text");
  await click(".password-toggle");
  assert.equal(await evaluate("document.querySelector('#password').type"), "password");
  await click("button[type=submit]");
  await waitFor("document.querySelector('#login-error')");
  assert.equal(await evaluate("location.pathname"), "/login");
  assert.equal(await evaluate("sessionStorage.length"), 0);
  await fill("#username", " admin@velora.com ");
  await fill("#password", "Velora@Admin2026!");
  await evaluate("document.querySelector('button[type=submit]').click()");
  assert.ok(await evaluate("document.querySelector('button[type=submit]').disabled && document.querySelector('#username').disabled && document.querySelector('#password').disabled"));
  await waitFor("location.pathname === '/portal' && document.querySelector('.module-grid')");
  assert.equal(await evaluate("sessionStorage.getItem('velora.local-account')"), "admin@velora.com");
  assert.equal(await evaluate("JSON.stringify(Object.values(sessionStorage))"), '["admin@velora.com"]');
  await send("Page.reload");
  await waitFor("document.readyState === 'complete' && document.querySelector('.module-grid')");
  assert.equal(await evaluate("sessionStorage.getItem('velora.local-account')"), "admin@velora.com");
  await click("a.module-card[href='/portal/velora-one']");
  await waitFor("document.querySelector('button.module-preview-link')");
  await click("button.module-preview-link");
  await waitFor("document.querySelector('.one-simulator').open && document.querySelector('.one-app')");
  await click("button[aria-label='Tablet Simulator sluiten']");
  await click("button.exit-link");
  await waitFor("location.pathname === '/login' && document.querySelector('.login-form')");
  assert.equal(await evaluate("sessionStorage.getItem('velora.local-account')"), null);
  await fill("#username", "developer@velora.com");
  await fill("#password", "Velora@Dev2026!");
  await click("button[type=submit]");
  await waitFor("location.pathname === '/portal' && document.querySelector('.module-grid')");
  assert.equal(await evaluate("sessionStorage.getItem('velora.local-account')"), "developer@velora.com");
  await click("button.exit-link");
  await waitFor("location.pathname === '/login'");
  assert.equal(await evaluate("sessionStorage.length"), 0);
  assert.deepEqual(runtimeErrors, []);
  console.log(`PASS (${new URL(base).host}): production admin/developer login, empty/invalid validation, password visibility, loading, portal, session reload, simulator and logout; no runtime exceptions.`);
} finally {
  socket?.close();
  chrome.kill();
}
