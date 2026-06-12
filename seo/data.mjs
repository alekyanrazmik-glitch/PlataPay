// Catalog of services + per-service SEO data for the landing page
// generator. Keep this hand-curated so each page has real substance
// instead of template substitution alone.

export const CATEGORIES = {
  AI: {
    title: 'AI и нейросети',
    pain: 'Большинство AI-сервисов принимают только западные карты и блокируют российские IP при оплате. Привязка карты Мир или UnionPay не проходит ни в OpenAI, ни в Anthropic, ни в большинстве AI-стартапов.',
    workaround: 'Мы оплачиваем подписку с зарубежной карты на ваш аккаунт — данные карты вам не нужны, доступ остаётся ваш.',
    examples: ['ChatGPT', 'Claude', 'Gemini', 'Perplexity'],
    avg_rub: 1500,
  },
  Видео: {
    title: 'Видео и дизайн',
    pain: 'Adobe, Canva Pro, Figma и стоковые сервисы перестали принимать оплату с российских реквизитов. У многих ещё и привязана подписка к Apple/Google аккаунту, что добавляет сложности.',
    workaround: 'Оплачиваем как через сайт сервиса, так и через сторы — выбираем способ, который подходит именно под вашу подписку.',
    examples: ['Adobe Creative Cloud', 'Canva', 'Figma', 'Midjourney'],
    avg_rub: 1200,
  },
  Музыка: {
    title: 'Музыка и кино',
    pain: 'Spotify, YouTube Premium, Netflix и большинство стриминговых платформ не принимают платежи из РФ. Часть сервисов даже блокирует аккаунты при попытке оплатить с российского IP.',
    workaround: 'Используем способы оплаты, которые не вызывают подозрений у сервиса: подарочные карты регионов, где сервис работает, или прямую оплату с зарубежной карты.',
    examples: ['Spotify', 'YouTube Premium', 'Netflix', 'Apple Music'],
    avg_rub: 700,
  },
  Игры: {
    title: 'Игры и игровые подписки',
    pain: 'Steam, PSN, Xbox и Nintendo переключили региональные цены и не принимают карты РФ. У PlayStation Plus в российском регионе и вовсе нет — нужно пополнять через турецкий или украинский аккаунт.',
    workaround: 'Пополняем кошельки нужного региона (Турция, Аргентина и др.) или активируем подписки через подарочные коды.',
    examples: ['Steam', 'PS Plus', 'Nintendo eShop', 'Discord Nitro'],
    avg_rub: 900,
  },
  Облако: {
    title: 'Облако и IT-сервисы',
    pain: 'Google Cloud, Cloudflare, Microsoft 365 и хостинги требуют валидную западную карту с подтверждённым адресом. Биллинг часто настроен на ежемесячное списание — без рабочей карты сервис отключается.',
    workaround: 'Закрываем как разовые счета, так и регулярные продления. Если нужно — оплатим инвойс напрямую получателю по SWIFT.',
    examples: ['Microsoft 365', 'Google Cloud', 'Dropbox', 'Cloudflare'],
    avg_rub: 1800,
  },
  Бизнес: {
    title: 'Бизнес-инструменты',
    pain: 'Notion, Miro, Airtable, Zoom и большинство SaaS-инструментов оплачиваются с корпоративной карты, которой у российских юрлиц больше нет. Часть сервисов блокирует доступ при просрочке.',
    workaround: 'Оплачиваем подписки на любую почту — корпоративную или личную — и присылаем подтверждение для бухгалтерии.',
    examples: ['Notion', 'Miro', 'Zoom', 'Airtable'],
    avg_rub: 1200,
  },
  Обучение: {
    title: 'Обучение и образование',
    pain: 'Coursera, Udemy, italki и онлайн-школы принимают платежи в долларах и евро, что недоступно с карты РФ. Часть сертификатов выдают только при оплаченной подписке.',
    workaround: 'Оплачиваем как разовые курсы, так и подписки. Чек присылаем — пригодится для налогового вычета.',
    examples: ['Coursera', 'Udemy', 'Duolingo'],
    avg_rub: 1000,
  },
  Путешествия: {
    title: 'Путешествия и бронирования',
    pain: 'Booking, Airbnb, Agoda и другие тревел-сервисы переключились на оплату в локальных валютах принимающей страны. Без рабочей карты броню не подтвердить.',
    workaround: 'Оплачиваем бронь с зарубежной карты или напрямую отелю, если требуется. Часто это даже выгоднее по курсу.',
    examples: ['Booking', 'Airbnb', 'Agoda', 'Airalo'],
    avg_rub: 0,
  },
  Маркет: {
    title: 'Маркетплейсы и платёжные сервисы',
    pain: 'PayPal, Stripe, App Store и Alipay используются для покупок в зарубежных магазинах. Российские карты в этих системах не работают — пополнить или оплатить с них нельзя.',
    workaround: 'Пополняем баланс на ваш аккаунт или оплачиваем нужную покупку с зарубежной карты.',
    examples: ['PayPal', 'Stripe', 'App Store'],
    avg_rub: 1000,
  },
};

// Each service has its own slug (latin, kebab-case), category, brief,
// rough RUB price for the cheapest tier, and a short pain/tier hint
// that the templates weave into the prose.
export const SERVICES = [
  // AI
  { slug: 'chatgpt', name: 'ChatGPT', cat: 'AI', logo: 'GPT.PNG', price: 1900, tiers: ['Plus ($20)', 'Team ($25)', 'Pro ($200)'], hint: 'самый популярный AI-чат от OpenAI с моделями GPT-4o и o3, генерацией изображений и голосовым режимом' },
  { slug: 'claude', name: 'Claude', cat: 'AI', logo: 'Claude.PNG', price: 1900, tiers: ['Pro ($20)', 'Max ($100)'], hint: 'AI-ассистент Anthropic с моделями Sonnet и Opus, удобный для работы с длинными документами и кодом' },
  { slug: 'gemini', name: 'Gemini', cat: 'AI', logo: 'Gemini%20%28Google%20AI%29.PNG', price: 1900, tiers: ['Advanced ($20)'], hint: 'Google Gemini Advanced с моделями 2.0 Pro и доступом к 2 ТБ Google One' },
  { slug: 'grok', name: 'Grok', cat: 'AI', logo: 'Grok.PNG', price: 750, tiers: ['Premium', 'Premium+'], hint: 'AI от xAI Илона Маска, встроен в X (Twitter) и работает с актуальной лентой' },
  { slug: 'perplexity', name: 'Perplexity', cat: 'AI', logo: 'Perplexity.PNG', price: 1900, tiers: ['Pro ($20)'], hint: 'AI-поисковик с источниками, удобен для исследований и аналитики' },
  { slug: 'qwen', name: 'Qwen', cat: 'AI', logo: 'Qwen.PNG', price: 900, tiers: ['Plus'], hint: 'AI от Alibaba с моделями Qwen3, в том числе с длинным контекстом' },
  { slug: 'kimi', name: 'Kimi', cat: 'AI', logo: 'Kimi.PNG', price: 900, tiers: ['Pro'], hint: 'китайский AI-ассистент Moonshot с одним из самых длинных контекстов на рынке' },
  { slug: 'deepl', name: 'DeepL', cat: 'AI', logo: 'DeepL.PNG', price: 800, tiers: ['Starter', 'Advanced'], hint: 'переводчик, который многие считают точнее Google Translate, особенно для европейских языков' },
  { slug: 'codex', name: 'Codex', cat: 'AI', logo: 'Codex.PNG', price: 1900, tiers: ['включён в ChatGPT Plus'], hint: 'AI-агент OpenAI для написания кода, разворачивается в облаке и работает с репозиторием' },
  { slug: 'cursor', name: 'Cursor', cat: 'AI', logo: 'Cursor.PNG', price: 1900, tiers: ['Pro ($20)', 'Ultra ($200)'], hint: 'AI-редактор кода на базе VS Code с интеграцией Claude и GPT' },
  { slug: 'github-copilot', name: 'GitHub Copilot', cat: 'AI', logo: 'GitHub%20Copilot.PNG', price: 1000, tiers: ['Pro ($10)', 'Pro+ ($39)'], hint: 'AI-автодополнение для кода прямо в IDE, поддерживает все популярные языки' },
  { slug: 'openrouter', name: 'OpenRouter', cat: 'AI', logo: 'OpenRouter.PNG', price: 1000, tiers: ['оплата по балансу'], hint: 'единый API для десятков моделей — от Claude до Llama, оплачивается пополнением баланса' },
  { slug: 'minimax', name: 'MiniMax', cat: 'AI', logo: 'MiniMax.PNG', price: 900, tiers: ['Standard', 'Plus'], hint: 'китайский AI с моделями для текста и видео, популярен у видеомейкеров' },
  { slug: 'manus', name: 'Manus', cat: 'AI', logo: 'Manus%20A.PNG', price: 1900, tiers: ['Starter', 'Pro'], hint: 'AI-агент, который сам выполняет задачи в браузере и системах' },
  { slug: 'writesonic', name: 'Writesonic', cat: 'AI', logo: 'Writesonic.PNG', price: 1500, tiers: ['Pro'], hint: 'AI для маркетинговых текстов и контента, с фокусом на SEO' },
  { slug: 'candy-ai', name: 'Candy AI', cat: 'AI', logo: 'Candy%20AI.PNG', price: 1900, tiers: ['Premium'], hint: 'AI-компаньон с генерацией изображений и голоса' },
  { slug: 'higgsfield-ai', name: 'Higgsfield AI', cat: 'AI', logo: 'Higgsfield%20AI.PNG', price: 1900, tiers: ['Basic', 'Pro'], hint: 'генерация видео с движениями камеры по референсу' },
  { slug: 'kits-ai', name: 'Kits.ai', cat: 'AI', logo: 'Kits.ai.PNG', price: 900, tiers: ['Standard', 'Pro'], hint: 'AI для работы с голосом — клонирование, синтез, мастеринг' },
  { slug: 'n8n', name: 'n8n', cat: 'AI', logo: 'n8n.PNG', price: 2000, tiers: ['Starter ($20)', 'Pro ($50)'], hint: 'автоматизация процессов с no-code конструктором и AI-нодами' },
  { slug: 'manychat', name: 'ManyChat', cat: 'AI', logo: 'Manychat.PNG', price: 1500, tiers: ['Pro'], hint: 'конструктор чат-ботов для Telegram, Instagram и WhatsApp' },

  // Видео / Дизайн
  { slug: 'sora-2', name: 'Sora 2', cat: 'Видео', logo: 'Sora%202.PNG', price: 1900, tiers: ['включена в ChatGPT Plus/Pro'], hint: 'генерация видео от OpenAI, доступна подписчикам ChatGPT Pro и через лимиты в Plus' },
  { slug: 'midjourney', name: 'Midjourney', cat: 'Видео', logo: 'Midjournei.PNG', price: 900, tiers: ['Basic ($10)', 'Standard ($30)', 'Pro ($60)'], hint: 'генератор изображений с самым проработанным художественным стилем на рынке' },
  { slug: 'kling-ai', name: 'Kling AI', cat: 'Видео', logo: 'Kling%20Ai.PNG', price: 900, tiers: ['Standard', 'Pro'], hint: 'AI-видео от китайской Kuaishou, конкурент Sora с упором на реализм' },
  { slug: 'ideogram', name: 'Ideogram', cat: 'Видео', logo: 'Ideogram.PNG', price: 800, tiers: ['Basic ($8)', 'Plus ($20)'], hint: 'генератор изображений, особенно сильный в работе с текстом внутри картинки' },
  { slug: 'krea', name: 'Krea', cat: 'Видео', logo: 'Krea.ai.PNG', price: 1100, tiers: ['Basic', 'Pro'], hint: 'AI-инструмент для real-time генерации и апскейла изображений' },
  { slug: 'lensa-ai', name: 'Lensa AI', cat: 'Видео', logo: 'Lensa%20AI.PNG', price: 350, tiers: ['Premium'], hint: 'мобильное AI-приложение для аватаров и ретуши' },
  { slug: 'heygen', name: 'HeyGen', cat: 'Видео', logo: 'HeyGen.PNG', price: 2400, tiers: ['Creator ($24)', 'Team ($69)'], hint: 'создание видео с AI-аватарами и дубляж на 40+ языков' },
  { slug: 'pika', name: 'Pika', cat: 'Видео', logo: 'Pika.PNG', price: 900, tiers: ['Standard', 'Pro'], hint: 'AI-видео с акцентом на эффекты и стилизацию' },
  { slug: 'gling', name: 'Gling', cat: 'Видео', logo: 'Gling.PNG', price: 1500, tiers: ['Pro'], hint: 'AI-монтаж для YouTube-блогеров: убирает паузы и склейки' },
  { slug: 'gamma', name: 'Gamma', cat: 'Видео', logo: 'Gamma%20App.PNG', price: 800, tiers: ['Plus', 'Pro'], hint: 'генерация презентаций по тексту, удобная альтернатива PowerPoint' },
  { slug: 'nano-banana', name: 'Nano Banana', cat: 'Видео', logo: 'nano%20banana.PNG', price: 1500, tiers: ['Pro'], hint: 'модель редактирования изображений от Google, точно сохраняет лица и сцены' },
  { slug: 'adobe-cc', name: 'Adobe Creative Cloud', cat: 'Видео', logo: 'Adobe.PNG', price: 5500, tiers: ['Single App', 'All Apps'], hint: 'полный комплект Adobe: Photoshop, Premiere Pro, After Effects, Illustrator и облако' },
  { slug: 'adobe-photoshop', name: 'Adobe Photoshop', cat: 'Видео', logo: 'Adobe%20Photoshop.PNG', price: 2200, tiers: ['Photography ($10)', 'Single App ($23)'], hint: 'стандарт индустрии для растровой графики и фоторетуши' },
  { slug: 'adobe-premiere', name: 'Adobe Premiere Pro', cat: 'Видео', logo: 'Adobe%20Premiere%20Pro.PNG', price: 2200, tiers: ['Single App ($23)'], hint: 'профессиональный видеоредактор Adobe, поддерживает 4K/8K и AI-инструменты' },
  { slug: 'adobe-after-effects', name: 'Adobe After Effects', cat: 'Видео', logo: 'Adobe%20After%20Effects.PNG', price: 2200, tiers: ['Single App ($23)'], hint: 'моушн-дизайн и композитинг: анимация, трекинг, эффекты' },
  { slug: 'adobe-firefly', name: 'Adobe Firefly', cat: 'Видео', logo: 'Adobe%20Firefly.PNG', price: 1000, tiers: ['Standard ($10)', 'Pro ($30)'], hint: 'генеративный AI Adobe для изображений и видео, обученный на лицензионных данных' },
  { slug: 'canva', name: 'Canva Pro', cat: 'Видео', logo: 'Canva.PNG', price: 1200, tiers: ['Pro', 'Teams'], hint: 'онлайн-редактор графики с шаблонами для соцсетей и презентаций' },
  { slug: 'capcut', name: 'CapCut Pro', cat: 'Видео', logo: 'CapCut.PNG', price: 800, tiers: ['Pro'], hint: 'мобильный видеоредактор от создателей TikTok с AI-эффектами' },
  { slug: 'figma', name: 'Figma', cat: 'Видео', logo: 'Figma.PNG', price: 1500, tiers: ['Professional ($15)', 'Organization ($45)'], hint: 'веб-инструмент для UI/UX дизайна с командной работой' },
  { slug: 'freepik', name: 'Freepik', cat: 'Видео', logo: 'Freepik.PNG', price: 1200, tiers: ['Essential', 'Premium', 'Premium+'], hint: 'сток с векторами, фото и AI-генерацией' },
  { slug: 'shutterstock', name: 'Shutterstock', cat: 'Видео', logo: 'Shutterstock.PNG', price: 3000, tiers: ['10 изображений', 'Подписка'], hint: 'крупный сток для коммерческих проектов' },
  { slug: 'artlist', name: 'Artlist', cat: 'Видео', logo: 'Artlist.PNG', price: 2000, tiers: ['Pro'], hint: 'музыка, футажи и SFX без роялти для YouTube и рекламы' },
  { slug: 'maxon-cinema-4d', name: 'Maxon Cinema 4D', cat: 'Видео', logo: 'Maxon%20Cinema.PNG', price: 6000, tiers: ['Subscription'], hint: 'профессиональный 3D-пакет для моушна и продуктовой визуализации' },
  { slug: 'cults-3d', name: 'Cults 3D', cat: 'Видео', logo: 'Cults%203D.PNG', price: 500, tiers: ['разовая покупка'], hint: 'маркетплейс STL-моделей для 3D-печати' },
  { slug: 'loom', name: 'Loom', cat: 'Видео', logo: 'Loom.PNG', price: 1500, tiers: ['Business ($15)'], hint: 'запись экрана с видео-комментарием для асинхронной работы' },

  // Музыка / Кино
  { slug: 'ableton', name: 'Ableton Live', cat: 'Музыка', logo: 'Ableton.PNG', price: 8000, tiers: ['Intro', 'Standard', 'Suite'], hint: 'DAW, который используют большинство электронных продюсеров' },
  { slug: 'splice', name: 'Splice', cat: 'Музыка', logo: 'Splice.PNG', price: 1300, tiers: ['Creator ($13)', 'Creator+ ($30)'], hint: 'крупнейший сток сэмплов с подпиской и кредитами' },
  { slug: 'epidemic-sound', name: 'Epidemic Sound', cat: 'Музыка', logo: 'Epidemic%20Sound.PNG', price: 1700, tiers: ['Personal ($16)', 'Commercial ($59)'], hint: 'роялти-фри музыка и звуки для YouTube и подкастов' },
  { slug: 'bandcamp', name: 'Bandcamp', cat: 'Музыка', logo: 'Bandcamp.PNG', price: 600, tiers: ['разовая покупка'], hint: 'площадка прямых покупок музыки у исполнителей' },
  { slug: 'suno', name: 'Suno', cat: 'Музыка', logo: 'Suno%20AI.PNG', price: 1000, tiers: ['Pro ($10)', 'Premier ($30)'], hint: 'AI-генератор музыки с вокалом по текстовому запросу' },
  { slug: 'spotify', name: 'Spotify Premium', cat: 'Музыка', logo: 'Spotify.PNG', price: 600, tiers: ['Individual', 'Duo', 'Family'], hint: 'крупнейший музыкальный стриминг с офлайн-режимом и подкастами' },
  { slug: 'youtube-premium', name: 'YouTube Premium', cat: 'Музыка', logo: 'YouTube%20.PNG', price: 800, tiers: ['Individual', 'Family'], hint: 'YouTube без рекламы, в фоне и со скачиванием, плюс YouTube Music' },
  { slug: 'twitch', name: 'Twitch', cat: 'Музыка', logo: 'Twitch.PNG', price: 600, tiers: ['Tier 1', 'Tier 2', 'Tier 3', 'Turbo'], hint: 'подписки на стримеров и Turbo для отключения рекламы' },
  { slug: 'tiktok', name: 'TikTok', cat: 'Музыка', logo: 'Tiktoc.WEBP', price: 600, tiers: ['монеты', 'подписка'], hint: 'пополнение монет для подарков стримерам и подписка на платный контент' },

  // Игры
  { slug: 'nintendo', name: 'Nintendo eShop', cat: 'Игры', logo: 'Nintendo.PNG', price: 1000, tiers: ['eShop', 'Online'], hint: 'пополнение eShop и подписка Nintendo Switch Online для онлайн-игры и ретро-каталога' },
  { slug: 'faceit', name: 'FACEIT', cat: 'Игры', logo: 'Faceit.PNG', price: 900, tiers: ['Premium'], hint: 'киберспортивная площадка для CS2 и других игр с более чистыми лобби, чем матчмейкинг Valve' },
  { slug: 'ps-plus-turkey', name: 'PS Plus (Турция)', cat: 'Игры', logo: 'Подписка%20PS%20Plus%20%28Турция%29.PNG', price: 1500, tiers: ['Essential', 'Extra', 'Deluxe'], hint: 'подписка PlayStation Plus через турецкий аккаунт, потому что в РФ-регионе её больше нет' },
  { slug: 'discord', name: 'Discord Nitro', cat: 'Игры', logo: 'Discord.PNG', price: 900, tiers: ['Basic ($3)', 'Full ($10)'], hint: 'подписка Discord с расширенными эмодзи, серверными бустами и качеством стрима' },

  // Облако
  { slug: 'microsoft-365', name: 'Microsoft 365', cat: 'Облако', logo: 'Microsoft.PNG', price: 700, tiers: ['Personal', 'Family'], hint: 'Office онлайн и десктоп: Word, Excel, PowerPoint, Outlook и 1 ТБ OneDrive' },
  { slug: 'google', name: 'Google', cat: 'Облако', logo: 'Google.PNG', price: 700, tiers: ['Google One', 'Workspace'], hint: 'оплата Google One для дополнительного места и Workspace для своего домена' },
  { slug: 'google-drive', name: 'Google Drive', cat: 'Облако', logo: 'Google%20Drive.PNG', price: 200, tiers: ['100 ГБ', '200 ГБ', '2 ТБ'], hint: 'место в Google One для Drive, Gmail и Photos' },
  { slug: 'google-cloud', name: 'Google Cloud', cat: 'Облако', logo: 'Google%20Cloud.PNG', price: 0, tiers: ['Pay-as-you-go'], hint: 'инфраструктура GCP — Compute Engine, Cloud Storage, BigQuery и др.' },
  { slug: 'google-bigquery', name: 'Google BigQuery', cat: 'Облако', logo: 'Google%20BigQuery.PNG', price: 0, tiers: ['Pay-as-you-go'], hint: 'аналитическая БД Google с оплатой по объёму запросов' },
  { slug: 'dropbox', name: 'Dropbox', cat: 'Облако', logo: 'Dropbox.PNG', price: 1000, tiers: ['Plus', 'Family', 'Professional'], hint: 'облачное хранилище с десктоп-клиентом и шерингом' },
  { slug: 'cloudflare', name: 'Cloudflare', cat: 'Облако', logo: 'Cloudflare.PNG', price: 2000, tiers: ['Pro ($25)', 'Business ($250)'], hint: 'CDN и защита сайтов: Pages, Workers, DNS и Pro-тариф' },
  { slug: 'supabase', name: 'Supabase', cat: 'Облако', logo: 'Supabase.PNG', price: 2500, tiers: ['Pro ($25)', 'Team ($599)'], hint: 'Postgres + auth + storage + edge functions как сервис' },
  { slug: 'proton-mail', name: 'Proton', cat: 'Облако', logo: 'ProtonMail.PNG', price: 500, tiers: ['Mail Plus', 'Unlimited'], hint: 'почта, VPN и облако от швейцарского Proton с упором на приватность' },
  { slug: 'swift', name: 'Swift', cat: 'Облако', logo: 'Swift.PNG', price: 1000, tiers: ['Developer Program'], hint: 'Apple Developer Program для публикации приложений на iOS' },
  { slug: 'flutterflow', name: 'FlutterFlow', cat: 'Облако', logo: 'FlutterFlow.PNG', price: 3000, tiers: ['Standard ($30)', 'Pro ($70)'], hint: 'no-code конструктор приложений на Flutter' },
  { slug: 'weavy', name: 'Weavy', cat: 'Облако', logo: 'Weavy.PNG', price: 2500, tiers: ['Starter', 'Pro'], hint: 'встраиваемые компоненты чата, фидов и звонков для SaaS' },
  { slug: 'wix', name: 'Wix Premium', cat: 'Облако', logo: 'Wix.PNG', price: 1500, tiers: ['Light', 'Core', 'Business'], hint: 'конструктор сайтов с премиум-тарифами и доменом' },

  // Бизнес
  { slug: 'notion', name: 'Notion', cat: 'Бизнес', logo: 'Notion.PNG', price: 1000, tiers: ['Plus ($10)', 'Business ($20)'], hint: 'универсальный воркспейс для заметок, баз и документации' },
  { slug: 'miro', name: 'Miro', cat: 'Бизнес', logo: 'Miro.PNG', price: 800, tiers: ['Starter ($8)', 'Business ($16)'], hint: 'онлайн-доска для воркшопов, проектирования и брейнстормов' },
  { slug: 'airtable', name: 'Airtable', cat: 'Бизнес', logo: 'Airtable.PNG', price: 2000, tiers: ['Team ($20)', 'Business ($45)'], hint: 'гибрид таблицы и базы данных с автоматизациями и AI' },
  { slug: 'jira', name: 'Jira', cat: 'Бизнес', logo: 'Jira.PNG', price: 800, tiers: ['Standard', 'Premium'], hint: 'трекер задач Atlassian для разработки и продуктовой работы' },
  { slug: 'zoom', name: 'Zoom Pro', cat: 'Бизнес', logo: 'Zoom.PNG', price: 1500, tiers: ['Pro ($14)', 'Business ($21)'], hint: 'видеоконференции без лимита 40 минут и облачные записи' },
  { slug: 'tradingview', name: 'TradingView', cat: 'Бизнес', logo: 'TradingView.PNG', price: 1500, tiers: ['Essential', 'Plus', 'Premium'], hint: 'графики и аналитика рынков, в том числе крипты и акций' },
  { slug: 'patreon', name: 'Patreon', cat: 'Бизнес', logo: 'Patreon.PNG', price: 500, tiers: ['от $3 и выше'], hint: 'подписка на любимых авторов: ютуберов, музыкантов, иллюстраторов' },
  { slug: 'boosty', name: 'Boosty', cat: 'Бизнес', logo: 'Boosty.PNG', price: 500, tiers: ['разные тиры'], hint: 'российская альтернатива Patreon, но автор может быть в любой стране' },
  { slug: 'ko-fi', name: 'Ko-fi', cat: 'Бизнес', logo: 'Ko-fi.PNG', price: 300, tiers: ['разовая поддержка', 'Gold'], hint: 'площадка чаевых и микро-донатов авторам' },
  { slug: 'onlyfans', name: 'OnlyFans', cat: 'Бизнес', logo: 'OnlyFans.PNG', price: 1000, tiers: ['индивидуально'], hint: 'подписки на закрытый контент авторов' },
  { slug: 'fansly', name: 'Fansly', cat: 'Бизнес', logo: 'Fansly.PNG', price: 1000, tiers: ['индивидуально'], hint: 'альтернатива OnlyFans с похожей моделью подписок' },
  { slug: 'x-premium', name: 'X Premium', cat: 'Бизнес', logo: 'X%20%28twitter%29%20Premium.PNG', price: 800, tiers: ['Basic ($3)', 'Premium ($8)', 'Premium+ ($16)'], hint: 'подписка X (Twitter) с галочкой, длинными постами и Grok внутри' },

  // Маркет
  { slug: 'paypal', name: 'PayPal', cat: 'Маркет', logo: 'PayPal.PNG', price: 1000, tiers: ['пополнение баланса'], hint: 'международная платёжная система для покупок и переводов' },
  { slug: 'stripe', name: 'Stripe', cat: 'Маркет', logo: 'Stripe.PNG', price: 1000, tiers: ['комиссия за приём платежей'], hint: 'инфраструктура приёма платежей для онлайн-бизнеса' },
  { slug: 'alipay', name: 'Alipay', cat: 'Маркет', logo: 'Alipay.PNG', price: 1000, tiers: ['пополнение баланса'], hint: 'китайская платёжка для AliExpress, Taobao и других сервисов' },
  { slug: 'app-store', name: 'App Store', cat: 'Маркет', logo: 'App%20Store.PNG', price: 700, tiers: ['пополнение Apple ID'], hint: 'пополнение баланса Apple ID для покупок в App Store, iTunes и подписок' },

  // Обучение
  { slug: 'coursera', name: 'Coursera Plus', cat: 'Обучение', logo: 'Coursera.PNG', price: 5500, tiers: ['Monthly $59', 'Annual $399'], hint: 'безлимитная подписка на курсы и специализации Coursera' },
  { slug: 'udemy', name: 'Udemy', cat: 'Обучение', logo: 'Udemy.PNG', price: 1000, tiers: ['разовая покупка'], hint: 'маркетплейс курсов с доступом навсегда после оплаты' },
  { slug: 'duolingo', name: 'Duolingo Super', cat: 'Обучение', logo: 'Duolingo.PNG', price: 700, tiers: ['Super', 'Family'], hint: 'безлимит изучения языков и режим Max с AI-учителем' },
  { slug: 'italki', name: 'italki', cat: 'Обучение', logo: 'italki.PNG', price: 1500, tiers: ['пополнение баланса'], hint: 'индивидуальные уроки языков с преподавателями со всего мира' },
  { slug: 'myheritage', name: 'MyHeritage', cat: 'Обучение', logo: 'MyHeritage.PNG', price: 2000, tiers: ['Premium', 'Complete'], hint: 'сервис генеалогии и ДНК-тестов' },

  // Путешествия
  { slug: 'airbnb', name: 'Airbnb', cat: 'Путешествия', logo: 'Airbnb.PNG', price: 0, tiers: ['стоимость брони'], hint: 'оплата жилья по всему миру через крупнейший сервис аренды' },
  { slug: 'booking', name: 'Booking', cat: 'Путешествия', logo: 'Booking.PNG', price: 0, tiers: ['стоимость брони'], hint: 'оплата отелей, апартаментов и трансферов через Booking.com' },
  { slug: 'agoda', name: 'Agoda', cat: 'Путешествия', logo: 'Agoda.PNG', price: 0, tiers: ['стоимость брони'], hint: 'бронирование отелей с фокусом на Азию' },
  { slug: 'airalo', name: 'Airalo', cat: 'Путешествия', logo: 'airalo.PNG', price: 500, tiers: ['eSIM-пакеты'], hint: 'eSIM-связь в путешествиях без роуминга' },
];

// SEO intent templates — distinct URL slug patterns and content angles.
export const INTENTS = [
  { key: 'oplata', slug: (s) => `oplata-${s}`,            title: 'Оплата' },
  { key: 'kak',    slug: (s) => `kak-oplatit-${s}`,       title: 'Как оплатить' },
  { key: 'rf',     slug: (s) => `${s}-iz-rossii`,         title: 'Из России' },
  { key: 'cena',   slug: (s) => `${s}-cena`,              title: 'Цена' },
  { key: 'sub',    slug: (s) => `${s}-podpiska`,          title: 'Подписка' },
  { key: 'year',   slug: (s) => `${s}-2026`,              title: 'В 2026' },
];

export const YEAR = 2026;
