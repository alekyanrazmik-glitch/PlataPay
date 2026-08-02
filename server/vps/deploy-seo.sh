#!/usr/bin/env bash
# Деплой статических SEO-страниц PlataPay на VPS — рядом с основным
# приложением, на том же домене payoplata.ru.
#
# Что делает:
#   1) клонирует/обновляет репозиторий alekyanrazmik-glitch/PlataPay;
#   2) собирает ~101 000 статических страниц (node build.mjs, ~35 сек);
#   3) выкладывает их в WEB_ROOT, исключая страницы, которые должно
#      отдавать приложение (главная, каталог и т.д. — список APP_OWNED);
#   4) nginx раздаёт статику первой, всё остальное уходит в приложение
#      (см. nginx-seo.conf.example).
#
# Требования: git, rsync, Node.js 20+ (проверяется ниже).
# Запуск:  sudo bash deploy-seo.sh
# Обновление по расписанию (раз в неделю, вс 05:00):
#   echo '0 5 * * 0 root bash /opt/platapay-seo-build/server/vps/deploy-seo.sh >> /var/log/platapay-seo.log 2>&1' > /etc/cron.d/platapay-seo

set -euo pipefail

REPO_URL="${REPO_URL:-https://github.com/alekyanrazmik-glitch/PlataPay.git}"
WORK_DIR="${WORK_DIR:-/opt/platapay-seo-build}"
WEB_ROOT="${WEB_ROOT:-/var/www/platapay-seo}"

# Разделы, которые отдаёт ПРИЛОЖЕНИЕ, а не статика. Если какой-то из них
# должен отдаваться статикой из этого репозитория — уберите из списка.
APP_OWNED=(index.html catalog faq contacts reviews travel 404.html)

command -v git >/dev/null || { echo "нужен git"; exit 1; }
command -v rsync >/dev/null || { echo "нужен rsync"; exit 1; }
command -v node >/dev/null || { echo "нужен Node.js 20+ (например: curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && apt-get install -y nodejs)"; exit 1; }
node -e 'process.exit(Number(process.versions.node.split(".")[0]) >= 20 ? 0 : 1)' \
  || { echo "Node.js слишком старый: $(node -v), нужен 20+"; exit 1; }

# 1. Код
if [ -d "$WORK_DIR/.git" ]; then
  git -C "$WORK_DIR" fetch origin main
  git -C "$WORK_DIR" reset --hard origin/main
else
  git clone --depth 1 "$REPO_URL" "$WORK_DIR"
fi

# 2. Сборка в корневом базовом пути (без /PlataPay префикса)
cd "$WORK_DIR"
NEXT_PUBLIC_BASE_PATH= node build.mjs

# 3. Публикация: rsync во временный каталог + быстрый своп
EXCLUDES=()
for p in "${APP_OWNED[@]}"; do EXCLUDES+=(--exclude "/$p"); done

mkdir -p "$WEB_ROOT.new"
rsync -a --delete "${EXCLUDES[@]}" out/ "$WEB_ROOT.new/"
if [ -d "$WEB_ROOT" ]; then mv "$WEB_ROOT" "$WEB_ROOT.old.$$"; fi
mv "$WEB_ROOT.new" "$WEB_ROOT"
rm -rf "$WEB_ROOT.old.$$" 2>/dev/null || true

echo "OK: $(find "$WEB_ROOT" -name '*.html' | wc -l) html-файлов в $WEB_ROOT"
echo "Не забудьте подключить nginx-конфиг (см. nginx-seo.conf.example) и: nginx -t && systemctl reload nginx"
