from flask import Flask, render_template
import os

# Rename this.
ENTRY_POINT = '/MCF10A/'

app = Flask(__name__, static_url_path=ENTRY_POINT + 'static', static_folder='static')

# @app.route(ENTRY_POINT + "<view>", methods=['GET'])
# def index(view):
#     print view
#     return render_template("index.html")

@app.route(ENTRY_POINT, methods=['GET'])
@app.route(ENTRY_POINT + "index.html", methods=['GET'])
@app.route(ENTRY_POINT + "assays.html", methods=['GET'])
def assays():
    return render_template("assays.html", menu_item="assays")

@app.route(ENTRY_POINT + "drugs.html", methods=['GET'])
def drugs():
    return render_template("drugs.html", menu_item="drugs")

@app.route(ENTRY_POINT + "analysis.html", methods=['GET'])
def analysis():
    #json_data = get_my_json()
    test_dict = {"a": 1, "b": 2, "c": 3}
    all_dicts = [test_dict, test_dict, test_dict]
    return render_template("analysis.html", json_data=all_dicts, menu_item="analysis")