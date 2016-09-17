from flask import Flask, render_template
import os
import glob, json, csv
from . import flask_app as app
import utils
from tile_factory import parser as tile_parser
from drug_factory import parser as drug_parser

import logging
from logging.handlers import RotatingFileHandler
import sys

# change routing of logs when running docker
# logging.basicConfig(stream=sys.stderr)

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
    # l1000cds2_dict_file = app.static_folder + '/data/l1000/l1000cds2/l1000cds2_dict.json'

    # with open(l1000cds2_dict_file, 'rb+') as json_file:
    #     l1000cds2_dict = json_file.read()
    l1000cds2_dict = {'neratinib': {'3h': {'10.0': '57d59dec4760621c0177cd4b', '1.11': '57d59deb4760621c0177cd47', '0.37': '57d59dea4760621c0177cd45', '0.04': '57d59de94760621c0177cd41', '3.33': '57d59deb4760621c0177cd49', '0.12': '57d59dea4760621c0177cd43'}, '24h': {'10.0': '57d59de84760621c0177cd3f', '1.11': '57d59de74760621c0177cd3b', '0.37': '57d59de74760621c0177cd39', '0.04': '57d59de64760621c0177cd35', '3.33': '57d59de84760621c0177cd3d', '0.12': '57d59de64760621c0177cd37'}}, 'dasatinib': {'3h': {'10.0': '57d59df34760621c0177cd63', '1.11': '57d59df14760621c0177cd5f', '0.37': '57d59df14760621c0177cd5d', '0.04': '57d59df04760621c0177cd59', '3.33': '57d59df24760621c0177cd61', '0.12': '57d59df04760621c0177cd5b'}, '24h': {'10.0': '57d59def4760621c0177cd57', '1.11': '57d59dee4760621c0177cd53', '0.37': '57d59ded4760621c0177cd51', '0.04': '57d59dec4760621c0177cd4d', '3.33': '57d59def4760621c0177cd55', '0.12': '57d59ded4760621c0177cd4f'}}, 'trametinib': {'3h': {'10.0': '57d59e064760621c0177cdab', '1.11': '57d59e054760621c0177cda7', '0.37': '57d59e054760621c0177cda5', '0.04': '57d59e034760621c0177cda1', '3.33': '57d59e064760621c0177cda9', '0.12': '57d59e044760621c0177cda3'}, '24h': {'10.0': '57d59e034760621c0177cd9f', '1.11': '57d59e024760621c0177cd9b', '0.37': '57d59e014760621c0177cd99', '0.04': '57d59e004760621c0177cd95', '3.33': '57d59e024760621c0177cd9d', '0.12': '57d59e014760621c0177cd97'}}, 'palbociclib': {'3h': {'10.0': '57d59df94760621c0177cd7b', '1.11': '57d59df84760621c0177cd77', '0.37': '57d59df84760621c0177cd75', '0.04': '57d59df64760621c0177cd71', '3.33': '57d59df94760621c0177cd79', '0.12': '57d59df74760621c0177cd73'}, '24h': {'10.0': '57d59df64760621c0177cd6f', '1.11': '57d59df54760621c0177cd6b', '0.37': '57d59df44760621c0177cd69', '0.04': '57d59df34760621c0177cd65', '3.33': '57d59df54760621c0177cd6d', '0.12': '57d59df44760621c0177cd67'}}, 'alpelisib': {'3h': {'10.0': '57d59e004760621c0177cd93', '1.11': '57d59dfe4760621c0177cd8f', '0.37': '57d59dfe4760621c0177cd8d', '0.04': '57d59dfd4760621c0177cd89', '3.33': '57d59dff4760621c0177cd91', '0.12': '57d59dfd4760621c0177cd8b'}, '24h': {'10.0': '57d59dfc4760621c0177cd87', '1.11': '57d59dfb4760621c0177cd83', '0.37': '57d59dfb4760621c0177cd81', '0.04': '57d59dfa4760621c0177cd7d', '3.33': '57d59dfc4760621c0177cd85', '0.12': '57d59dfa4760621c0177cd7f'}}}
    

    all_values, p100_lookup, gcp_lookup = utils.get_canvas_values()

    return render_template("pages/drug-view.html", menu_item="drugs", drug_selected=drug, drug_info=drug_dict, data_available=data_available, data_conc=data_conc, gr_download=gr_download_file, assay_color=assay_color, l1000cds2_dict=l1000cds2_dict, canvas_order=utils.get_canvas_layouts(), canvas_values=all_values, p100_gene_lookup=p100_lookup, gcp_lookup=gcp_lookup)

@app.route(app.config["ENTRY_POINT"] + "assays/details", methods=['GET'])
def assay_details():
    return render_template("pages/alldetails.html", menu_item="assays")