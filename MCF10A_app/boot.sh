#!/usr/bin/env bash

adduser --disabled-password --gecos '' r
cd /mcf10a/
mod_wsgi-express setup-server wsgi.py --port=80 --user r --group r --server-root=/etc/mcf10a --socket-timeout=600
chmod a+x /etc/mcf10a/handler.wsgi
/etc/mcf10a/apachectl start
tail -f /etc/mcf10a/error_log
