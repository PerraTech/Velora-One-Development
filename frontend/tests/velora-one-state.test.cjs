const assert = require("node:assert/strict");
const { test } = require("node:test");
const fs = require("node:fs");
const ts = require("typescript");

// Compile only the dependency-free demo domain modules, without adding a test runtime.
require.extensions[".ts"] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText, filename);
const { createDemoState } = require("../src/lib/velora-one/mock-data.ts");
const { demoReducer, getStatistics } = require("../src/lib/velora-one/demo-state.ts");

test("start, checklist, pause, resume and completion keep rooms and statistics consistent", () => {
  let state = createDemoState();
  const initial = getStatistics(state);
  const taskId = "task-103";
  const dispatch = action => state = demoReducer(state, action);
  dispatch({ type: "task-status", taskId, status: "active" });
  assert.equal(getStatistics(state).active, 1);
  assert.equal(state.rooms.find(room => room.id === "103").status, "cleaning");
  dispatch({ type: "task-status", taskId, status: "completed" });
  assert.equal(state.tasks.find(task => task.id === taskId).status, "active");
  dispatch({ type: "check", taskId, itemId: "103-0" });
  dispatch({ type: "task-status", taskId, status: "paused" });
  dispatch({ type: "check", taskId, itemId: "103-1" });
  assert.equal(state.tasks.find(task => task.id === taskId).checklist[1].checked, false);
  dispatch({ type: "task-status", taskId, status: "active" });
  for (let index = 1; index < 5; index++) dispatch({ type: "check", taskId, itemId: `103-${index}` });
  dispatch({ type: "task-status", taskId, status: "completed" });
  assert.equal(state.rooms.find(room => room.id === "103").status, "clean");
  assert.equal(getStatistics(state).clean, initial.clean + 1);
  assert.equal(getStatistics(state).remaining, initial.remaining - 1);
  assert.equal(getStatistics(state).active, 0);
});

test("DND blocks starts and room overrides synchronize task state", () => {
  const initial = createDemoState();
  assert.equal(demoReducer(initial, { type: "task-status", taskId: "task-104", status: "active" }), initial);
  let state = demoReducer(initial, { type: "room-status", roomId: "104", status: "dirty" });
  state = demoReducer(state, { type: "task-status", taskId: "task-104", status: "active" });
  assert.equal(getStatistics(state).active, 1);
  state = demoReducer(state, { type: "room-status", roomId: "104", status: "dnd" });
  assert.equal(getStatistics(state).active, 0);
  assert.equal(state.tasks.find(task => task.id === "task-104").status, "paused");
  state = demoReducer(state, { type: "room-status", roomId: "103", status: "clean" });
  assert.ok(state.tasks.find(task => task.id === "task-103").checklist.every(item => item.checked));
  state = demoReducer(state, { type: "room-status", roomId: "103", status: "dirty" });
  assert.ok(state.tasks.find(task => task.id === "task-103").checklist.every(item => !item.checked));
});

test("request completion is idempotent, reset is fresh and original data stays immutable", () => {
  const original = createDemoState();
  const snapshot = JSON.stringify(original);
  let state = demoReducer(original, { type: "resolve", requestId: "req-1" });
  state = demoReducer(state, { type: "resolve", requestId: "req-1" });
  assert.equal(getStatistics(state).requests, 2);
  assert.equal(JSON.stringify(original), snapshot);
  assert.deepEqual(demoReducer(state, { type: "reset" }), original);
  assert.notEqual(createDemoState().rooms[0], original.rooms[0]);
});
