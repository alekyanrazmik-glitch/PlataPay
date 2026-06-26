# Деплой PlataPay на Railway

## Что добавлено

| Компонент | Описание |
|---|---|
| `server/index.js` | Express-сервер: раздаёт статику + API |
| `server/routes/payment.js` | `POST /api/create-invoice`, `POST /api/webhook/enot`, `GET /api/order/:id` |
| `server/services/enot.js` | Создание счёта через Enot API v2 |
| `server/services/telegram.js` | Отправка уведомлений в Telegram |
| `server/utils/signature.js` | Проверка HMAC-SHA256 подписи webhook |
| `server/public/success.html` | Страница успешной оплаты |
| `server/public/fail.html` | Страница неудачной оплаты |
| `seo/enhance.mjs` | Изменён mini-form: теперь вызывает `/api/create-invoice` |
| `railway.json` | Конфигурация Railway |
| `package.json` | Зависимости (express, cors, dotenv, uuid) |

---

## Переменные окружения

Скопируйте `.env.example` в `.env` и заполните:

```bash
cp .env.example .env
```

| Переменная | Значение | Где взять |
|---|---|---|
| `ENOT_SECRET_KEY` | Секретный ключ | Enot → Настройки магазина |
| `ENOT_API_KEY` | Дополнительный ключ | Enot → Настройки магазина |
| `ENOT_SHOP_ID` | ID магазина | Enot → Магазины |
| `SERVER_URL` | `https://ВАШ-ПРОЕКТ.up.railway.app` | Railway → Deployment URL |
| `WEBHOOK_URL` | `https://ВАШ-ПРОЕКТ.up.railway.app/api/webhook/enot` | = SERVER_URL + путь |
| `TELEGRAM_BOT_TOKEN` | Токен бота | @BotFather |
| `TELEGRAM_CHAT_ID` | ID вашего чата | @userinfobot |

---

## Локальный запуск

```bash
# 1. Установить зависимости
npm install

# 2. Создать .env (заполнить реальными ключами)
cp .env.example .env

# 3. Собрать статику
node build.mjs

# 4. Запустить сервер
npm start
# или для разработки с автоперезагрузкой:
npm run dev
```

Сайт откроется на http://localhost:3000

---

## Деплой на Railway

### Первый деплой

1. Зайдите на [railway.app](https://railway.app) и создайте аккаунт
2. Нажмите **New Project → Deploy from GitHub repo**
3. Выберите репозиторий `alekyanrazmik-glitch/PlataPay`
4. Railway автоматически найдёт `railway.json` и запустит сборку

### Настройка переменных окружения

5. В проекте Railway откройте **Variables**
6. Добавьте все переменные из таблицы выше
7. После добавления `SERVER_URL` задайте также `WEBHOOK_URL`

### Получение URL

8. После деплоя Railway покажет публичный URL вида `https://platapay-xxx.up.railway.app`
9. Обновите `SERVER_URL` и `WEBHOOK_URL` в Variables → **Redeploy**

### Настройка Enot

10. В личном кабинете Enot → Магазины → ваш магазин
11. В поле **Webhook URL** укажите: `https://ВАШ-ПРОЕКТ.up.railway.app/api/webhook/enot`
12. Сохраните

---

## Поток оплаты

```
Пользователь → кнопка "Оплатить"
  ↓
Мини-форма (сервис + сумма + контакт)
  ↓
POST /api/create-invoice → сервер → Enot API
  ↓
Enot возвращает ссылку на оплату
  ↓
Редирект на страницу оплаты Enot
  ↓
Пользователь оплачивает
  ↓
Enot → POST /api/webhook/enot (с HMAC-SHA256 подписью)
  ↓
Сервер: проверяет подпись → статус = "paid"
  ↓
Telegram-уведомление → страница /success
```

---

## API-эндпоинты

### `POST /api/create-invoice`

Тело запроса (JSON):
```json
{
  "service": "ChatGPT Plus",
  "amount": 3200,
  "contact": "@username"
}
```

Ответ:
```json
{
  "orderId": "uuid",
  "paymentUrl": "https://enot.io/pay/..."
}
```

### `POST /api/webhook/enot`

Вызывается Enot автоматически после оплаты.  
Заголовок: `x-enot-signature: <HMAC-SHA256 подпись>`

### `GET /api/order/:id`

Проверить статус заказа:
```json
{
  "id": "uuid",
  "service": "ChatGPT Plus",
  "status": "paid",
  "amount": 3200,
  "createdAt": "...",
  "paidAt": "..."
}
```

---

## Хранение заказов

Сейчас заказы хранятся **в памяти** (Map). При перезапуске сервера они теряются.

Для продакшна добавьте хранилище:
- **Railway Postgres** — добавьте в проект, замените Map на pg-запросы
- **Redis** (KV) — Railway предлагает встроенно
- **SQLite** — для простых случаев без доп. сервисов
