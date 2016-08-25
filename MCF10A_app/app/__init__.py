from flask import Flask

ENTRY_POINT = '/MCF10A/'

flask_app = Flask(__name__, static_url_path=ENTRY_POINT + 'static', static_folder='static')

# Setup routes after initializing Flask app
import routes