export type Service = {
  name: string;
  desc: string;
  logo: string;
  cat: string;
  bg?: boolean;
  price?: number;
};

const LOGO_BASE =
  'https://raw.githubusercontent.com/alekyanrazmik-glitch/Just-PlataPay/master/';

export const logoUrl = (file: string) => LOGO_BASE + file;

export const CATEGORIES: { key: string; label: string }[] = [
  { key: 'all', label: 'Все сервисы' },
  { key: 'AI', label: 'AI / Нейросети' },
  { key: 'Видео', label: 'Видео / Дизайн' },
  { key: 'Музыка', label: 'Музыка / Кино' },
  { key: 'Игры', label: 'Игры' },
  { key: 'Облако', label: 'Облако / IT' },
  { key: 'Бизнес', label: 'Бизнес' },
  { key: 'Обучение', label: 'Обучение' },
  { key: 'Путешествия', label: 'Путешествия' },
  { key: 'Маркет', label: 'Маркетплейсы' },
];

export const SERVICES: Service[] = [
  { name: 'ChatGPT', desc: 'Официальная подписка', logo: 'GPT.PNG', cat: 'AI', bg: true },
  { name: 'Claude', desc: 'Оплата тарифа Pro', logo: 'Claude.PNG', cat: 'AI' },
  { name: 'Gemini', desc: 'Google AI подписка', logo: 'Gemini%20%28Google%20AI%29.PNG', cat: 'AI' },
  { name: 'Grok', desc: 'Премиум доступ', logo: 'Grok.PNG', cat: 'AI', bg: true },
  { name: 'Perplexity', desc: 'Pro подписка', logo: 'Perplexity.PNG', cat: 'AI' },
  { name: 'Qwen', desc: 'Доступ к моделям', logo: 'Qwen.PNG', cat: 'AI' },
  { name: 'Kimi', desc: 'Подписка', logo: 'Kimi.PNG', cat: 'AI' },
  { name: 'DeepL', desc: 'Pro перевод', logo: 'DeepL.PNG', cat: 'AI' },
  { name: 'Codex', desc: 'ИИ для кода', logo: 'Codex.PNG', cat: 'AI', bg: true },
  { name: 'Cursor', desc: 'ИИ-редактор кода', logo: 'Cursor.PNG', cat: 'AI', bg: true },
  { name: 'GitHub Copilot', desc: 'ИИ для кода', logo: 'GitHub%20Copilot.PNG', cat: 'AI', bg: true },
  { name: 'OpenRouter', desc: 'Доступ к API', logo: 'OpenRouter.PNG', cat: 'AI', bg: true },
  { name: 'MiniMax', desc: 'ИИ-модели', logo: 'MiniMax.PNG', cat: 'AI' },
  { name: 'Manus', desc: 'ИИ-агент', logo: 'Manus%20A.PNG', cat: 'AI', bg: true },
  { name: 'Writesonic', desc: 'Тексты ИИ', logo: 'Writesonic.PNG', cat: 'AI' },
  { name: 'Candy AI', desc: 'ИИ-компаньон', logo: 'Candy%20AI.PNG', cat: 'AI' },
  { name: 'Higgsfield AI', desc: 'ИИ-видео', logo: 'Higgsfield%20AI.PNG', cat: 'AI', bg: true },
  { name: 'Kits.ai', desc: 'ИИ-аудио', logo: 'Kits.ai.PNG', cat: 'AI', bg: true },
  { name: 'n8n', desc: 'Автоматизация', logo: 'n8n.PNG', cat: 'AI', bg: true },
  { name: 'ManyChat', desc: 'Чат-боты', logo: 'Manychat.PNG', cat: 'AI', bg: true },

  { name: 'Sora 2', desc: 'Генерация видео ИИ', logo: 'Sora%202.PNG', cat: 'Видео', bg: true },
  { name: 'Midjourney', desc: 'Генерация изображений', logo: 'Midjournei.PNG', cat: 'Видео', bg: true },
  { name: 'Kling AI', desc: 'ИИ-видео', logo: 'Kling%20Ai.PNG', cat: 'Видео', bg: true },
  { name: 'Ideogram', desc: 'Генерация изображений', logo: 'Ideogram.PNG', cat: 'Видео', bg: true },
  { name: 'Krea', desc: 'ИИ-визуал', logo: 'Krea.ai.PNG', cat: 'Видео', bg: true },
  { name: 'Lensa AI', desc: 'ИИ-фото', logo: 'Lensa%20AI.PNG', cat: 'Видео', bg: true },
  { name: 'HeyGen', desc: 'ИИ-аватары', logo: 'HeyGen.PNG', cat: 'Видео' },
  { name: 'Pika', desc: 'ИИ-видео', logo: 'Pika.PNG', cat: 'Видео', bg: true },
  { name: 'Gling', desc: 'Монтаж ИИ', logo: 'Gling.PNG', cat: 'Видео', bg: true },
  { name: 'Gamma', desc: 'Презентации ИИ', logo: 'Gamma%20App.PNG', cat: 'Видео' },
  { name: 'Nano Banana', desc: 'ИИ-генерация', logo: 'nano%20banana.PNG', cat: 'Видео', bg: true },
  { name: 'Adobe', desc: 'Creative Cloud', logo: 'Adobe.PNG', cat: 'Видео', bg: true },
  { name: 'Adobe Creative Cloud', desc: 'Все приложения', logo: 'Adobe%20Creative%20Cloud.PNG', cat: 'Видео' },
  { name: 'Adobe Photoshop', desc: 'Фоторедактор', logo: 'Adobe%20Photoshop.PNG', cat: 'Видео' },
  { name: 'Adobe Premiere Pro', desc: 'Видеомонтаж', logo: 'Adobe%20Premiere%20Pro.PNG', cat: 'Видео' },
  { name: 'Adobe After Effects', desc: 'Моушн-дизайн', logo: 'Adobe%20After%20Effects.PNG', cat: 'Видео' },
  { name: 'Adobe Firefly', desc: 'ИИ-генерация', logo: 'Adobe%20Firefly.PNG', cat: 'Видео' },
  { name: 'Photoshop', desc: 'Фоторедактор', logo: 'PS.PNG', cat: 'Видео' },
  { name: 'Canva', desc: 'Pro подписка', logo: 'Canva.PNG', cat: 'Видео' },
  { name: 'CapCut', desc: 'Pro функции', logo: 'CapCut.PNG', cat: 'Видео' },
  { name: 'Figma', desc: 'Professional', logo: 'Figma.PNG', cat: 'Видео' },
  { name: 'Freepik', desc: 'Premium', logo: 'Freepik.PNG', cat: 'Видео' },
  { name: 'Shutterstock', desc: 'Сток-контент', logo: 'Shutterstock.PNG', cat: 'Видео', bg: true },
  { name: 'Artlist', desc: 'Музыка и видео', logo: 'Artlist.PNG', cat: 'Видео', bg: true },
  { name: 'Maxon Cinema 4D', desc: '3D-графика', logo: 'Maxon%20Cinema.PNG', cat: 'Видео', bg: true },
  { name: 'Cults 3D', desc: '3D-модели', logo: 'Cults%203D.PNG', cat: 'Видео', bg: true },
  { name: 'Loom', desc: 'Запись экрана', logo: 'Loom.PNG', cat: 'Видео', bg: true },

  { name: 'Ableton', desc: 'Live подписка', logo: 'Ableton.PNG', cat: 'Музыка', bg: true },
  { name: 'Splice', desc: 'Сэмплы', logo: 'Splice.PNG', cat: 'Музыка', bg: true },
  { name: 'Epidemic Sound', desc: 'Музыка для видео', logo: 'Epidemic%20Sound.PNG', cat: 'Музыка', bg: true },
  { name: 'Bandcamp', desc: 'Музыка', logo: 'Bandcamp.PNG', cat: 'Музыка' },
  { name: 'Suno', desc: 'ИИ-музыка', logo: 'Suno%20AI.PNG', cat: 'Музыка', bg: true },
  { name: 'Spotify', desc: 'Premium аккаунт', logo: 'Spotify.PNG', cat: 'Музыка' },
  { name: 'YouTube Premium', desc: 'Без рекламы', logo: 'YouTube%20.PNG', cat: 'Музыка' },
  { name: 'Twitch', desc: 'Подписки / Turbo', logo: 'Twitch.PNG', cat: 'Музыка' },
  { name: 'TikTok', desc: 'Монеты / подписка', logo: 'Tiktoc.WEBP', cat: 'Музыка', bg: true },

  { name: 'Nintendo', desc: 'eShop / Online', logo: 'Nintendo.PNG', cat: 'Игры' },
  { name: 'FACEIT', desc: 'Premium', logo: 'Faceit.PNG', cat: 'Игры', bg: true },
  { name: 'PS Plus (Турция)', desc: 'Подписка PlayStation', logo: 'Подписка%20PS%20Plus%20%28Турция%29.PNG', cat: 'Игры' },
  { name: 'Discord', desc: 'Nitro подписка', logo: 'Discord.PNG', cat: 'Игры' },

  { name: 'Microsoft 365', desc: 'Office подписка', logo: 'Microsoft.PNG', cat: 'Облако' },
  { name: 'Google', desc: 'Аккаунт / сервисы', logo: 'Google.PNG', cat: 'Облако' },
  { name: 'Google Drive', desc: 'Хранилище', logo: 'Google%20Drive.PNG', cat: 'Облако' },
  { name: 'Google Cloud', desc: 'Облачная платформа', logo: 'Google%20Cloud.PNG', cat: 'Облако' },
  { name: 'Google BigQuery', desc: 'Аналитика данных', logo: 'Google%20BigQuery.PNG', cat: 'Облако' },
  { name: 'Dropbox', desc: 'Plus / Pro', logo: 'Dropbox.PNG', cat: 'Облако' },
  { name: 'Cloudflare', desc: 'Pro план', logo: 'Cloudflare.PNG', cat: 'Облако' },
  { name: 'Supabase', desc: 'Backend / БД', logo: 'Supabase.PNG', cat: 'Облако' },
  { name: 'Proton Mail', desc: 'Почта / VPN', logo: 'ProtonMail.PNG', cat: 'Облако' },
  { name: 'Swift', desc: 'Разработка', logo: 'Swift.PNG', cat: 'Облако', bg: true },
  { name: 'FlutterFlow', desc: 'No-code приложения', logo: 'FlutterFlow.PNG', cat: 'Облако' },
  { name: 'Weavy', desc: 'Встраиваемый UI', logo: 'Weavy.PNG', cat: 'Облако', bg: true },
  { name: 'Wix', desc: 'Premium сайт', logo: 'Wix.PNG', cat: 'Облако', bg: true },

  { name: 'Notion', desc: 'Plus / Business', logo: 'Notion.PNG', cat: 'Бизнес', bg: true },
  { name: 'Miro', desc: 'Подписка', logo: 'Miro.PNG', cat: 'Бизнес' },
  { name: 'Airtable', desc: 'Pro', logo: 'Airtable.PNG', cat: 'Бизнес' },
  { name: 'Jira', desc: 'Подписка', logo: 'Jira.PNG', cat: 'Бизнес' },
  { name: 'Zoom', desc: 'Pro подписка', logo: 'Zoom.PNG', cat: 'Бизнес' },
  { name: 'TradingView', desc: 'Подписка', logo: 'TradingView.PNG', cat: 'Бизнес' },
  { name: 'Patreon', desc: 'Подписки авторам', logo: 'Patreon.PNG', cat: 'Бизнес' },
  { name: 'Boosty', desc: 'Подписки авторам', logo: 'Boosty.PNG', cat: 'Бизнес' },
  { name: 'Ko-fi', desc: 'Донаты', logo: 'Ko-fi.PNG', cat: 'Бизнес' },
  { name: 'OnlyFans', desc: 'Подписки', logo: 'OnlyFans.PNG', cat: 'Бизнес' },
  { name: 'Fansly', desc: 'Подписки', logo: 'Fansly.PNG', cat: 'Бизнес' },
  { name: 'X Premium', desc: 'Twitter Premium', logo: 'X%20%28twitter%29%20Premium.PNG', cat: 'Бизнес' },

  { name: 'PayPal', desc: 'Платежи', logo: 'PayPal.PNG', cat: 'Маркет' },
  { name: 'Stripe', desc: 'Платежи', logo: 'Stripe.PNG', cat: 'Маркет' },
  { name: 'Alipay', desc: 'Платежи', logo: 'Alipay.PNG', cat: 'Маркет' },
  { name: 'App Store', desc: 'Пополнение', logo: 'App%20Store.PNG', cat: 'Маркет' },

  { name: 'Coursera', desc: 'Plus подписка', logo: 'Coursera.PNG', cat: 'Обучение' },
  { name: 'Udemy', desc: 'Курсы', logo: 'Udemy.PNG', cat: 'Обучение' },
  { name: 'Duolingo', desc: 'Super', logo: 'Duolingo.PNG', cat: 'Обучение' },
  { name: 'italki', desc: 'Уроки языка', logo: 'italki.PNG', cat: 'Обучение' },
  { name: 'MyHeritage', desc: 'Генеалогия', logo: 'MyHeritage.PNG', cat: 'Обучение' },

  { name: 'Airbnb', desc: 'Оплата брони', logo: 'Airbnb.PNG', cat: 'Путешествия' },
  { name: 'Booking', desc: 'Бронирование', logo: 'Booking.PNG', cat: 'Путешествия' },
  { name: 'Agoda', desc: 'Отели', logo: 'Agoda.PNG', cat: 'Путешествия' },
  { name: 'Airalo', desc: 'eSIM связь', logo: 'airalo.PNG', cat: 'Путешествия' },
];

export type HomeCard = {
  name: string;
  desc: string;
  logo: string;
  price: string;
  bg?: boolean;
};

export const HOME_CARDS: HomeCard[] = [
  { name: 'ChatGPT', desc: 'Официальная подписка', logo: 'GPT.PNG', price: 'от 650 ₽', bg: true },
  { name: 'Claude', desc: 'Оплата тарифа Pro', logo: 'Claude.PNG', price: 'от 750 ₽' },
  { name: 'Spotify', desc: 'Premium аккаунт', logo: 'Spotify.PNG', price: 'от 550 ₽' },
  { name: 'YouTube Premium', desc: 'Без рекламы', logo: 'YouTube%20.PNG', price: 'от 650 ₽' },
  { name: 'Adobe CC', desc: 'Creative Cloud', logo: 'Adobe.PNG', price: 'от 1 200 ₽' },
  { name: 'Canva', desc: 'Pro подписка', logo: 'Canva.PNG', price: 'от 400 ₽' },
  { name: 'Discord', desc: 'Nitro подписка', logo: 'Discord.PNG', price: 'от 550 ₽' },
  { name: 'Booking', desc: 'Бронирование', logo: 'Booking.PNG', price: 'от 650 ₽' },
  { name: 'Figma', desc: 'Professional', logo: 'Figma.PNG', price: 'от 900 ₽' },
  { name: 'Zoom', desc: 'Pro подписка', logo: 'Zoom.PNG', price: 'от 550 ₽' },
  { name: 'Notion', desc: 'Plus / Business', logo: 'Notion.PNG', price: 'от 500 ₽' },
  { name: 'Stripe', desc: 'Платежи', logo: 'Stripe.PNG', price: 'от 650 ₽' },
];

export const HERO_QUICK_LINKS = [
  { name: 'ChatGPT', q: 'ChatGPT', logo: 'GPT.PNG' },
  { name: 'Claude', q: 'Claude', logo: 'Claude.PNG' },
  { name: 'Spotify', q: 'Spotify', logo: 'Spotify.PNG' },
  { name: 'YouTube', q: 'YouTube', logo: 'YouTube%20.PNG' },
  { name: 'Adobe', q: 'Adobe', logo: 'Adobe.PNG' },
];
