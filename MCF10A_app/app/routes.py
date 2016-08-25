from flask import Flask, render_template
import os
import glob, json, csv
from . import flask_app as app
import utils

# define all routes
@app.route(app.config["ENTRY_POINT"], methods=['GET'])
@app.route(app.config["ENTRY_POINT"] + "index.html", methods=['GET'])
@app.route(app.config["ENTRY_POINT"] + "assays", methods=['GET'])
def assays():
    return render_template("assays.html", menu_item="assays")

@app.route(app.config["ENTRY_POINT"] + "drugs", methods=['GET'])
def drugs():
    return render_template("drugs.html", menu_item="drugs")

@app.route(app.config["ENTRY_POINT"] + "analysis", methods=['GET'])
@app.route(app.config["ENTRY_POINT"] + "analysis.html", methods=['GET'])
def analysis():
    all_values, p100_lookup, gcp_lookup = utils.get_canvas_values()
    return render_template("analysis.html", menu_item="analysis", canvas_order=utils.get_canvas_layouts(), canvas_values=all_values, p100_gene_lookup=p100_lookup, gcp_lookup=gcp_lookup )

@app.route(app.config["ENTRY_POINT"] + "drugs/<drug>", methods=['GET'])
def drug_view(drug):
    print drug
    return render_template("pages/drug-view.html", menu_item="drugs", drug_selected=drug)
