#!/bin/sh
# Construit les fichiers minifiés et met à jour le numéro de version dans les pages HTML.
set -e
cd "$(dirname "$0")"
cat css/fonts.css css/style.css > /tmp/_all.css
npx --yes esbuild /tmp/_all.css --minify --outfile=css/style.min.css --log-level=warning
npx --yes esbuild js/main.js --minify --target=es2018 --outfile=js/main.min.js --log-level=warning
V=$(date +%Y%m%d%H%M)
for f in *.html; do sed -i '' -E "s#(style\.min\.css|main\.min\.js)\?v=[A-Za-z0-9]*#\1?v=$V#g" "$f"; done
echo "build ok ($V)"
