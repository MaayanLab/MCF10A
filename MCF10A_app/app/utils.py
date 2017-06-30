'''
Helper functions for displaying canvases
'''

import os
import glob, json, csv

from . import flask_app as app

# get JSON for layouts
def get_canvas_layouts():
    # print "static folder=", app.static_folder
    data_dir = app.static_folder + "/data"
    all_canvas_layouts = {}

    for assay in app.config["CANVAS_ASSAYS"]:
        canvas_order_dir = os.path.join(data_dir, assay, "canvas_order")
        for order_filename in glob.glob(canvas_order_dir + "\*.json"):
            base = os.path.basename(order_filename)
            filename = os.path.splitext(base)[0]
            time = filename.split("_")[-1]
            canvas = "_".join(filename.split("_")[:-1])
            if (canvas not in all_canvas_layouts):
                all_canvas_layouts[canvas] = {}
            with open(order_filename) as data_file:
                all_canvas_layouts[canvas][time] = json.load(data_file)["texts"]

    return all_canvas_layouts

# get JSON for values
def get_canvas_values():
    data_dir = app.static_folder + "/data"
    all_values = {}

    # get L1000 combined score values
    values_dir = os.path.join(data_dir, "l1000", "values")
    for values_filename in glob.glob(values_dir + "/*.tsv"):
        # print "values_filename=", values_filename
        base = os.path.basename(values_filename)
        filename = os.path.splitext(base)[0]
        time = filename.split("_")[-3]
        drug = filename.split("_")[-4]
        library = "_".join(filename.split("_")[:-4])
        if library not in all_values:
            all_values[library] = {}
        if time not in all_values[library]:
            all_values[library][time] = {}
        all_values[library][time][drug] = get_l1000_combined_score(values_filename)

    # get P100 z-score values
    values_dir = os.path.join(data_dir, "p100", "values")
    for values_filename in glob.glob(values_dir + "/old_values/*.tsv"):
        # print "values_filename=", values_filename
        base = os.path.basename(values_filename)
        filename = os.path.splitext(base)[0]
        assay = filename.split("_")[0]
        drug = filename.split("_")[1]
        time = filename.split("_")[2]
        if assay not in all_values:
            all_values[assay] = {}
        if time not in all_values[assay]:
            all_values[assay][time] = {}
        all_values[assay][time][drug], p100_lookup = get_p100_z_score(values_filename)

    # get GCP z-score values
    values_dir = os.path.join(data_dir, "gcp", "values")
    for values_filename in glob.glob(values_dir + "/*.tsv"):
        # print "values_filename=", values_filename
        base = os.path.basename(values_filename)
        filename = os.path.splitext(base)[0]
        assay = filename.split("_")[0]
        drug = filename.split("_")[1]
        time = filename.split("_")[2]
        if assay not in all_values:
            all_values[assay] = {}
        if time not in all_values[assay]:
            all_values[assay][time] = {}
        all_values[assay][time][drug], gcp_lookup = get_gcp_z_score(values_filename)

    return all_values, p100_lookup, gcp_lookup

def get_l1000_combined_score(filename):
    '''
    Returns dictionary 
        value {
                concentration: 
                    down: {term: value, ...}
                    up: {term: value, ...}
                ...
                }
    '''
    value = {}
    with open(filename, 'rb') as tsvfile:
        tsvreader = csv.reader(tsvfile, delimiter="\t")
        header = next(tsvreader) 
        # get header info
        col_lookup = ['term']
        for col in header[1:]: # ex: col = "2_down_0.04"
            direction = col.split("_")[1]
            concentration = float(col.split("_")[2]) # make sure to convert concentration to value (due to Clustergrammer hack of including 01.11 for alphabetical ordering)
            if concentration not in value:
                value[concentration] = {}
            value[concentration][direction] = {}
            col_lookup.append({'dir': direction, 'conc': concentration})

        for row in tsvreader:
            term = row[0]
            for i in xrange(1, len(row)):
                conc = col_lookup[i]['conc']
                dir = col_lookup[i]['dir']
                val = row[i]
                value[conc][dir][term] = float(val)

    return value

def get_p100_z_score(filename):
    value = {}
    with open(filename, 'rb') as tsvfile:
        tsvreader = csv.reader(tsvfile, delimiter="\t")
        header = next(tsvreader)
        # get header info
        col_lookup = ['id']
        for col in header[1:]: 
            col_lookup.append(col)
            try:
                conc = float(col)
                value[conc] = {}
            except ValueError:
                continue
        p100GeneLookup = {}
        for row in tsvreader:
            id = row[0] # 10011_DYRK_Y321_IYQY[+80]IQSR
            display_term = id.split("_")[1] + " : " + id.split("_")[2]
            p100GeneLookup[id] = display_term
            for i in xrange(2, len(row)):
                val = row[i]
                conc = float(col_lookup[i])
                try:
                    value[conc][id] = float(val)
                except ValueError:
                    value[conc][id] = 0

    return value, p100GeneLookup

def get_gcp_z_score(filename):
    value = {}
    with open(filename, 'rb') as tsvfile:
        tsvreader = csv.reader(tsvfile, delimiter="\t")
        header = next(tsvreader)
        # get header info
        col_lookup = ['id']
        for col in header[1:]: 
            col_lookup.append(col)
            try:
                conc = float(col)
                value[conc] = {}
            except ValueError:
                continue
        gcp_lookup = {}
        for row in tsvreader:
            id = row[0]
            gcp_lookup[id] = row[1] # gene symbol
            for i in xrange(2, len(row)):
                val = row[i]
                conc = float(col_lookup[i])
                try:
                    value[conc][id] = float(val)
                except ValueError:
                    value[conc][id] = 0

    return value, gcp_lookup