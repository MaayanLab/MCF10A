from flask import Flask, render_template
import os
import glob, json, csv
from . import flask_app as app
import utils
from tile_factory import parser

# define all routes
@app.route(app.config["ENTRY_POINT"], methods=['GET'])
@app.route(app.config["ENTRY_POINT"] + "index.html", methods=['GET'])
@app.route(app.config["ENTRY_POINT"] + "assays", methods=['GET'])
def assays():
    all_tiles =  parser.get_tile_list(app.static_folder + "/data/tiles/assay-tiles.txt")
    return render_template("all-tiles.html", menu_item="assays", tile_list=all_tiles)

@app.route(app.config["ENTRY_POINT"] + "drugs", methods=['GET'])
def drugs():
    all_tiles =  parser.get_tile_list(app.static_folder + "/data/tiles/drug-tiles.txt")
    return render_template("all-tiles.html", menu_item="drugs", tile_list=all_tiles)
    # return render_template("assays.html", menu_item="assays", all_tiles=all_tiles)

@app.route(app.config["ENTRY_POINT"] + "analysis", methods=['GET'])
@app.route(app.config["ENTRY_POINT"] + "analysis.html", methods=['GET'])
def analysis():
    all_values, p100_lookup, gcp_lookup = utils.get_canvas_values()
    return render_template("analysis.html", menu_item="analysis", canvas_order=utils.get_canvas_layouts(), canvas_values=all_values, p100_gene_lookup=p100_lookup, gcp_lookup=gcp_lookup )

@app.route(app.config["ENTRY_POINT"] + "drugs/<drug>", methods=['GET'])
def drug_view(drug):
    print drug
    gr_curve_filename = app.static_folder + 'data/gr/metrics/MCF10A_dasatinib_GR.tsv'
    print "gr_curve_filename=", gr_curve_filename
    return render_template("pages/drug-view.html", menu_item="drugs", drug_selected=drug, gr_curve_file=gr_curve_filename)
