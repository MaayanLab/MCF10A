import os
import glob, json, csv

def get_cycif_values(data_dir, drug):
    cycif_values = {}
    values_dir = os.path.join(data_dir, "cycif", "values")
    for values_filename in glob.glob(values_dir + "/CycIF_"+(drug.lower())+"*.tsv"):
        # print "values_filename=", values_filename
        base = os.path.basename(values_filename)
        filename = os.path.splitext(base)[0]

        time = filename.split("_")[2]

        if time not in cycif_values:
            cycif_values[time] = {}

        cycif_values[time] = get_cycif_z_score(values_filename)

    return cycif_values

def get_cycif_z_score(filename):
    value = {}
    with open(filename, 'rb') as tsvfile:
        tsvreader = csv.reader(tsvfile, delimiter="\t")
        header = next(tsvreader) 
        # get header info
        col_lookup = ['molecule']
        for col in header[1:]: # ex: col = "2_down_0.04"
            concentration = float(col.split("_")[1])
            compartment = col.split("_")[3]
            if concentration not in value:
                value[concentration] = {}
            if compartment not in value[concentration]:
                value[concentration][compartment] = {}
            col_lookup.append({'conc': concentration, 'comp': compartment})

        for row in tsvreader:
            molecule = row[0]
            for i in xrange(1, len(row)):
                conc = col_lookup[i]['conc']
                comp = col_lookup[i]['comp']
                val = row[i]
                value[conc][comp][molecule] = float(val)

    return value

cycif_values = get_cycif_values("C:\\Users\\maayanlab\\MCF10A\\MCF10A_app\\app\\static\\data\\", "vorinostat")
json.dump(cycif_values, open('C:\\Users\\maayanlab\\MCF10A\\MCF10A_app\\app\\static\\data\\cycif\\json\\vorinostat.json','wb'))