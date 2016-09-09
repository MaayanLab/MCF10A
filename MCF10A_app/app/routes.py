from flask import Flask, render_template
import os
import glob, json, csv
from . import flask_app as app
import utils
from tile_factory import parser as tile_parser
from drug_factory import parser as drug_parser

# define all routes
@app.route(app.config["ENTRY_POINT"], methods=['GET'])
@app.route(app.config["ENTRY_POINT"] + "index.html", methods=['GET'])
@app.route(app.config["ENTRY_POINT"] + "assays", methods=['GET'])
def assays():
    all_tiles =  tile_parser.get_tile_list(app.static_folder + "/data/tiles/assay-tiles.txt")
    return render_template("all-tiles.html", menu_item="assays", tile_list=all_tiles)

@app.route(app.config["ENTRY_POINT"] + "drugs", methods=['GET'])
def drugs():
    all_tiles =  tile_parser.get_tile_list(app.static_folder + "/data/tiles/drug-tiles.txt")
    return render_template("all-tiles.html", menu_item="drugs", tile_list=all_tiles)
    # return render_template("assays.html", menu_item="assays", all_tiles=all_tiles)

@app.route(app.config["ENTRY_POINT"] + "analysis", methods=['GET'])
@app.route(app.config["ENTRY_POINT"] + "analysis.html", methods=['GET'])
def analysis():
    all_values, p100_lookup, gcp_lookup = utils.get_canvas_values()
    return render_template("analysis.html", menu_item="analysis", canvas_order=utils.get_canvas_layouts(), canvas_values=all_values, p100_gene_lookup=p100_lookup, gcp_lookup=gcp_lookup )

@app.route(app.config["ENTRY_POINT"] + "drugs/<drug>", methods=['GET'])
def drug_view(drug):
    assay_color = {"L1000": "red", "P100": "blue", "GCP": "green"};
    drug_info_file = app.static_folder + '/data/drugs/' + drug.lower() + '.txt'
    drug_dict = drug_parser.parse_drug_file(drug_info_file)
    data_conc, data_available = drug_parser.drug_data_available(drug_dict)
    gr_download_file = app.static_folder + '/data/gr/metrics/MCF10A_' + drug.lower() + '_GR.tsv'

    return render_template("pages/drug-view.html", menu_item="drugs", drug_selected=drug, drug_info=drug_dict, data_available=data_available, data_conc=data_conc, gr_download=gr_download_file, assay_color=assay_color)
