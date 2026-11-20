import assert from "node:assert/strict";
import { once } from "node:events";
import { after, before, test } from "node:test";
import { setTimeout as wait } from "node:timers/promises";
import { createApp, defaultDelays, tasks } from "./app.js";

const logs = [];
const { server, state } = createApp({
  delays: { all: 100, active: 20, done: 40, page: 10 },
  log: (line) => logs.push(line),
});
let origin = "";

before(async () => {
  server.listen(0);
  await once(server, "listening");
  origin = `http://localhost:${server.address().port}`;
});

after(() => {
  server.close();
});

test("отдаёт все задачи без фильтра", async () => {
  const response = await fetch(`${origin}/api/tasks`);

  assert.equal(response.status, 200);
  assert.equal(response.headers.get("access-control-allow-origin"), "*");
  assert.deepEqual(await response.json(), tasks);
});

test("фильтрует активные и выполненные", async () => {
  const active = await fetch(`${origin}/api/tasks?filter=active`).then((r) => r.json());
  const done = await fetch(`${origin}/api/tasks?filter=done`).then((r) => r.json());

  assert.deepEqual(
    active.map((task) => task.id),
    ["2", "3", "5"],
  );
  assert.deepEqual(
    done.map((task) => task.id),
    ["1", "4"],
  );
});

test("отдаёт страницы по смещению", async () => {
  const pages = await Promise.all(
    [0, 2, 4, 6].map((offset) =>
      fetch(`${origin}/api/tasks?offset=${offset}`).then((r) => r.json()),
    ),
  );

  assert.deepEqual(
    pages.map((page) => page.map((task) => task.id)),
    [["1", "2"], ["3", "4"], ["5"], []],
  );
});

test("отвечает 400 на неизвестный фильтр и неверное смещение", async () => {
  assert.equal((await fetch(`${origin}/api/tasks?filter=urgent`)).status, 400);
  assert.equal((await fetch(`${origin}/api/tasks?offset=-1`)).status, 400);
});

test("отвечает 404 на другой адрес и 405 на другой метод", async () => {
  assert.equal((await fetch(`${origin}/tasks`)).status, 404);

  const response = await fetch(`${origin}/api/tasks`, { method: "POST" });

  assert.equal(response.status, 405);
  assert.equal(response.headers.get("allow"), "GET");
});

test("запрос, отправленный первым, отвечает последним", async () => {
  const order = [];
  const first = fetch(`${origin}/api/tasks?filter=all`).then(() => order.push("all"));
  const second = fetch(`${origin}/api/tasks?filter=active`).then(() => order.push("active"));

  await Promise.all([first, second]);

  assert.deepEqual(order, ["active", "all"]);
});

test("в режиме отказа отвечает 500", async () => {
  state.failing = true;

  try {
    assert.equal((await fetch(`${origin}/api/tasks`)).status, 500);
  } finally {
    state.failing = false;
  }

  assert.equal((await fetch(`${origin}/api/tasks`)).status, 200);
});

test("печатает отмену запроса", async () => {
  const controller = new AbortController();
  const request = fetch(`${origin}/api/tasks?filter=all`, { signal: controller.signal });

  await wait(10);
  controller.abort();
  await assert.rejects(request, { name: "AbortError" });
  await wait(20);

  assert.ok(logs.includes("отменён GET /api/tasks?filter=all"));
});

test("по умолчанию задержки повторяют заглушку урока", () => {
  assert.ok(defaultDelays.all > defaultDelays.done);
  assert.ok(defaultDelays.done > defaultDelays.active);
});
