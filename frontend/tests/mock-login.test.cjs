const assert = require("node:assert/strict");
const { test } = require("node:test");
const fs = require("node:fs");
const vm = require("node:vm");
const ts = require("typescript");

function productionDemo(blocked = false) {
  const values = new Map();
  const sessionStorage = {
    getItem(key) { if (blocked) throw Error("Storage blocked"); return values.get(key) ?? null; },
    setItem(key, value) { if (blocked) throw Error("Storage blocked"); values.set(key, value); },
    removeItem(key) { if (blocked) throw Error("Storage blocked"); values.delete(key); },
  };
  const exports = {};
  const source = ts.transpileModule(fs.readFileSync(require.resolve("../src/lib/mock-login.ts"), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText;
  vm.runInNewContext(source, { exports, sessionStorage, process: { env: { NODE_ENV: "production" } } });
  return { api: exports, values };
}

test("both existing fictional accounts work in production; only email is stored", () => {
  const { api, values } = productionDemo();
  // Public fictional demo credentials, deliberately not real secrets.
  for (const [email, password, role] of [
    ["admin@velora.com", "Velora@Admin2026!", "Administrator"],
    ["developer@velora.com", "Velora@Dev2026!", "Developer"],
  ]) {
    const account = api.signInMock(email, password);
    assert.equal(account.email, email);
    assert.equal(account.role, role);
    assert.equal(account.password, undefined);
    assert.deepEqual([...values.values()], [email]);
    assert.equal(api.readMockAccount().email, email);
    api.signOutMock();
    assert.equal(values.size, 0);
    assert.equal(api.readMockAccount(), null);
  }
});

test("invalid credentials and obsolete session values are rejected", () => {
  const { api, values } = productionDemo();
  for (const [email, password] of [["", ""], ["admin@velora.com", "incorrect"], ["admin@velora.com", "Velora@Admin2026! "], ["unknown@velora.com", "Velora@Admin2026!"]]) {
    assert.equal(api.signInMock(email, password), null);
    assert.equal(values.size, 0);
  }
  values.set("velora.local-account", "unknown@velora.com");
  assert.equal(api.readMockAccount(), null);
});

test("blocked browser storage preserves existing error handling and safe logout", () => {
  const { api } = productionDemo(true);
  assert.equal(api.readMockAccount(), null);
  assert.throws(() => api.signInMock("admin@velora.com", "Velora@Admin2026!"), /Storage blocked/);
  assert.doesNotThrow(() => api.signOutMock());
});
