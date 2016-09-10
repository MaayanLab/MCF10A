'''
Takes file with all GR metrics and parses based on drug name.
Outputs file with GR metrics for provided drug in ../output/MCF10A_<drugName>_GRmetrics.tsv

Usage: python gr_metrics.py <GRmetrics filename> <drug name> <output folder>
Example: python gr_metrics.py ../data/All-Centers_GRmetrics_060116.tsv Alpelisib ../output/
'''

import sys
import pandas as pd

def main(args):
    # retrieve GR metrics filename, drug name from sys.argv
    GRmetrics_filename = args[1]
    drug_name = args[2].lower()

    df  = pd.read_csv(GRmetrics_filename, sep="\t")
    df_drug = df.loc[df["agent"].str.lower() == drug_name]

    output_folder = args[3]
    out_filename = output_folder + "MCF10A_" + str(drug_name) + "_GRmetrics" + ".tsv"
    df_drug.to_csv(out_filename, sep='\t', encoding='utf-8', index=False)

    print out_filename

if __name__ == "__main__":
    if len(sys.argv) != 4:
        print "Usage: python gr_metrics.py <GRmetrics filename> <drug name> <output folder>"
        sys.exit()
    main(sys.argv)