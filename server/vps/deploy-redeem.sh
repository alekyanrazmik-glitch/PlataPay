#!/usr/bin/env bash
# Выкладка сайта активации на redeem.payoplata.ru.
#
# Что делает:
#   1) забирает свежий код из репозитория;
#   2) собирает out-redeem/ (шесть страниц + свои ассеты, CNAME, sitemap);
#   3) публикует в /var/www/platapay-redeem через временный каталог,
#      чтобы сайт не был наполовину обновлённым ни одной секунды;
#   4) СОХРАНЯЕТ ваш api-config.js — адрес поставщика, если вы правили его
#      на сервере, переживёт обновление.
#
# Запуск:  sudo bash deploy-redeem.sh
# Обновление по расписанию (раз в неделю, вс 05:30):
#   echo '30 5 * * 0 root bash /opt/platapay-seo-build/server/vps/deploy-redeem.sh >> /var/log/platapay-redeem.log 2>&1' > /etc/cron.d/platapay-redeem

set -euo pipefail

REPO_URL="${REPO_URL:-https://github.com/alekyanrazmik-glitch/PlataPay.git}"
WORK_DIR="${WORK_DIR:-/opt/platapay-seo-build}"
WEB_ROOT="${WEB_ROOT:-/var/www/platapay-redeem}"
CONFIG="api-config.js"

command -v git >/dev/null || { echo "нужен git"; exit 1; }
command -v rsync >/dev/null || { echo "нужен rsync"; exit 1; }
command -v node >/dev/null || { echo "нужен Node.js 20+"; exit 1; }
node -e 'process.exit(Number(process.versions.node.split(".")[0]) >= 20 ? 0 : 1)' \
  || { echo "Node.js слишком старый: $(node -v), нужен 20+"; exit 1; }

# 1. Код
if [ -d "$WORK_DIR/.git" ]; then
  git -C "$WORK_DIR" fetch origin main
  git -C "$WORK_DIR" reset --hard origin/main
else
  git clone --depth 1 "$REPO_URL" "$WORK_DIR"
fi

# 2. Сборка
cd "$WORK_DIR"
NEXT_PUBLIC_BASE_PATH= node build.mjs

[ -f "out-redeem/index.html" ] || { echo "сборка не дала out-redeem/index.html"; exit 1; }

# 3. Сохраняем настроенный на сервере адрес поставщика
KEEP=""
if [ -f "$WEB_ROOT/$CONFIG" ]; then
  KEEP="$(mktemp)"
  cp "$WEB_ROOT/$CONFIG" "$KEEP"
fi

# 4. Публикация: временный каталог + быстрый своп
rm -rf "$WEB_ROOT.new"
mkdir -p "$WEB_ROOT.new"
rsync -a --delete out-redeem/ "$WEB_ROOT.new/"

if [ -n "$KEEP" ]; then
  cp "$KEEP" "$WEB_ROOT.new/$CONFIG"
  rm -f "$KEEP"
  echo "api-config.js с сервера сохранён (адрес поставщика не тронут)"
fi

if [ -d "$WEB_ROOT" ]; then mv "$WEB_ROOT" "$WEB_ROOT.old.$$"; fi
mv "$WEB_ROOT.new" "$WEB_ROOT"
rm -rf "$WEB_ROOT.old.$$" 2>/dev/null || true

echo "OK: $(find "$WEB_ROOT" -name '*.html' | wc -l) страниц в $WEB_ROOT"
echo "Активный адрес API:"
grep -E '^window\.PP_REDEEM_API' "$WEB_ROOT/$CONFIG" | sed 's/^/  /'
echo "Конфиг nginx — см. nginx-redeem-site.conf.example, затем: nginx -t && systemctl reload nginx"
