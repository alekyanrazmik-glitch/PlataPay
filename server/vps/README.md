# SEO-страницы на VPS payoplata.ru

## Зачем это

Домен `payoplata.ru` указывает на VPS (5.42.104.116, Timeweb Cloud) с
основным приложением. При этом статические SEO-страницы собираются из
этого репозитория: ~1 450 страниц (541 статья /blog/ + ~900 лендингов
сервисов; гео-ярус на ~100k страниц выключен и включается `SEO_GEO=1`).
Чтобы они открывались на том же домене, VPS должен раздавать их как
статику, отдавая всё остальное приложению.

GitHub Pages деплой из этого репозитория продолжает работать, но пока
DNS домена смотрит на VPS — посетители его не видят.

## Установка (5 минут, на VPS под root)

```bash
git clone --depth 1 https://github.com/alekyanrazmik-glitch/PlataPay.git /opt/platapay-seo-build
bash /opt/platapay-seo-build/server/vps/deploy-seo.sh
```

Скрипт соберёт страницы (~35 сек, нужен Node.js 20+) и выложит их в
`/var/www/platapay-seo`.

Затем подключите nginx по образцу `nginx-seo.conf.example`
(суть: `try_files $uri $uri/index.html @app;`) и перезагрузите:

```bash
nginx -t && systemctl reload nginx
```

## Проверка

```bash
curl -I https://payoplata.ru/g/chatgpt/oplata-moskva.html  # 200
curl -I https://payoplata.ru/gorod/                        # 200
curl -I https://payoplata.ru/sitemap.xml                   # 200, sitemapindex
curl -I https://payoplata.ru/oplata-chatgpt/               # 200
```

Главная, каталог и другие страницы приложения продолжают отдаваться
приложением: статика их не содержит (список исключений — `APP_OWNED`
в `deploy-seo.sh`).

## Обновление

Повторный запуск `deploy-seo.sh` подтягивает свежий `main` и пересобирает
страницы. Крон на еженедельное обновление:

```
echo '0 5 * * 0 root bash /opt/platapay-seo-build/server/vps/deploy-seo.sh >> /var/log/platapay-seo.log 2>&1' > /etc/cron.d/platapay-seo
```

## Альтернатива, если доступа к VPS нет

Поддомен на GitHub Pages (например `go.payoplata.ru`):
CNAME-запись поддомена → `alekyanrazmik-glitch.github.io`, в настройках
Pages репозитория указать поддомен, пересобрать с каноникалами на него.
Минус: поддомен ранжируется хуже основного домена, каноникалы всех
страниц придётся переписать (сейчас они на `https://payoplata.ru/...`).
