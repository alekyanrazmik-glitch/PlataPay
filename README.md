# PlataPay

Статический сайт PlataPay (payoplata.ru) для GitHub Pages — собирается
из оригинального экспорта Тильды в `tilda-original/`.

## Сборка

```bash
node build.mjs
```

Результат в `out/`. Никаких зависимостей не нужно — Node 20+ и всё.

Базовый путь по умолчанию — `/PlataPay` (имя репозитория). Для
кастомного домена передать пустую строку:

```bash
NEXT_PUBLIC_BASE_PATH= node build.mjs
```

## Структура

- `tilda-original/` — оригинальный экспорт из Тильды (источник правды)
- `build.mjs` — скрипт сборки: раскладывает ассеты в `css/`/`js/`/`images/`,
  делает чистые URL (`/`, `/catalog`, `/faq`, `/contacts`),
  патчит навигацию и `<base href>` под GitHub Pages
- `seo/` — генератор SEO-лендингов:
  - `data.mjs` — каталог сервисов и интентов (сервис × интент)
  - `templates.mjs` / `layout.mjs` — шаблоны и общая оболочка страниц
  - `geo.mjs` — гео-измерение (сервис × город): по странице
    «оплата `<сервис>` в `<городе>`» на каждый сервис и город, плюс
    хабы `/geo/` и `/geo/<город>/`
- `.github/workflows/pages.yml` — деплой на GitHub Pages при пуше в `main`
- `CONTENT.md` — извлечённый контент со старого сайта (для справки)

## Деплой

Автодеплой через GitHub Actions при пуше в `main`. После первого
прогона включить Pages в репо: **Settings → Pages → Source: GitHub Actions**.

Сайт публикуется по адресу:
`https://alekyanrazmik-glitch.github.io/PlataPay/`

## Формы

Формы заказа и инвойса отправляют данные в Telegram-бот и в Google
Sheets — токен бота, chat_id и URL Apps Script зашиты в HTML
страниц в `tilda-original/page*.html`. Чтобы поменять — найти
переменные `BOT_TOKEN`, `CHAT_ID`, `SHEETS_URL` и заменить во всех
четырёх страницах.

## Редактирование контента

Контент (тексты, каталог, FAQ, отзывы) находится в HTML-файлах
`tilda-original/page142115676.html` (главная), `page143711326.html`
(каталог), `page144727686.html` (FAQ), `page144877396.html`
(контакты). После правки — `node build.mjs` и пуш в `main`.
