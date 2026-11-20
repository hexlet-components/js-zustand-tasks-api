# AGENTS.md

Репозиторий создан из шаблона `hexlet-components/component-template`. Шаблон ставит общий слой проверок из [dev-quality-gates](https://github.com/mokevnin/dev-quality-gates): mise, hk, commitlint, rumdl, typos, lychee, jactionlint и betterleaks. Стек репозитория это Node без зависимостей, к общему слою добавлены oxfmt и oxlint с конфигами из hexlet-exercise-kit, копии байт в байт.

## Ответы сервера это контент курса

Сервер запускают студенты урока `async-actions` курса `js_zustand_course` (GitLab, `hexlethq/courses/ru/js_zustand_course`). Урок и его самостоятельная цитируют набор задач, задержки фильтров, размер страницы, строки лога и поведение режима отказа. Правка любого из них делает текст урока неверным, поэтому идёт вместе с правкой урока.

Тесты в `src/app.test.js` фиксируют контракт: порядок ответов при гонке, страницы по смещению, 400, 404, 405, 500 и строку об отмене.

## Зависимости

Runtime-зависимостей нет намеренно: студент запускает `npm start` сразу после клона, без установки пакетов. Поэтому нет lock-файла, OSV-Scanner и экосистемы npm в `.github/dependabot.yml`. Первая зависимость приносит их вместе с собой.
