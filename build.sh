#!/bin/sh
git config --global url.https://xprueg:${RENDER_COM_WWW_FONTS}@github.com/xprueg/www-fonts.git.insteadOf https://github.com/xprueg/www-fonts.git && git submodule update --init