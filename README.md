# PlataPay

Сайт PlataPay (payoplata.ru) на Next.js со статическим экспортом для GitHub Pages.

## Стек

- Next.js 15 (App Router) + React 19
- TypeScript
- Tailwind CSS
- Статический экспорт (`output: 'export'`) → деплой на GitHub Pages

## Локальная разработка

```bash
npm install
npm run dev
```

Открыть http://localhost:3000

## Сборка

```bash
npm run build
```

Результат в `out/`.

## Структура

- `src/app/` — страницы (App Router): `/`, `/catalog`, `/faq`, `/contacts`
- `src/components/` — UI-компоненты (Header, Footer, Modals, формы)
- `src/data/` — данные: каталог сервисов, FAQ, отзывы, контакты
- `public/` — статика (favicon, robots)
- `tilda-original/` — исходный экспорт из Тильды (референс)
- `CONTENT.md` — извлечённый контент со старого сайта

## Деплой

Автодеплой на GitHub Pages через `.github/workflows/deploy.yml`
при пуше в `main`. Базовый путь — `/PlataPay` (имя репозитория).

## Формы

Формы заказа и инвойса открывают WhatsApp с подготовленным текстом.
Для интеграции с собственным backend — поменять `onSubmit` в
`src/components/OrderForm.tsx` и `InvoiceForm.tsx`.

## Контент

Каталог сервисов, FAQ и отзывы хранятся как TypeScript-объекты
в `src/data/`. Чтобы добавить/убрать сервис — отредактировать
`src/data/services.ts`.
