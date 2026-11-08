#!/bin/bash
# concatenates sources into one self-contained HTML page
cd "$(dirname "$0")/src"
JS="data.js engine.js lab.js book3d.js"
for f in titr.js ptable.js sol.js calc.js gas.js; do [ -f $f ] && JS="$JS $f"; done
JS="$JS app.js"
{
cat <<'HEAD'
<!doctype html>
<html lang="kk">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>ХимЛаб</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Onest:wght@400;500;600;700;800&family=Caveat:wght@600;700&family=JetBrains+Mono:wght@400;500&display=swap">
<style>
HEAD
cat style.css
echo '</style>'
cat body.html
echo '<script>'
for f in $JS; do cat $f; echo; done
echo '</script>'
} > ../index.html
echo "built: $(wc -c < ../index.html) bytes; js: $JS"
for f in $JS; do node --check $f || echo "SYNTAX ERROR in $f"; done
