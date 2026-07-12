# Дневник задач — настольное приложение

Автономная версия приложения "Дневник задач" на Electron. Работает без интернета и без сервера — все задачи хранятся локально на компьютере пользователя (JSON-файл в стандартной пользовательской папке приложения).

## Установка (для пользователя)

- **Windows**: скачайте `Дневник задач 1.0.0.exe` (portable) и запустите двойным щелчком. Ничего устанавливать не нужно.
- **macOS**: скачайте `Дневник задач-1.0.0-mac.zip` (Intel) или `Дневник задач-1.0.0-arm64-mac.zip` (Apple Silicon), распакуйте и перетащите `.app` в папку "Программы".
  - Т.к. приложение не подписано сертификатом Apple, при первом запуске может понадобиться разрешить запуск: правый клик по приложению → "Открыть".

## Разработка

```bash
pnpm install
pnpm --filter @workspace/daily-tasks-desktop run dev:renderer   # запуск Vite-сервера для UI (без Electron-окна)
pnpm --filter @workspace/daily-tasks-desktop run build          # сборка renderer + main процесса
pnpm --filter @workspace/daily-tasks-desktop run dist:win       # сборка портативного .exe для Windows
pnpm --filter @workspace/daily-tasks-desktop run dist:mac       # сборка .zip для macOS (x64 + arm64)
pnpm --filter @workspace/daily-tasks-desktop run dist:linux     # сборка AppImage для Linux
```

Собранные файлы попадают в `release/`.

## Архитектура

- `electron/main.ts` — главный процесс: создаёт окно и хранит задачи в JSON-файле через `app.getPath('userData')`.
- `electron/preload.ts` — безопасный мост (`contextBridge`) между окном и главным процессом, доступен в renderer как `window.tasksApi`.
- `src/App.tsx` — интерфейс на React, визуально повторяет веб-версию приложения (тёплая палитра, шрифты Lora/Plus Jakarta Sans).

Это отдельное приложение от веб-версии (`artifacts/daily-tasks`) — у них разные способы хранения данных (локальный файл vs. сервер + база данных), поэтому код не переиспользуется напрямую, но интерфейс идентичен.
