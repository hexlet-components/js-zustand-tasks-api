<div align="center">

<a href="https://hexlet.io/?utm_source=github&utm_medium=link&utm_campaign=js-zustand-tasks-api">
    <picture>
        <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/Hexlet/brand-assets/master/images/svg/hexlet_wordmark_white_rus.svg">
        <img src="https://raw.githubusercontent.com/Hexlet/brand-assets/master/images/svg/hexlet_wordmark_primary_rus.svg" alt="Хекслет" height="64">
    </picture>
</a>

# Учебный сервер задач

[![CI](https://github.com/hexlet-components/js-zustand-tasks-api/actions/workflows/main.yml/badge.svg)](https://github.com/hexlet-components/js-zustand-tasks-api/actions/workflows/main.yml)
[![Check](https://github.com/hexlet-components/js-zustand-tasks-api/actions/workflows/check.yml/badge.svg)](https://github.com/hexlet-components/js-zustand-tasks-api/actions/workflows/check.yml)

</div>

Компонент создаёт и поддерживает команда [Хекслета](https://hexlet.io/?utm_source=github&utm_medium=link&utm_campaign=js-zustand-tasks-api), образовательного проекта.

Локальный сервер для урока «Асинхронные действия» курса «Zustand». Приложение студента на Vite загружает с него список задач по адресу `/api/tasks`. Сервер отвечает с разной задержкой на разные фильтры, поэтому гонка двух запросов воспроизводится каждый раз. По нажатию Enter в терминале сервер начинает отвечать ошибкой 500. Каждый запрос, ответ и отмену запроса он печатает в терминал.

Задачи, задержки и размер страницы цитирует урок. После их правки нужно поменять и урок.

## Запуск

Нужен Node.js 22 или новее. Зависимостей у сервера нет, ставить пакеты не нужно.

```sh
git clone https://github.com/hexlet-components/js-zustand-tasks-api.git
cd js-zustand-tasks-api
npm start
```

Сервер слушает порт 3000, другой порт задаётся переменной `PORT`. Терминал с сервером остаётся открытым, приложение запускается во втором терминале.

## Подключение к приложению на Vite

Приложение ходит на относительный адрес `/api/tasks`, а сервер разработки Vite пересылает такие запросы на порт 3000. Пересылку включает настройка `server.proxy` в _vite.config.js_.

```js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": "http://localhost:3000",
    },
  },
});
```

После правки конфига сервер разработки перезапускают.

## Адреса

Сервер отвечает на `GET /api/tasks` массивом задач с полями `id`, `title` и `done`.

| Запрос | Ответ | Задержка |
| --- | --- | --- |
| `/api/tasks` или `/api/tasks?filter=all` | все пять задач | 1 с |
| `/api/tasks?filter=active` | невыполненные задачи | 0,4 с |
| `/api/tasks?filter=done` | выполненные задачи | 0,6 с |
| `/api/tasks?offset=2` | страница из двух задач, начиная с третьей | 0,5 с |

Смещение работает вместе с фильтром. Страница за последней задачей приходит пустым массивом. Неизвестный фильтр и отрицательное смещение получают ответ 400, другие адреса получают 404.

## Ошибка сервера

Нажатие Enter в терминале сервера включает режим отказа, и каждый следующий запрос получает ответ 500. Повторное нажатие возвращает обычные ответы. Так проверяют экран ошибки и кнопку повтора.

Остановленный сервер даёт другую картину. Прокси Vite сам отвечает приложению кодом 502, поэтому в `fetch` придёт ответ с `response.ok`, равным `false`, а сетевой ошибки не будет.

## Отмена запроса

Запрос, который приложение отменило через `AbortController`, сервер печатает строкой `отменён`. Во вкладке Network инструментов разработчика такой запрос отмечен как прерванный.

В режиме разработки `StrictMode` запускает эффект дважды, поэтому загрузка при появлении компонента уходит двумя запросами. С отменой первый из них прерывается.

## Разработка

```sh
mise run setup
mise run test
```

`make <задача>` вызывает ту же задачу mise. `mise run check` гоняет тот же набор, что CI: разметку, опечатки, ссылки, workflows, форматирование и линт JavaScript.
