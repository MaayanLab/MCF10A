# This is only for development.
#
# In production, Flask is run by mod_wsgi, which imports the via wsgi.py.
#!C:\Python27\python.exe

from app.routes import app as app
app.debug=True
app.run(port=8080, host='0.0.0.0')
