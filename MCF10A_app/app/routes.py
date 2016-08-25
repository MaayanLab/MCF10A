from flask import Flask, render_template
import os
import glob, json, csv
from . import flask_app as app
import utils

ENTRY_POINT = '/MCF10A/'
# CANVAS_ASSAYS = ['gcp', 'l1000', 'p100']
# app = Flask(__name__, static_url_path=ENTRY_POINT + 'static', static_folder='static')

# define all routes
@app.route(ENTRY_POINT, methods=['GET'])
@app.route(ENTRY_POINT + "index.html", methods=['GET'])
@app.route(ENTRY_POINT + "assays", methods=['GET'])
def assays():
    return render_template("assays.html", menu_item="assays")

@app.route(ENTRY_POINT + "drugs", methods=['GET'])
def drugs():
    return render_template("drugs.html", menu_item="drugs")

@app.route(ENTRY_POINT + "analysis", methods=['GET'])
def analysis():
    all_values, p100_lookup, gcp_lookup = utils.get_canvas_values()
    return render_template("analysis.html", menu_item="analysis", canvas_order=utils.get_canvas_layouts(), canvas_values=all_values, p100_gene_lookup=p100_lookup, gcp_lookup=gcp_lookup )

@app.route(ENTRY_POINT + "drugs/<drug>", methods=['GET'])
def drug_view(drug):
    print drug
    return render_template("pages/drug-view.html", menu_item="drugs", drug_selected=drug)
