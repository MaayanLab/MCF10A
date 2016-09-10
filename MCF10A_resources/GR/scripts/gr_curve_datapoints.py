"""
Output GR curve datapoints for each drug to be used in D3 visualization.
Also includes GR curve datapoints for median curve

Usage: python gr_curve_datapoints.py <GRmetrics filename> <output folder>
Example: python gr_curve_datapoints.py ../data/All-Centers_GRmetrics_060116.tsv ../output/
"""

import sys
import csv
import numpy as np
import pandas as pd

# GR data fitted by function(c){GRinf + (1 - GRinf)/(1 + (c/EC50)^Hill)}
def GR_curve_fitting(c, GR_inf, GEC_50, hill):
	return GR_inf + ((1 - GR_inf) / (1 + (c/GEC_50)**hill))

def main(args):
	# Create a dict where keys are agents/drugs and values are [col_name, GEC_50, GR_inf, hill]
	all_agents_dict = {}
	GRmetrics_filename = args[1]

	csvfile = csv.reader(open(GRmetrics_filename), delimiter='\t')
	csvfile.next()  # skip header row
					# cell_line	agent	time	GR50	GRmax	GR_AOC	GEC50	GRinf	Hill	Replicate

	for row in csvfile:
		cell_line = row[0]
		agent = row[1]
		time = row[2]
		GEC_50 = float(row[6])
		GR_inf = float(row[7])
		hill = float(row[8])
		replicate = row[9]

		col_name = cell_line.replace(" ", "_") + "_" + time + "_" + replicate[-2:]

		if agent in all_agents_dict:
			all_agents_dict[agent].append([col_name, GEC_50, GR_inf, hill])
		else:
			all_agents_dict[agent] = [[col_name, GEC_50, GR_inf, hill]]

	for agent in all_agents_dict:
		print agent
		x_vals = np.arange(-5, 5, 0.05)  # 200 values from -5 to 5 distributed evenly
		x_vals = [10**c for c in x_vals]

		df = pd.DataFrame(x_vals, columns=["concentration"])
		series = pd.Series(x_vals)

		all_GEC_50 = []
		all_GR_inf = []
		all_hill = []

		for id, GEC_50, GR_inf, hill in all_agents_dict[agent]:
			all_GEC_50.append(GEC_50)
			all_GR_inf.append(GR_inf)
			all_hill.append(hill)

			if GEC_50 == 0:
				GEC_50 = GR_inf
			y_vals = series.apply(GR_curve_fitting, args=(GR_inf, GEC_50, hill))
			df[id] = y_vals

		# also include median curve
		median_GEC_50 = np.median(all_GEC_50)
		median_GR_inf = np.median(all_GR_inf)
		median_hill = np.median(all_hill)

		y_vals = series.apply(GR_curve_fitting, args=(GR_inf, GEC_50, hill))
		df["Median"] = y_vals
		
		output_folder = args[2]
		output_filename = output_folder + "MCF10A_" + agent.lower() + "_curve_datapoints.csv"

		df.to_csv(output_filename, sep=',', encoding='utf-8', index=False)

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print "Usage: python gr_curve_datapoints.py <GRmetrics filename> <output folder>"
        sys.exit()
    main(sys.argv)