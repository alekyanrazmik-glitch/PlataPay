# PlataPay — Content Source of Truth

Extracted from Tilda-exported HTML at `tilda-original/`. This document is the source of truth for the Next.js rebuild. All Russian text preserved verbatim.

---

## Global Site Elements

### Brand / Identity
- **Brand name**: `Plata` + `Pay` (the "Pay" part is rendered in accent color)
- **Site URL**: `https://payoplata.ru`
- **Legal entity**: ООО «Аполон7-Рус» · ИНН 2304086282 · КПП 230401001 · ОГРН 1252300042356
- **Legal address**: 353460, Краснодарский край, г. Геленджик, ул. Островского, д. 80А
- **Copyright line**: `© 2026 PlataPay · ООО «Аполон7-Рус» · ИНН 2304086282 · ОГРН 1252300042356 · г. Геленджик, ул. Островского, 80А`

### Color Palette (extracted from inline CSS in body HTML)
| Token | Hex | Role |
|---|---|---|
| `--bg` | `#08172F` | Page background (deep navy) |
| `--bg2` | `#0c1f40` | Card / surface |
| `--bg3` | `#13294e` | Elevated surface |
| `--card` | `#0d1f44` | Review/FAQ card |
| `--line` | `#16315f` / `#1d3a6b` | Borders/dividers |
| `--text` | `#eef3ff` | Primary text (off-white) |
| `--muted` | `#9fb2d4` / `#aebfdc` / `#8499c0` | Secondary text |
| `--accent` (PRIMARY BRAND) | `#2e7bff` | Buttons, links, accents (bright blue) |
| `--accent2` | `#7BAEFF` | Eyebrows, highlights |
| `--green` | `#22C55E` | Success |
| `--greenD` | `#15A34A` | Success dark |
| `--avito` | `#9bc736` | Avito brand color |
| `--star` | `#FFC107` | Rating stars (gold) |
| Telegram button hover | `#1f63e6` | CTA hover |
| Gradient on primary btn | `linear-gradient(180deg,#2e7bff,#1e5fd6)` | Primary CTA fill |

**Primary brand color: `#2e7bff` (vivid blue) on a deep navy `#08172F` background.**

### Typography
- Stack: `-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Segoe UI', system-ui, sans-serif`
- Tilda also loaded `TildaSans` (in `fonts-tildasans.css`) but the new pp-* sections use the SF Pro stack — drop TildaSans on rewrite.

### Header / Navigation (every page)
Element: `<header class="pp-hdr">`. Logo: `Plata` + `<span>Pay</span>` linking to `/`.

Nav items (in order):
| Label | Href | Notes |
|---|---|---|
| Главная | `/` | Active when path is `/` |
| Каталог | `/catalog` | |
| Отзывы | `/#Otzivi` | Anchor on home page |
| Вопросы | `/faq` | (Footer labels it "FAQ") |
| Контакты | `/contacts` | |

Header CTA button: **Оплатить сервис** → `#popupforma` (opens order modal).

Header also includes a burger menu (`.pp-burger`) for mobile.

### Footer (every page)
Element: `<footer class="pp-foot">`. Dark navy background `#08172F`.

**Brand column:**
- Logo: `Plata` + `Pay`
- Tagline: `Сервис оплаты зарубежных сервисов и подписок из России — быстро, безопасно и без автосписаний.`
- Social icons (SVG icons, no images): Telegram → `https://t.me/Kimzar_A`, WhatsApp → `https://wa.me/79676726909`, Email → `mailto:Apolon7-rus@mail.ru`

**Column "Навигация":**
- Главная → `/`
- Каталог → `/catalog`
- Отзывы → `/#Otzivi`
- FAQ → `/faq`
- Контакты → `/contacts`

**Column "Сервисы":**
- Нейросети → `/catalog`
- Видео и дизайн → `/catalog`
- Музыка и кино → `/catalog`
- Игры → `/catalog`
- Все сервисы → `/catalog`

**Column "Важно" (disclaimer):**
> PlataPay не является банком или платёжной системой. Мы оказываем консультационную и посредническую помощь в оплате зарубежных сервисов.

**Footer bottom row:**
- Legal: `© 2026 PlataPay · ООО «Аполон7-Рус» · ИНН 2304086282 · ОГРН 1252300042356 · г. Геленджик, ул. Островского, 80А`
- Links: `Публичная оферта` → `#popupoferta` · `Политика конфиденциальности` → `#popuppolicy`

### Global Modals (present on EVERY page)
1. **Order form modal** `#popupforma` — H3 title: `Оформить заявку на оплату`, subtitle: `Ответим и оплатим в течение 5–15 минут`. Form fields detailed in Home page section below.
2. **Invoice form modal** `#popupinvoice` — H3: `Оплата зарубежного счёта (инвойса)`, subtitle: `Оплатим ваш инвойс от иностранной компании — обучение, услуги, товары`. Detailed in Home page section.
3. **Public offer modal** `#popupoferta` — H2: `Публичная оферта`, meta: `Актуальная редакция · Сайт: payoplata.ru`. Full legal text in dedicated section below.
4. **Privacy policy modal** `#popuppolicy` — H2: `Политика конфиденциальности`. Full legal text in dedicated section below.
5. **Mini info popups** `#popup:infoblock`, `#popup2`, `#popup3` — three short Tilda popups carrying the three home-page FAQ answers (titles + descriptions listed in the home page FAQ section below).

### Analytics
Yandex Metrika `109522965` is wired up. Telegram links fire `ym(109522965,'reachGoal','klik_telegram')`. Drop these on rewrite unless preserving analytics.

### Images on disk in `tilda-original/`
| File | Use |
|---|---|
| `tild3036-3438-4435-b735-396332356232__30a59f4c-f18e-4cc4-8.png` | "About PlataPay" illustration (home page about section, 2.5 MB — replace) |
| `tild6164-3165-4864-a533-656638333436__-__resize__20x__f5c4cf84-b1de-4dbe-a.png` | Reviews / decorative |
| `tild6164-3165-4864-a533-656638333436__f5c4cf84-b1de-4dbe-a.png` | Reviews full-res |
| `tild3166-6330-4265-a139-363838383763__noroot.png` | Small icon (FAQ row arrow / question mark) |
| `tild3166-6330-4265-a139-363838383763__-__resize__20x__noroot.png` | Thumbnail of above |
| `tild3062-6238-4463-b631-393361633737__platapay_tile_180x18.svg` | App tile / favicon variant |
| `tild3238-3463-4630-a431-646332316531__platapay_tile_180x18.svg` | App tile / favicon variant |
| `tild3863-3361-4433-b334-613561366261__platapay_favicon.svg` | Favicon |
| `tild6162-3331-4435-b337-326463323230__img_4021.png` | Misc thumbnail |
| `lib__icons__button__chevron_right_bold.svg` | Chevron icon |

All product/service logos load from external GitHub: `https://raw.githubusercontent.com/alekyanrazmik-glitch/Just-PlataPay/master/<Name>.PNG`.

---

# Page 1 — Главная (Home) — `/`
Source: `tilda-original/page142115676.html` (+ `page142115676body.html`)

- `<title>`: `PlataPay — оплата зарубежных сервисов`
- `<meta description>`: `Помогаем оплатить зарубежные подписки, сервисы, игры, AI-инструменты и бронирования.`

## Hidden SEO Headings (visually hidden, kept for SEO)
- H1: `Оплата зарубежных сервисов и подписок`
- H2: `AI и нейросети`
- H2: `Игры и пополнения`
- H2: `Видео и дизайн`
- H2: `Музыка и кино`
- H3: `ChatGPT Plus` · `Claude Pro` · `Netflix` · `Spotify Premium` · `Steam` · `PlayStation Plus`

## Section 1 — Hero
- Eyebrow text: `Оплата зарубежных сервисов и подписок · 5–15 минут · от 99₽`
- H1: `Какой сервис нужно оплатить?`
- **Search form** (action=`/catalog`, GET, field name=`q`):
  - Input placeholder: `ChatGPT, Netflix, Spotify, Adobe…`
  - Submit button: `Найти`
- **Quick links** under search (each is a logo image + name, opens `/catalog?q=…`):
  - ChatGPT → `/catalog?q=ChatGPT` · logo `GPT.PNG`
  - Claude → `/catalog?q=Claude` · logo `Claude.PNG`
  - Spotify → `/catalog?q=Spotify` · logo `Spotify.PNG`
  - YouTube → `/catalog?q=YouTube` · logo `YouTube%20.PNG`
  - Adobe → `/catalog?q=Adobe` · logo `Adobe.PNG`
  - **Оплата Invoice** → `#popupinvoice` (special pill button)
- **Trust line under hero** (separated by `·`):
  - `Без автосписаний · Возврат, если не оплатили · Поддержка с 08:00 до 24:00 МСК`

## Section 2 — Popular Services Grid
- H2 (left): `Популярные сервисы`
- Link (right): `Все 90+ сервисов →` → `/catalog`

12 product cards, each with logo image, name, short description, "от X ₽" price, and "Оплатить ›" link → `/#popupforma`:

| # | Name | Description | Price | Logo file (on GitHub) |
|---|---|---|---|---|
| 1 | ChatGPT | Официальная подписка | от 650 ₽ | `GPT.PNG` |
| 2 | Claude | Оплата тарифа Pro | от 750 ₽ | `Claude.PNG` |
| 3 | Spotify | Premium аккаунт | от 550 ₽ | `Spotify.PNG` |
| 4 | YouTube Premium | Без рекламы | от 650 ₽ | `YouTube%20.PNG` |
| 5 | Adobe CC | Creative Cloud | от 1 200 ₽ | `Adobe.PNG` |
| 6 | Canva | Pro подписка | от 400 ₽ | `Canva.PNG` |
| 7 | Discord | Nitro подписка | от 550 ₽ | `Discord.PNG` |
| 8 | Booking | Бронирование | от 650 ₽ | `Booking.PNG` |
| 9 | Figma | Professional | от 900 ₽ | `Figma.PNG` |
| 10 | Zoom | Pro подписка | от 550 ₽ | `Zoom.PNG` |
| 11 | Notion | Plus / Business | от 500 ₽ | `Notion.PNG` |
| 12 | Stripe | Платежи | от 650 ₽ | `Stripe.PNG` |

First card (ChatGPT) has white background (`pp-pc-ic-w` class) — others have dark icon background.

## Section 3 — Invoice CTA Banner
- Tag: `Дополнительная услуга`
- H2: `Оплачиваем счета от иностранных компаний`
- Body text: `Инвойсы за обучение, услуги, товары. USD, EUR, GBP и другие валюты. SWIFT-перевод напрямую получателю.`
- CTA button: `Оплатить инвойс` → `#popupinvoice`

## Section 4 — Stats Strip (4 columns)
| Number | Label |
|---|---|
| `5.0 ★` | Рейтинг на Avito |
| `5–15 мин` | От заявки до оплаты |
| `90 +` | Сервисов в каталоге |
| `7/7` | Дней на связи с 08:00 |

## Section 5 — About
- Tag: `О нас`
- Badge: `Платформа оплаты зарубежных сервисов и подписок`
- H2: `Оплата зарубежных сервисов и подписок из России`
- Subtitle paragraph: `ChatGPT, Netflix, Booking, Spotify, Adobe, Discord и многие другие. Помогаем клиентам из России оплачивать иностранные сервисы и счета — быстро, безопасно, без автосписаний.`
- Right side: illustration image `images/tild3036-3438-4435-b735-396332356232__30a59f4c-f18e-4cc4-8.png` (alt: `PlataPay — платформа оплаты зарубежных сервисов`).

## Section 6 — Final CTA Card
- H2: `Не нашли свой сервис?`
- Body: `Напишите нам — оплатим практически любой зарубежный сервис или счёт.`
- Buttons (in order):
  - Primary: `Открыть каталог` (with arrow →) → `/catalog`
  - Telegram (green-ish): `Написать в Telegram` (Telegram SVG) → `https://t.me/Kimzar_A`
- Hours line: `Работаем ежедневно с 08:00 до 24:00 по МСК · ответ за 1–15 минут`

## Section 7 — "How it works?" (4 steps)
H2: `Как это работает?`

| # | H3 | Body |
|---|---|---|
| 1 | Оставляете заявку | Выбираете нужный сервис в каталоге |
| 2 | Уточняем детали | Связываемся и согласовываем оплату |
| 3 | Оплачиваете удобно | Картой или через СБП — как удобно |
| 4 | Получаете доступ | Оплачиваем сервис и подтверждаем |

Steps are separated by a dashed connector (`pp-dash`).

## Section 8 — "Why choose us?" (6 features)
H2: `Почему выбирают нас?`

| # | H3 | Body |
|---|---|---|
| 1 | Безопасные платежи | Гарантия безопасности и конфиденциальности |
| 2 | Работаем с РФ картами | Оплата российскими картами и СБП |
| 3 | Грамотные специалисты | Поможем, даже если сервиса нет в каталоге |
| 4 | Быстро и удобно | Оформим за 5 минут удобным способом |
| 5 | Поддержка с 08:00 | На связи каждый день без выходных |

(Note: extraction shows 5 items but layout suggests 6 cells — verify in production; original may have had a hidden 6th feature.)

## Section 9 — Floating contact buttons (sticky right side)
Four small floating action buttons (in order):
- Telegram → `https://t.me/Kimzar_A`
- WhatsApp → `https://wa.me/79676726909?text=Привет!%20Хочу%20сделать%20заказ` (text is URL-encoded "Привет! Хочу сделать заказ")
- Mail → `mailto:apolon7-rus@mail.ru`
- Phone → `tel:+79676726909`

## Section 10 — Reviews + Quick FAQ (two-column block, id=`Otzivi`)

**Left column — Отзывы клиентов**
- H2: `Отзывы клиентов`
- Right link: `Смотреть все отзывы` → Avito profile URL: `https://m.avito.ru/user/0458b806c10e79c5e618d6625d9eed1f/profile/all/predlozheniya_uslug?id=7993012321&src=item&sellerId=0458b806c10e79c5e618d6625d9eed1f#open-reviews-list`

Reviews (JS-injected, hardcoded in source):

| Avatar (letter, bg color) | Name | Stars | Date | Text |
|---|---|---|---|---|
| А (`#FFB300`) | Александра Шупьгина | 5 | 3 мая | `Обращаюсь уже 2 раз. Всё быстро и надёжно, спасибо PlataPay!` |
| М (`#E91E63`) | Максим | 5 | 4 мая | `Быстро. Чётко. 10 минут — и вопрос решён.` |
| Ю (`#7E57C2`) | Юлия | 5 | 22 марта | `Очень оперативно помогли с оплатой 20$. Рекомендую на 100%.` |

Each card also has a "Проверенный отзыв" verification badge and an "Avito" badge (`#9bc736`).

**Right column — Часто задаваемые вопросы** (3 quick rows linking to popups):
- `Насколько это безопасно?` → `#popup:infoblock`
- `Какие способы оплаты доступны?` → `#popup2`
- `Как быстро происходит оплата?` → `#popup3`

## Three Mini Popup Contents (Tilda T390 popups)

### `#popup:infoblock` — Насколько это безопасно?
> Мы работаем только через официальные способы оплаты и не запрашиваем лишние данные. Все детали заказа согласовываются заранее, а подтверждение оплаты предоставляется после выполнения услуги.

### `#popup2` — Какие способы оплаты доступны?
> Мы принимаем оплату удобным для вас способом: через СБП, банковские карты российских и зарубежных банков, а также переводы на банковский счёт. После оформления заявки менеджер предложит доступные варианты и поможет выбрать наиболее удобный и выгодный способ оплаты.

### `#popup3` — Как быстро происходит оплата?
> Большинство заказов выполняется в течение 5–15 минут после подтверждения оплаты и получения необходимых данных. В отдельных случаях срок может зависеть от особенностей конкретного сервиса, проверки платежа или времени обработки со стороны поставщика, но мы всегда стараемся выполнить заказ максимально быстро и держим вас в курсе статуса.

## Order Form Modal (`#popupforma`) — Detailed Spec
- H3 title: `Оформить заявку на оплату`
- Subtitle: `Ответим и оплатим в течение 5–15 минут`
- Close button: `×`

Fields in order:
| # | Label | Type | Placeholder / Options | Required |
|---|---|---|---|---|
| 1 | `Какой сервис нужно оплатить?` | select | (list of services from catalog; freeform fallback) | * |
| 2 | `Укажите название сервиса` | text input | `Например: Midjourney` | * |
| 3 | `Тариф / вариант подписки` | select | (predefined tariffs) | * |
| 4 | `Тариф / вариант подписки` (custom) | text input | `Например: Pro, годовая, $20` |  |
| 5 | `Сумма пополнения` | text input | `Например: 20` |  |
| 6 | (currency for amount) | select | `USD`, `EUR`, `RUB` |  |
| 7 | `Желаемый способ связи` | select | `Выберите способ`, `Telegram`, `WhatsApp`, `Телефон`, `Email` | * |
| 8 | `Контакт` | text input | `@username` |  |
| 9 | `Ваше имя` | text input | `Как к вам обращаться` | * |
| 10 | `Телефон` | (country code select) + `tel` input | `(___) ___-__-__` | * |
| 11 | `Дополнительная информация` | textarea | `Если есть, что уточнить` |  |
| 12 | `Согласие на обработку персональных данных` | checkbox | — | * |

Submit button: `Отправить заявку`. Form posts via Tilda's form handler — replace with own endpoint (no explicit `action` attribute; uses Tilda's project formkey `da5a1b9e6e74a60007d9c07625661986`).

## Invoice Form Modal (`#popupinvoice`) — Detailed Spec
- H3: `Оплата зарубежного счёта (инвойса)`
- Subtitle: `Оплатим ваш инвойс от иностранной компании — обучение, услуги, товары`
- Close: `×`

Fields in order:
| # | Label | Type | Placeholder / Options | Required |
|---|---|---|---|---|
| 1 | `Ваше имя` | text | `Как к вам обращаться` | * |
| 2 | `Способ связи` | select | `Выберите способ`, `Telegram`, `WhatsApp`, `Телефон (звонок)`, `Email` | * |
| 3 | `Телефон` | tel | `+7 999 123-45-67` | * |
| 4 | `Telegram / WhatsApp / Email` | text | `@username, ссылка или email` |  |
| 5 | `Получатель платежа (только латиницей)` | text | `Company name / University / Supplier` | * |
| 6 | `Сумма` | text | `Например: 1500` | * |
| 7 | `Валюта` | select | `Выберите`, `USD ($)`, `EUR (€)`, `GBP (£)`, `CNY (¥)`, `TRY (₺)`, `CHF`, `JPY`, `AED`, `Другая` | * |
| 8 | `Назначение платежа (только латиницей)` | text | `Payment for tuition / services / goods` | * |
| 9 | `Реквизиты получателя (IBAN / SWIFT / счёт, только латиницей)` | textarea | `IBAN: ...\nSWIFT/BIC: ...\nAccount number / Bank name` |  |
| 10 | `Срок оплаты` | text | `Например: до 5 июня` |  |
| 11 | `Прикрепите инвойс` | file (PDF/JPG/PNG, max 20 MB) | helper: `Нажмите, чтобы загрузить PDF, JPG или PNG, до 20 МБ` | * |
| 12 | `Дополнительная информация` | textarea | `Реквизиты, особенности, что важно учесть` |  |
| 13 | `Согласие на обработку персональных данных` | checkbox | — | * |

Submit button: `Отправить заявку`.

---

# Page 2 — Каталог (Catalog) — `/catalog`
Source: `tilda-original/page143711326.html` (+ `page143711326body.html`)

## Hidden SEO Headings
- H1: `Каталог зарубежных сервисов и подписок`
- H2: `AI и нейросети`, `Видео и дизайн`, `Музыка и кино`, `Игры и пополнения`, `Облачные сервисы`
- H3 examples: `ChatGPT Plus`, `Claude Pro`, `Midjourney`, `Netflix`, `Spotify Premium`, `Steam`, `PlayStation Plus`

## Visible Layout

- H1: `Все сервисы`
- Subtitle: `Не нашли подходящий зарубежный сервис? Свяжитесь с нами, чтобы уточнить возможность его оплаты`
- **Search box** (`#ppSearch`): input placeholder `Найти сервис…` — client-side filters the JS catalog grid by name match.
- Two main UI areas (JS-rendered):
  - **Category sidebar** (`#ppCats`): list of buttons with count badges. Active state highlights.
  - **Grid** (`#ppGrid`): cards rendered from `SERVICES` array. Each card: logo, name, description, price, "Оплатить" button → `/#popupforma`. Cards with `bg:1` get a white logo background panel (`pp-pc-ic-w`), others use a dark panel.
- Bottom of the grid carries a `Нет нужного сервиса?` CTA — `REQUEST_URL = "/#popupforma"`.

## Categories (`CATS` array, rendered as filter buttons with counts)

| key | Label |
|---|---|
| `all` | Все сервисы |
| `AI` | AI / Нейросети |
| `Видео` | Видео / Дизайн |
| `Музыка` | Музыка / Кино |
| `Игры` | Игры |
| `Облако` | Облако / IT |
| `Бизнес` | Бизнес |
| `Обучение` | Обучение |
| `Путешествия` | Путешествия |
| `Маркет` | Маркетплейсы |

## Full Service List (`SERVICES` array — 87 cards)

All prices are `650 ₽`. All `url` values are `/#popupforma`. Each entry has a logo on GitHub: `https://raw.githubusercontent.com/alekyanrazmik-glitch/Just-PlataPay/master/<file>`. `bg:1` means card uses white logo background.

### Category: AI (20 services)
| Name | Description | Logo file | bg |
|---|---|---|---|
| ChatGPT | Официальная подписка | `GPT.PNG` | ✓ |
| Claude | Оплата тарифа Pro | `Claude.PNG` |  |
| Gemini | Google AI подписка | `Gemini%20%28Google%20AI%29.PNG` |  |
| Grok | Премиум доступ | `Grok.PNG` | ✓ |
| Perplexity | Pro подписка | `Perplexity.PNG` |  |
| Qwen | Доступ к моделям | `Qwen.PNG` |  |
| Kimi | Подписка | `Kimi.PNG` |  |
| DeepL | Pro перевод | `DeepL.PNG` |  |
| Codex | ИИ для кода | `Codex.PNG` | ✓ |
| Cursor | ИИ-редактор кода | `Cursor.PNG` | ✓ |
| GitHub Copilot | ИИ для кода | `GitHub%20Copilot.PNG` | ✓ |
| OpenRouter | Доступ к API | `OpenRouter.PNG` | ✓ |
| MiniMax | ИИ-модели | `MiniMax.PNG` |  |
| Manus | ИИ-агент | `Manus%20A.PNG` | ✓ |
| Writesonic | Тексты ИИ | `Writesonic.PNG` |  |
| Candy AI | ИИ-компаньон | `Candy%20AI.PNG` |  |
| Higgsfield AI | ИИ-видео | `Higgsfield%20AI.PNG` | ✓ |
| Kits.ai | ИИ-аудио | `Kits.ai.PNG` | ✓ |
| n8n | Автоматизация | `n8n.PNG` | ✓ |
| ManyChat | Чат-боты | `Manychat.PNG` | ✓ |

### Category: Видео (Video / Design) — 26 services
| Name | Description | Logo file | bg |
|---|---|---|---|
| Sora 2 | Генерация видео ИИ | `Sora%202.PNG` | ✓ |
| Midjourney | Генерация изображений | `Midjournei.PNG` | ✓ |
| Kling AI | ИИ-видео | `Kling%20Ai.PNG` | ✓ |
| Ideogram | Генерация изображений | `Ideogram.PNG` | ✓ |
| Krea | ИИ-визуал | `Krea.ai.PNG` | ✓ |
| Lensa AI | ИИ-фото | `Lensa%20AI.PNG` | ✓ |
| HeyGen | ИИ-аватары | `HeyGen.PNG` |  |
| Pika | ИИ-видео | `Pika.PNG` | ✓ |
| Gling | Монтаж ИИ | `Gling.PNG` | ✓ |
| Gamma | Презентации ИИ | `Gamma%20App.PNG` |  |
| Nano Banana | ИИ-генерация | `nano%20banana.PNG` | ✓ |
| Adobe | Creative Cloud | `Adobe.PNG` | ✓ |
| Adobe Creative Cloud | Все приложения | `Adobe%20Creative%20Cloud.PNG` |  |
| Adobe Photoshop | Фоторедактор | `Adobe%20Photoshop.PNG` |  |
| Adobe Premiere Pro | Видеомонтаж | `Adobe%20Premiere%20Pro.PNG` |  |
| Adobe After Effects | Моушн-дизайн | `Adobe%20After%20Effects.PNG` |  |
| Adobe Firefly | ИИ-генерация | `Adobe%20Firefly.PNG` |  |
| Photoshop | Фоторедактор | `PS.PNG` |  |
| Canva | Pro подписка | `Canva.PNG` |  |
| CapCut | Pro функции | `CapCut.PNG` |  |
| Figma | Professional | `Figma.PNG` |  |
| Freepik | Premium | `Freepik.PNG` |  |
| Shutterstock | Сток-контент | `Shutterstock.PNG` | ✓ |
| Artlist | Музыка и видео | `Artlist.PNG` | ✓ |
| Maxon Cinema 4D | 3D-графика | `Maxon%20Cinema.PNG` | ✓ |
| Cults 3D | 3D-модели | `Cults%203D.PNG` | ✓ |
| Loom | Запись экрана | `Loom.PNG` | ✓ |

### Category: Музыка (Music / Cinema) — 9 services
| Name | Description | Logo file | bg |
|---|---|---|---|
| Ableton | Live подписка | `Ableton.PNG` | ✓ |
| Splice | Сэмплы | `Splice.PNG` | ✓ |
| Epidemic Sound | Музыка для видео | `Epidemic%20Sound.PNG` | ✓ |
| Bandcamp | Музыка | `Bandcamp.PNG` |  |
| Suno | ИИ-музыка | `Suno%20AI.PNG` | ✓ |
| Spotify | Premium аккаунт | `Spotify.PNG` |  |
| YouTube Premium | Без рекламы | `YouTube%20.PNG` |  |
| Twitch | Подписки / Turbo | `Twitch.PNG` |  |
| TikTok | Монеты / подписка | `Tiktoc.WEBP` | ✓ |

### Category: Игры (Games) — 4 services
| Name | Description | Logo file | bg |
|---|---|---|---|
| Nintendo | eShop / Online | `Nintendo.PNG` |  |
| FACEIT | Premium | `Faceit.PNG` | ✓ |
| PS Plus (Турция) | Подписка PlayStation | `Подписка PS Plus (Турция).PNG` (URL-encoded) |  |
| Discord | Nitro подписка | `Discord.PNG` |  |

### Category: Облако (Cloud / IT) — 12 services
| Name | Description | Logo file | bg |
|---|---|---|---|
| Microsoft 365 | Office подписка | `Microsoft.PNG` |  |
| Google | Аккаунт / сервисы | `Google.PNG` |  |
| Google Drive | Хранилище | `Google%20Drive.PNG` |  |
| Google Cloud | Облачная платформа | `Google%20Cloud.PNG` |  |
| Google BigQuery | Аналитика данных | `Google%20BigQuery.PNG` |  |
| Dropbox | Plus / Pro | `Dropbox.PNG` |  |
| Cloudflare | Pro план | `Cloudflare.PNG` |  |
| Supabase | Backend / БД | `Supabase.PNG` |  |
| Proton Mail | Почта / VPN | `ProtonMail.PNG` |  |
| Swift | Разработка | `Swift.PNG` | ✓ |
| FlutterFlow | No-code приложения | `FlutterFlow.PNG` |  |
| Weavy | Встраиваемый UI | `Weavy.PNG` | ✓ |
| Wix | Premium сайт | `Wix.PNG` | ✓ |

### Category: Бизнес (Business) — 12 services
| Name | Description | Logo file | bg |
|---|---|---|---|
| Notion | Plus / Business | `Notion.PNG` | ✓ |
| Miro | Подписка | `Miro.PNG` |  |
| Airtable | Pro | `Airtable.PNG` |  |
| Jira | Подписка | `Jira.PNG` |  |
| Zoom | Pro подписка | `Zoom.PNG` |  |
| TradingView | Подписка | `TradingView.PNG` |  |
| Patreon | Подписки авторам | `Patreon.PNG` |  |
| Boosty | Подписки авторам | `Boosty.PNG` |  |
| Ko-fi | Донаты | `Ko-fi.PNG` |  |
| OnlyFans | Подписки | `OnlyFans.PNG` |  |
| Fansly | Подписки | `Fansly.PNG` |  |
| X Premium | Twitter Premium | `X%20%28twitter%29%20Premium.PNG` |  |

### Category: Маркет (Marketplaces) — 4 services
| Name | Description | Logo file |
|---|---|---|
| PayPal | Платежи | `PayPal.PNG` |
| Stripe | Платежи | `Stripe.PNG` |
| Alipay | Платежи | `Alipay.PNG` |
| App Store | Пополнение | `App%20Store.PNG` |

### Category: Обучение (Education) — 5 services
| Name | Description | Logo file |
|---|---|---|
| Coursera | Plus подписка | `Coursera.PNG` |
| Udemy | Курсы | `Udemy.PNG` |
| Duolingo | Super | `Duolingo.PNG` |
| italki | Уроки языка | `italki.PNG` |
| MyHeritage | Генеалогия | `MyHeritage.PNG` |

### Category: Путешествия (Travel) — 4 services
| Name | Description | Logo file |
|---|---|---|
| Airbnb | Оплата брони | `Airbnb.PNG` |
| Booking | Бронирование | `Booking.PNG` |
| Agoda | Отели | `Agoda.PNG` |
| Airalo | eSIM связь | `airalo.PNG` |

### Domains map (fallback favicon source)
The catalog JS includes a long `domains` map for fetching favicons via Clearbit / Simple Icons when a `logo:` field is missing. Useful list of canonical domains for an admin UI:

`Poe → poe.com`, `Character.AI → character.ai`, `Jasper AI → jasper.ai`, `Copy.ai → copy.ai`, `Suno → suno.com`, `Udio → udio.com`, `DeepSeek → deepseek.com`, `Sora → openai.com`, `Midjourney → midjourney.com`, `Pika Labs → pika.art`, `Runway → runwayml.com`, `Envato → envato.com`, `Leonardo AI → leonardo.ai`, `Krea → krea.ai`, `Topaz → topazlabs.com`, `Descript → descript.com`, `Disney+ → disneyplus.com`, `Paramount+ → paramountplus.com`, `Peacock → peacocktv.com`, `Hulu → hulu.com`, `DAZN → dazn.com`, `Genshin Impact → genshin.hoyoverse.com`, `Mihoyo → hoyoverse.com`, `Brawl Stars → supercell.com`, `PUBG Mobile → pubgmobile.com`, `Free Fire → ff.garena.com`, `World of Tanks → worldoftanks.eu`, `Mobile Legends → mobilelegends.com`, `1Password → 1password.com`, `NordVPN → nordvpn.com`, `ExpressVPN → expressvpn.com`, `Tilda → tilda.cc`, `MasterClass → masterclass.com`, `Quizlet → quizlet.com`, `Steam Market → steamcommunity.com`, `ChatGPT Plus → openai.com`, `Claude Pro → anthropic.com`, `Perplexity Pro → perplexity.ai`, `Grok → x.ai`, `Gemini Advanced → gemini.google.com`, `ChatGPT Team → openai.com`, `GitHub Copilot → github.com`, `Cursor Pro → cursor.com`, `Mistral → mistral.ai`, `ElevenLabs → elevenlabs.io`, `Hugging Face → huggingface.co`, `Replicate → replicate.com`, `Notion AI → notion.so`, `Adobe CC → adobe.com`, `Photoshop → adobe.com`, `Lightroom → adobe.com`, `Premiere Pro → adobe.com`, `After Effects → adobe.com`, `Canva Pro → canva.com`, `CapCut Pro → capcut.com`, `Freepik → freepik.com`, `Figma → figma.com`, `Framer → framer.com`, `Pixlr → pixlr.com`, `YouTube Premium → youtube.com`, `YouTube Music → music.youtube.com`, `Spotify Premium → spotify.com`, `Apple Music → music.apple.com`, `Netflix → netflix.com`, `HBO Max → max.com`, `Prime Video → primevideo.com`, `Apple TV+ → tv.apple.com`, `Crunchyroll → crunchyroll.com`, `Tidal → tidal.com`, `Deezer → deezer.com`, `SoundCloud → soundcloud.com`, `Twitch → twitch.tv`, `Audible → audible.com`, `Steam → steampowered.com`, `PlayStation → playstation.com`, `Xbox → xbox.com`, `Nintendo → nintendo.com`, `Epic Games → epicgames.com`, `Riot Games → riotgames.com`, `EA Play → ea.com`, `Ubisoft+ → ubisoft.com`, `Battle.net → blizzard.com`, `Roblox → roblox.com`, `Discord Nitro → discord.com`, `Supercell → supercell.com`, `Rockstar → rockstargames.com`, `Google Workspace → workspace.google.com`, `Google One → one.google.com`, `iCloud+ → icloud.com`, `Dropbox → dropbox.com`, `Microsoft 365 → microsoft.com`, `GitHub → github.com`, `Cloudflare → cloudflare.com`, `DigitalOcean → digitalocean.com`, `Vercel → vercel.com`, `Netlify → netlify.com`, `Namecheap → namecheap.com`, `GoDaddy → godaddy.com`, `JetBrains → jetbrains.com`, `Proton → proton.me`, `MEGA → mega.nz`, `Backblaze → backblaze.com`, `Atlassian → atlassian.com`, `Notion → notion.so`, `Slack → slack.com`, `Zoom → zoom.us`, `Trello → trello.com`, `Asana → asana.com`, `Miro → miro.com`, `Airtable → airtable.com`, `ClickUp → clickup.com`, `Monday → monday.com`, `HubSpot → hubspot.com`, `Mailchimp → mailchimp.com`, `Calendly → calendly.com`, `LinkedIn → linkedin.com`, `Grammarly → grammarly.com`, `Wix → wix.com`, `Squarespace → squarespace.com`, `Shopify → shopify.com`, `Upwork → upwork.com`, `Fiverr → fiverr.com`, `Duolingo → duolingo.com`, `Coursera → coursera.org`, `Udemy → udemy.com`, `Skillshare → skillshare.com`, `Khan Academy → khanacademy.org`, `Brilliant → brilliant.org`, `Airbnb → airbnb.com`, `Booking → booking.com`, `Uber → uber.com`, `Bolt → bolt.eu`, `Amazon → amazon.com`, `eBay → ebay.com`, `AliExpress → aliexpress.com`, `Google Play → play.google.com`, `App Store → apple.com`.

---

# Page 3 — FAQ — `/faq`
Source: `tilda-original/page144727686.html` (+ `page144727686body.html`)

## Visible Layout
- H1: `Частые вопросы`
- Subtitle paragraph: `Собрали ответы на главные вопросы об оплате зарубежных сервисов. Не нашли нужный — напишите нам, ответим лично.`

### FAQ Accordion (9 items, JS-rendered from `FAQ` array)

Each row has a `+` icon that toggles `pp-faq-a` body open/closed (accordion with mutual close).

**1. Q: `Насколько это безопасно?`**
A: `Мы работаем вручную, без автосписаний и без доступа к вашим картам. Вы оплачиваете только конкретную заявку, а мы проводим оплату нужного сервиса за вас. Никакие данные карты нам не передаются.`

**2. Q: `Как происходит оплата?`**
A: `Вы оставляете заявку с названием сервиса и тарифом, мы выставляем сумму в рублях, вы оплачиваете удобным способом — и мы оплачиваем сервис за вас. Подтверждение и детали присылаем в личные сообщения.`

**3. Q: `Как быстро проходит оплата?`**
A: `Обычно оплата занимает от 5 до 15 минут после поступления средств. В редких случаях (ночное время или загруженность) — до нескольких часов. Мы всегда держим вас в курсе статуса.`

**4. Q: `Какая комиссия?`**
A: `Комиссия составляет от 5% от суммы платежа. Точную сумму с учётом курса и комиссии мы сообщаем до оплаты — никаких скрытых платежей.`

**5. Q: `Какие сервисы вы можете оплатить?`**
A: `ChatGPT, Netflix, Spotify, Adobe, Steam, Booking и сотни других зарубежных сервисов и подписок. Если нужного сервиса нет в каталоге — оставьте заявку, скорее всего мы сможем его оплатить.`

**6. Q: `Какими способами можно оплатить?`**
A: `Принимаем оплату российскими картами и другими удобными способами. Доступные варианты вы выбираете при оформлении заявки.`

**7. Q: `Нужно ли передавать логин и пароль от аккаунта?`**
A: `Только если оплата требует входа в ваш аккаунт сервиса. В большинстве случаев это не нужно. Мы запрашиваем минимум данных и работаем конфиденциально.`

**8. Q: `Что если оплата не пройдёт?`**
A: `Если по какой-то причине оплату провести не удастся, мы вернём вам средства в полном объёме. Такие случаи редки, и мы всегда предупреждаем заранее, если есть сложности с конкретным сервисом.`

**9. Q: `Как с вами связаться?`**
A: `Напишите нам в Telegram или оставьте заявку на сайте — мы на связи каждый день. Обычно отвечаем в течение нескольких минут.`

### CTA after accordion
- Question: `Остались вопросы?`
- Button: `Написать в Telegram` → `https://t.me/Kimzar_A`
- Hours line: `Ежедневно с 08:00 до 24:00 по МСК · ответ за 1–15 минут`

---

# Page 4 — Контакты (Contacts) — `/contacts`
Source: `tilda-original/page144877396.html` (+ `page144877396body.html`)

## Visible Layout

- H1: `Свяжитесь с нами`
- Subtitle paragraph: `Ответим на любой вопрос и поможем оплатить нужный сервис. На связи каждый день, без выходных.`

### Contact Channel Cards (3 large clickable cards)

| Channel | Icon class | H3 title | Body line | Footer text | Href |
|---|---|---|---|---|---|
| Telegram | `pp-c-tg` | `Telegram` | `@Kimzar_A` | `Написать →` | `https://t.me/Kimzar_A` |
| WhatsApp | `pp-c-wa` | `WhatsApp` | `+7 967 672-69-09` | `Написать →` | `https://wa.me/79676726909` |
| Email | `pp-c-mail` | `Email` | `Apolon7-rus@mail.ru` | `Написать →` | `mailto:Apolon7-rus@mail.ru` |

### Info Block (2 items below cards)

**Item 1 — Время работы (Working hours)**
- H4: `Время работы`
- Body (one paragraph, two lines):
  - `Ежедневно с 08:00 до 24:00 по МСК · без выходных`
  - `Среднее время ответа — от 1 до 15 минут`

**Item 2 — Работаем официально (Legal info)**
- H4: `Работаем официально`
- Body:
  - `ООО «Аполон7-Рус»`
  - `ИНН 2304086282 · КПП 230401001 · ОГРН 1252300042356`
  - `353460, Краснодарский край, г. Геленджик, ул. Островского, 80А`

**No contact form on this page** — only the 3 channel cards. The order/invoice forms are still reachable via the global modals (`#popupforma`, `#popupinvoice`) triggered from the header CTA.

---

# Legal Pages (modal content, used on every page)

## Публичная оферта (`#popupoferta`)

- H2 (title): `Публичная оферта`
- Meta line: `Актуальная редакция · Сайт: payoplata.ru`
- Close button: `×` plus footer button `Понятно, закрыть`

### 1. Общие положения
1.1. Настоящий документ является публичной офертой ООО «Аполон7-Рус» (далее — «Исполнитель») и определяет условия оказания услуг через сайт payoplata.ru.
1.2. Полным и безоговорочным акцептом настоящей оферты считается направление заявки через сайт, мессенджеры, электронную почту либо иным способом, позволяющим идентифицировать Заказчика.
1.3. Исполнитель оказывает услуги по организации и сопровождению оплаты зарубежных цифровых сервисов, подписок, программного обеспечения, товаров и иных услуг третьих лиц по поручению Заказчика.
1.4. Исполнитель вправе отказать в исполнении заявки без объяснения причин до момента принятия денежных средств либо вернуть полученные денежные средства Заказчику.

### 2. Реквизиты Исполнителя
- ООО «Аполон7-Рус»
- ОГРН: 1252300042356
- ИНН: 2304086282
- КПП: 230401001
- Юридический адрес: 353460, Краснодарский край, г. Геленджик, ул. Островского, д. 80А
- E-mail: apolon7-rus@mail.ru

### 3. Порядок оказания услуг
3.1. Заказчик направляет заявку на оплату сервиса, товара или услуги.
3.2. Исполнитель проверяет возможность исполнения заявки.
3.3. В случае подтверждения возможности исполнения Исполнитель сообщает итоговую стоимость услуги.
3.4. После получения оплаты Исполнитель приступает к исполнению заявки.
3.5. После исполнения заявки Исполнитель направляет Заказчику подтверждение выполнения услуги.

### 4. Обязанности Заказчика
4.1. Самостоятельно убедиться в законности приобретаемого сервиса, товара или услуги.
4.2. Не использовать услуги Исполнителя для целей, противоречащих законодательству Российской Федерации.
4.3. Предоставлять достоверную информацию, необходимую для исполнения заявки.
4.4. В случае необходимости предоставить доступ к аккаунту либо иную информацию, требуемую для исполнения заказа.

### 5. Сроки исполнения
5.1. Стандартный срок исполнения заявки составляет до 2 (двух) рабочих дней с момента получения оплаты и всех необходимых данных.
5.2. Срок может быть увеличен по соглашению сторон либо по причинам, не зависящим от Исполнителя.

### 6. Стоимость услуг
6.1. Размер комиссии определяется Исполнителем и доводится до сведения Заказчика до момента оплаты.
6.2. Оплата услуг означает согласие Заказчика со стоимостью услуги.

### 7. Возврат денежных средств
7.1. В случае невозможности исполнения заявки по вине Исполнителя денежные средства подлежат возврату Заказчику.
7.2. Если заявка успешно исполнена, услуга считается оказанной надлежащим образом и денежные средства возврату не подлежат.
7.3. Если третье лицо (магазин, сервис, поставщик услуг) отказало в проведении платежа, возврат осуществляется после фактического возврата денежных средств Исполнителю.
7.4. Возврат осуществляется тем же способом, которым была произведена оплата, если иное не предусмотрено законодательством.
7.5. Заявление на возврат денежных средств может быть подано Заказчиком в течение 14 (четырнадцати) календарных дней с момента оплаты услуги.
7.6. Заявление о возврате рассматривается Исполнителем в течение 3 (трёх) рабочих дней с момента его получения; в отдельных случаях срок рассмотрения может быть увеличен до 10 (десяти) рабочих дней.
7.7. При принятии положительного решения возврат денежных средств осуществляется в течение 7 (семи) рабочих дней с даты принятия такого решения.

### 8. Ответственность сторон
8.1. Исполнитель не несёт ответственности за действия третьих лиц, включая интернет-магазины, сервисы, банки, платёжные системы и поставщиков услуг.
8.2. Исполнитель не несёт ответственности за блокировку аккаунтов, ограничение доступа к сервисам или изменение правил работы сервисов третьих лиц.
8.3. Исполнитель отвечает только за надлежащее выполнение собственных обязательств по настоящей оферте.

### 9. Персональные данные
9.1. Заказчик даёт согласие на обработку персональных данных в соответствии с Политикой конфиденциальности, размещённой на сайте payoplata.ru.

### 10. Форс-мажор
10.1. Стороны освобождаются от ответственности за неисполнение обязательств вследствие обстоятельств непреодолимой силы.

### 11. Заключительные положения
11.1. Исполнитель вправе изменять условия настоящей оферты без предварительного уведомления.
11.2. Актуальная редакция оферты размещается на сайте payoplata.ru.
11.3. Все споры разрешаются путём переговоров, а при невозможности достижения соглашения — в соответствии с законодательством Российской Федерации.

---

## Политика конфиденциальности (`#popuppolicy`)

- H2: `Политика конфиденциальности` (title styled with second word in accent color)
- Meta: `Актуальная редакция · Сайт: payoplata.ru`

### 1. Общие положения
Настоящая политика обработки персональных данных составлена в соответствии с требованиями Федерального закона от 27.07.2006 №152-ФЗ «О персональных данных» (далее — Закон о персональных данных) и определяет порядок обработки персональных данных и меры по обеспечению безопасности персональных данных, предпринимаемые ООО «Аполон7-Рус» (далее — Оператор).
1.1. Оператор ставит своей важнейшей целью и условием осуществления своей деятельности соблюдение прав и свобод человека и гражданина при обработке его персональных данных, в том числе защиту права на неприкосновенность частной жизни, личную и семейную тайну.
1.2. Настоящая политика Оператора в отношении обработки персональных данных (далее — Политика) применяется ко всей информации, которую Оператор может получить о посетителях веб-сайта **https://payoplata.ru**.

### 2. Основные понятия, используемые в Политике
2.1. **Автоматизированная обработка персональных данных** — обработка персональных данных с помощью средств вычислительной техники.
2.2. **Блокирование персональных данных** — временное прекращение обработки персональных данных.
2.3. **Веб-сайт** — совокупность графических и информационных материалов, а также программ для ЭВМ и баз данных, обеспечивающих их доступность в сети Интернет по сетевому адресу https://payoplata.ru.
2.4. **Информационная система персональных данных** — совокупность содержащихся в базах данных персональных данных и обеспечивающих их обработку информационных технологий и технических средств.
2.5. **Обезличивание персональных данных** — действия, в результате которых невозможно определить принадлежность персональных данных конкретному субъекту персональных данных.
2.6. **Обработка персональных данных** — любое действие или совокупность действий, совершаемых с персональными данными, включая сбор, запись, систематизацию, накопление, хранение, уточнение, использование, передачу, обезличивание, блокирование, удаление и уничтожение персональных данных.
2.7. **Оператор** — ООО «Аполон7-Рус», самостоятельно организующее и осуществляющее обработку персональных данных.
2.8. **Персональные данные** — любая информация, относящаяся прямо или косвенно к определённому или определяемому пользователю веб-сайта https://payoplata.ru.
2.9. **Пользователь** — любой посетитель веб-сайта https://payoplata.ru.
2.10. **Предоставление персональных данных** — действия, направленные на раскрытие персональных данных определённому лицу или определённому кругу лиц.
2.11. **Распространение персональных данных** — любые действия, направленные на раскрытие персональных данных неопределённому кругу лиц.
2.12. **Трансграничная передача персональных данных** — передача персональных данных на территорию иностранного государства.
2.13. **Уничтожение персональных данных** — действия, в результате которых персональные данные уничтожаются безвозвратно.

### 3. Основные права и обязанности Оператора
3.1. **Оператор имеет право:**
— получать от субъекта персональных данных достоверные сведения и документы;
— продолжить обработку персональных данных после отзыва согласия в случаях, предусмотренных законодательством РФ;
— самостоятельно определять необходимые меры по обеспечению безопасности персональных данных.

3.2. **Оператор обязан:**
— предоставлять субъекту персональных данных информацию об обработке его персональных данных;
— организовывать обработку персональных данных в соответствии с законодательством РФ;
— рассматривать обращения субъектов персональных данных;
— публиковать настоящую Политику в открытом доступе;
— принимать меры по защите персональных данных;
— прекращать обработку и уничтожать персональные данные в случаях, предусмотренных законодательством РФ.

### 4. Реквизиты Оператора
- **ООО «Аполон7-Рус»**
- ОГРН: 1252300042356
- ИНН: 2304086282
- КПП: 230401001
- Юридический адрес: 353460, Краснодарский край, г. Геленджик, ул. Островского, д. 80А
- E-mail: apolon7-rus@mail.ru
- Сайт: https://payoplata.ru

(The privacy policy block in the exported HTML is truncated at section 4 — only sections 1–4 are present in the markup. Sections 5+ that a typical 152-ФЗ policy would carry are not in the source files; if you want full compliance, port them in fresh.)

Footer button: `Понятно, закрыть`

---

# Implementation Notes for the Rewrite

- **All product/order CTAs route to `#popupforma`** — implement one shared `<OrderModal />` and `<InvoiceModal />` opened by URL hash or state.
- **Search on home** posts to `/catalog` with `q=` query string — catalog page should read `q` from URL and pre-filter the grid.
- **Catalog data is a static JS array (`SERVICES`) of 87 items** — port to a TypeScript array or JSON file. All prices currently `650 ₽` (placeholder) and all URLs point at the order modal — keep this pattern or upgrade to a real DB.
- **Reviews are 3 hardcoded items** in JS — port to JSON; add proper "Verified" badge component.
- **FAQ is a 9-item JS array** — port to JSON or MDX.
- **No backend forms** — Tilda's form handler accepts submissions via `data-tilda-formskey="da5a1b9e6e74a60007d9c07625661986"`. On rewrite, point order/invoice forms at your own endpoint (the invoice form needs multipart for file upload).
- **WhatsApp link carries a prefilled message**: `Привет! Хочу сделать заказ` (URL-encoded). Reuse on the new floating CTA bar.
- **All social handles** for the brand:
  - Telegram: `@Kimzar_A` → `https://t.me/Kimzar_A`
  - WhatsApp: `+7 967 672-69-09` → `https://wa.me/79676726909`
  - Email: `Apolon7-rus@mail.ru`
  - Phone: `+7 967 672-69-09` (tel link)
  - Avito profile URL above (used for "all reviews" button)
- **Navigation active state** — original used `data-path` attribute matched against `window.location.pathname` to highlight the active link.
