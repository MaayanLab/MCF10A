import os
import glob, json, csv

def get_mwa_values(data_dir, drug):
    mwa_values = {}
    values_dir = os.path.join(data_dir, "mwa", "values")
    for values_filename in glob.glob(values_dir + "/MWA_"+(drug.lower())+"*.tsv"):
        # print "values_filename=", values_filename
        base = os.path.basename(values_filename)
        filename = os.path.splitext(base)[0]

        time = filename.split("_")[2]

        if time not in mwa_values:
            mwa_values[time] = {}

        mwa_values[time] = get_mwa_score(values_filename)

    return mwa_values

def get_mwa_z_score(filename):
    value = {}
    with open(filename, 'rb') as tsvfile:
        tsvreader = csv.reader(tsvfile, delimiter="\t")
        header = next(tsvreader) 

        for row in tsvreader:
            ratio = row[0]
			conc = row[2]
			val = row[7]
			if ratio not in value:
				value[ratio] = {}
			if conc not in value[ratio]:
				value[ratio][conc] = {}
			#Note: No SD extracted
            value[ratio][conc] = float(val)

    return value

mwa_values = get_mwa_values("C:\\Users\\maayanlab\\MCF10A\\MCF10A_app\\app\\static\\data\\", "vorinostat")
json.dump(mwa_values, open('C:\\Users\\maayanlab\\MCF10A\\MCF10A_app\\app\\static\\data\\mwa\\json\\vorinostat.json','wb'))
