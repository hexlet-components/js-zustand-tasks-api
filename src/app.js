import http from "node:http";

// Набор задач цитирует самостоятельная урока «Асинхронные действия», поэтому
// значения полей и их порядок менять нельзя.
export const tasks = [
  { id: "1", title: "Купить хлеб", done: true },
  { id: "2", title: "Написать отчёт", done: false },
  { id: "3", title: "Позвонить в банк", done: false },
  { id: "4", title: "Записаться к врачу", done: true },
  { id: "5", title: "Заказать цветы", done: false },
];

// Разные задержки нужны для гонки: запрос «все», отправленный первым, отвечает
// позже запроса «активные».
export const defaultDelays = { all: 1000, active: 400, done: 600, page: 500 };

export const pageSize = 2;

const filters = {
  all: () => true,
  active: (task) => !task.done,
  done: (task) => task.done,
};

const sendJson = (res, status, body) => {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "Access-Control-Allow-Origin": "*",
  });
  res.end(JSON.stringify(body));
};

const parseOffset = (value) => {
  if (value === null) {
    return null;
  }

  const offset = Number(value);

  return Number.isInteger(offset) && offset >= 0 ? offset : Number.NaN;
};

export const createApp = ({ delays = defaultDelays, log = console.log } = {}) => {
  const state = { failing: false };

  const server = http.createServer((req, res) => {
    const url = new URL(req.url ?? "/", "http://localhost");
    const label = `${req.method} ${url.pathname}${url.search}`;

    if (url.pathname !== "/api/tasks") {
      sendJson(res, 404, { error: "Not found" });
      return;
    }

    if (req.method !== "GET") {
      res.setHeader("Allow", "GET");
      sendJson(res, 405, { error: "Method not allowed" });
      return;
    }

    const filter = url.searchParams.get("filter") ?? "all";
    const offset = parseOffset(url.searchParams.get("offset"));

    if (!Object.hasOwn(filters, filter) || Number.isNaN(offset)) {
      sendJson(res, 400, { error: "Bad request" });
      return;
    }

    log(`запрос ${label}`);

    const timer = setTimeout(
      () => {
        if (state.failing) {
          log(`ответ 500 ${label}`);
          sendJson(res, 500, { error: "Internal server error" });
          return;
        }

        const list = tasks.filter(filters[filter]);
        const body = offset === null ? list : list.slice(offset, offset + pageSize);

        log(`ответ 200 ${label}`);
        sendJson(res, 200, body);
      },
      offset === null ? delays[filter] : delays.page,
    );

    // Соединение закрылось раньше ответа, значит клиент отменил запрос.
    res.on("close", () => {
      if (!res.writableEnded) {
        clearTimeout(timer);
        log(`отменён ${label}`);
      }
    });
  });

  return { server, state };
};
