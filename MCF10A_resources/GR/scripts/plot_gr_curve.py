'''
Script for plotting GR curve -- should modify accordingly

Usage: python plot_gr_curve.py <GRmetrics filename> <drug name>
Example: python plot_gr_curve.py ../output/MCF10A_palbociclib_GR.tsv Palbociclib
'''
import sys
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

def GR_curve_fitting(c, GR_inf, GEC_50, hill):
	'''GR data fitted by function(c){GRinf + (1 - GRinf)/(1 + (c/GEC50)^Hill)}'''
	return GR_inf + (1 - GR_inf) / (1 + (c/GEC_50)**hill)

def get_GRcurve_y_vals(x_vals, GR_inf, GEC_50, hill):
	'''Returns y values for given concentrations (x_vals) and parameters for curve fitting function'''
	if GEC_50 == 0:
		GEC_50 = GR_inf

	series = pd.Series(x_vals)

	return series.apply(GR_curve_fitting, args=(GR_inf, GEC_50, hill))	

def main(args):
    # retrieve GR metrics filename, drug name from sys.argv
    GRmetrics_filename = args[1]
    drug_name = args[2].lower()

    df  = pd.read_csv(GRmetrics_filename, sep="\t")

    x_vals = np.arange(-5, 5, 0.05)  # 200 values from -5 to 5 distributed evenly
    x_vals = [10**c for c in x_vals]

    # for index, row in df.iterrows():
    # 	y_vals = get_GRcurve_y_vals(x_vals, row['GRinf'], row['GEC50'], row['Hill'])
    # 	plt.plot(x_vals, y_vals, label='_nolegend_')

    
    # neratinib
    # y_vals = get_GRcurve_y_vals(x_vals, 0.027373, 0.131355, 1.5229)
    # alpelisib
    # y_vals = get_GRcurve_y_vals(x_vals, -0.43055, 43.00896, 0.621729)
    # palbociclib
    y_vals = get_GRcurve_y_vals(x_vals, 0.323235, 0.323235, 1.076615)
    # dasatinib
    # y_vals = get_GRcurve_y_vals(x_vals, -0.17237, 0.53092, 0.798662)
    # trametinib
    # y_vals = get_GRcurve_y_vals(x_vals, 0.112601, 0.572791, 1.297126)

    plt.plot(x_vals, y_vals, label='_nolegend_', color='k', linewidth=5)

    # add L1000 measurements
    xposition = [0.04, 0.12, 0.37, 1.11, 3.33, 10]

    # add GCP/P100 measurements
    # xposition = [0.1, 0.316228, 1]

    # yposition_palbociclib = [0.961952753278823, 0.8868244281492361, 0.7313343169002264, 0.5660288770584185, 0.47197264246549775, 0.43660591588310915]
    # yposition_neratinib = [0.8633014850124309, 0.547113602624443, 0.19389121192726647, 0.06367147491444353,0.03439806412984934, 0.028697149898788417]
    # yposition_alpelisib = [0.9815876914991485, 0.9639997838361857, 0.9293029930933184, 0.8664931927902951, 0.7578189327270383, 0.5885508399262639]
    # dasatinib
    # yposition = [0.8680695338013913, 0.7260522480628289, 0.4977614747710373, 0.2460004912060722, 0.047428954900566284, -0.06980052457070175]
    # trametinib
    # yposition = [0.9727614494221332, 0.8967500843224705, 0.6787971755818832, 0.3767988059983658, 0.1947057927632303, 0.13381261417469814]

    # for i in xrange(len(xposition)):
    #     plt.axvline(x=xposition[i], ymin=yposition[i]-0.1, ymax=yposition[i]+0.1, color='k', linestyle='--')
    #     plt.axhline(y=yposition[i], color='k', linestyle='--')
    yvals = []
    for xc in xposition:
        yvals.append(GR_curve_fitting(xc, 0.323235, 0.323235, 1.076615))
        # plt.axvline(x=xc, color='k', linestyle='--')
    for yc in yvals:
         plt.axhline(y=yc, color='k', linestyle='--')
    print yvals
    # for yc in yposition:
    #     plt.axhline(y=yc, color='k', linestyle='--')

    plt.xscale('log')
    plt.xlabel('Concentration (uM)')
    plt.ylabel('GR value')
    plt.title(drug_name.title())

    output_folder = "../output/"

    out_filename = output_folder + "MCF10A_" + drug_name.lower() + "_GRcurve_poster"
    plt.savefig(out_filename)

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print "Usage: python plot_gr_curve.py <GR filename> <drug name>"
        sys.exit()
    main(sys.argv)