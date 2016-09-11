'''
Takes filtered TSV files (regarding control data/metadata, experiment data/metadata, and gene metadata) from parsing GCT file and performs characteristic direction method to determine differential expression of genes
 
Usage: python L1000_csv_to_chdir.py <.txt with filenames> <output filename> <output folder>
Example: python L1000_csv_to_chdir.py L1000_csv_filenames.txt L1000_chdir_filenames.txt ../output/
'''

# add path where chdir.py is located
import sys
sys.path.append('chdir')
from chdir import chdir
import pandas as pd
import numpy as np

def save_chdir(drug, drug_dataframe, gene_identifiers, gene_lookup_dict, exp_data_df, exp_metadata_df, control_data_df, control_metadata_df, output_folder):
    all_out_filenames = []
    time_vals = set(drug_dataframe['SM_Time'])
    for time in time_vals:
        time_dataframe = drug_dataframe.loc[(drug_dataframe["SM_Time"] == time)]
        dose_vals = set(time_dataframe['SM_Dose'])
        dose_vals = np.sort(np.array(list(dose_vals)), axis=None)
        # clustergrammer_df = pd.DataFrame()
        
        for dose in dose_vals:
            dose_dataframe = time_dataframe.loc[(time_dataframe["SM_Dose"] == dose)]
            ref_id = list(dose_dataframe['id'])
            plates = list(dose_dataframe['det_plate'])
            expMat = []
            for r in ref_id:
                expMat.append(list(exp_data_df[r]))
                
            control_id = []
            for p in plates:
                control_id = list(control_metadata_df.loc[(control_metadata_df['det_plate'] == p)]["id"])
            ctrlMat = [] 
            for c in control_id:
                ctrlMat.append(list(control_data_df[c]))

            ctrlMat = np.array(ctrlMat).T
            expMat = np.array(expMat).T

            chdirVector = chdir(ctrlMat, expMat, gene_identifiers)
            chdir_genes = chdirVector[0]

            # output matrix for each drug at a specific time, specific dose
            out_filename = output_folder + "MCF10A_L1000_chdir_" + str(drug) + "_" + str(time) + str(drug_dataframe["SM_Time_Unit"].iloc[0]) + "_" + str(dose) + "_um.tsv"
            df = pd.DataFrame(index=chdir_genes)


            gene_symbols = []
            for gene_id in chdir_genes:
                gene_symbols.append(gene_lookup_dict[gene_id])

            df["gene_symbol"] = gene_symbols
            df[dose] = chdirVector[1]

            # temp_clustergrammer_df = pd.DataFrame(index=chdir_genes)
            # temp_clustergrammer_df[dose] = chdirVector[1]

            # clustergrammer_df = pd.concat([clustergrammer_df, temp_clustergrammer_df], axis=1)
            
            # if clustergrammer_df.empty: # first dose to add to df
            #     clustergrammer_df = pd.DataFrame(index=chdir_genes)
            #     clustergrammer_df["gene_symbol"] = gene_symbols
            #     clustergrammer_df[dose] = chdirVector[1]
            #     print "dose: ", dose, "len: ", len(chdirVector[1])
            # else:
            #     print "dose: ", dose, "len: ", len(chdirVector[1])
            #     clustergrammer_df[dose] = chdirVector[1]
            
            df.to_csv(out_filename, sep='\t', encoding='utf-8')
            all_out_filenames.append(out_filename)

        # output matrix for each drug at a specific time for inputting into clustergrammer
        # output_folder = "output-testing-clustergrammer/"
        # out_filename = output_folder + "MCF10A_L1000_chdir_" + str(drug) + "_" + str(time) + str(drug_dataframe["SM_Time_Unit"].iloc[0]) + ".tsv"
        # clustergrammer_df.to_csv(out_filename, sep='\t', encoding='utf-8')
        # all_out_filenames.append(out_filename)

    return all_out_filenames


def main(args):
    # input filenames
    f = open(args[1], 'rb+')
    sample_data_filename = f.readline().strip()
    sample_metadata_filename = f.readline().strip()
    control_data_filename = f.readline().strip()
    control_metadata_filename = f.readline().strip()
    gene_metadata_filename = f.readline().strip()
    f.close()

    # get list of genes
    gene_df = pd.read_csv(gene_metadata_filename, sep="\t")
    gene_identifiers = list(gene_df['id'])
    gene_symbols = list(gene_df['pr_gene_symbol'])

    gene_lookup_dict = {}
    for i in xrange(len(gene_identifiers)):
        gene_id = gene_identifiers[i]
        gene_lookup_dict[gene_id] = gene_symbols[i]

    # format experiment matrix
    exp_metadata_df = pd.read_csv(sample_metadata_filename, sep="\t")
    exp_data_df = pd.read_csv(sample_data_filename, sep="\t")

    # format control matrix
    control_metadata_df = pd.read_csv(control_metadata_filename, sep="\t")
    control_data_df = pd.read_csv(control_data_filename, sep="\t")

    drug_agents = set(exp_metadata_df['SM_Name'])
    all_out_filenames = []
    output_folder = args[3]
    for drug in drug_agents:
        drug_dataframe = exp_metadata_df.loc[(exp_metadata_df["SM_Name"] == drug)]
        # clean up drug name
        if drug == "BYL719":
            drug = "alpelisib"

        out_filename = save_chdir(drug, drug_dataframe, gene_identifiers, gene_lookup_dict,
                            exp_data_df, exp_metadata_df, control_data_df, control_metadata_df, output_folder)

        all_out_filenames += out_filename

    f = open(args[2], 'wb+')
    f.write('\n'.join(all_out_filenames))
    f.close()


if __name__ == "__main__":
    if len(sys.argv) != 4:
        print "Usage: python L1000_csv_to_chdir.py <.txt with filenames> <output filename> <output folder>"
        sys.exit()
    
    main(sys.argv)