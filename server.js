import readline from "node:readline";
import { createApp } from "./src/app.js";

const port = Number(process.env.PORT ?? 3000);
const { server, state } = createApp();

const printMode = () => {
  console.log(state.failing ? "Режим отказа: каждый запрос получает 500" : "Обычный режим");
};

server.listen(port, () => {
  console.log(`Сервер задач слушает http://localhost:${port}/api/tasks`);
  console.log("Нажмите Enter, чтобы включить или выключить режим отказа");
});

// Отказ переключается из терминала сервера, поэтому приложению студента не нужен
// лишний код ради учебной ошибки.
readline.createInterface({ input: process.stdin }).on("line", () => {
  state.failing = !state.failing;
  printMode();
});
