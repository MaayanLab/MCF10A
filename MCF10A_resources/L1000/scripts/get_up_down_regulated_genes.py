'''
Takes list of files that previously calculated characteristic direction and outputs files with up/down regulated genes.
Note: Only includes genes (gene ids) that have gene symbols and are unique 

Usage: python get_up_down_regulated_genes.py <.txt with filenames> <output folder>
Example: python get_up_down_regulated_genes.py L1000_chdir_filenames.txt ..\output\up-down-chdir\ > L1000_chdir_up_down_filenames.txt
'''

# add path where chdir.py is located
import sys
import pandas as pd
import numpy as np

def main(args):
    # input filenames
    f = open(args[1], 'rb+')
    output_folder = args[2]

    for line in f.readlines():
        filename = line.strip()

        df = pd.read_csv(filename, index_col=0, sep="\t")

        col_name = list(df.columns.values)[1]

        # sort largest to smallest
        sorted_df = df.sort_values(col_name, ascending=False)

        # convert dataframe to list
        sorted_genes = []
        gene_symbol = []
        for i, r in sorted_df.iterrows(): # i == gene_id, r == (gene_symbol, chdir) tuple
            # sorted_genes.append([i, r[0], r[1]])

            # only include genes that have gene symbols and unique
            if r[0].strip() != "-666" and r[0].strip() not in gene_symbol:
                sorted_genes.append([i, r[0].strip(), r[1]])
                gene_symbol.append(r[0].strip())

        # outfile name
        orig_filename = filename[filename.rfind('/')+1:]
        out_filename = output_folder + orig_filename[:orig_filename.rfind(".")]
        
        # write up regulated genes (top 250) to file
        out_filename_up_regulated = out_filename + "_up_regulated.tsv"
        fp = open(out_filename_up_regulated, 'wb+')
        up_regulated = sorted_genes[:250]
        for gene in up_regulated:
            fp.write(str(gene[0]) + '\t' + str(gene[1]) + '\t' + str(gene[2]) + "\n")
        fp.close()
        print out_filename_up_regulated
        
        # write down regulated genes (bottom 250) to file
        out_filename_down_regulated = out_filename + "_down_regulated.tsv"
        fp = open(out_filename_down_regulated, 'wb+')
        down_regulated = sorted_genes[-250:]
        for gene in down_regulated:
            fp.write(str(gene[0]) + '\t' + str(gene[1]) + '\t' + str(gene[2]) + "\n")
        fp.close()
        print out_filename_down_regulated


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print "Usage: python get_up_down_regulated_genes.py <.txt with filenames> <output folder>"
        sys.exit()
    
    main(sys.argv)