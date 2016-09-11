"""
Parses GCT file for BRD/drug names and outputs the following files:
 - MCF10A_L1000_all_experiment_data.tsv
 - MCF10A_L1000_all_experiment_metadata.tsv
 - MCF10A_L1000_all_control_data.tsv
 - MCF10A_L1000_all_control_metadata.tsv
 - MCF10A_L1000_all_gene_metadata.tsv

Usage: python parse_gct_L1000.py <GCT file> <cell line name> <.grp file> <output folder>
Example: python parse_gct_L1000.py ../data/GSE70138_Broad_LINCS_Level3_INF_mlr12k_n115209x22268_2015-12-31.gct MCF10A ..\..\brd_drugname ../output/ > L1000_csv_filenames.txt
"""

import numpy as np
import pandas as pd
import csv
import sys
import re

def get_BRD_dict_from_file(BRD_filename):
    # create dictionary of BRD from BRD_filename
    # key: BRD, value: drug name
    BRD_fp = open(BRD_filename, "rb")
    all_BRD_dict = {}
    for line in BRD_fp:
        line = line.split("\t")
        all_BRD_dict[line[0]] = line[1].strip()

    return all_BRD_dict

def save_data_matrix(all_data, all_ids, gene_symbol, output_filename):
    with open(output_filename, 'wb') as csvfile:
        data_writer = csv.writer(csvfile,delimiter='\t')
        headers = ['id'] + all_ids
        data_writer.writerow(headers)
        for i in xrange(len(all_data)):
            row = []
            row.append(gene_symbol[i])
            for data in all_data[i]:
                row.append(float(data))
            data_writer.writerow(row)
            
    return output_filename

def save_sample_metadata(filename, all_CL_metadata, all_ids, headers):
    with open(filename, 'wb') as csvfile:
        metadata_writer = csv.writer(csvfile, delimiter='\t')
        metadata_writer.writerow(headers)       
        for id in all_ids:
            row = [id] + all_CL_metadata[id]
            metadata_writer.writerow(row)

    return filename

def save_genes_metadata(filename, gene_metadata, headers):
    with open(filename, 'wb') as csvfile:
        metadata_writer = csv.writer(csvfile, delimiter='\t')
        metadata_writer.writerow(headers) # write headers   
        for row in gene_metadata:
            metadata_writer.writerow(row)

    return filename

def main(args):
    gct_filename = args[1]
    cell_line = args[2]
    BRD_filename = args[3]
    DMSO_BRD = "dmso"

    output_folder = args[4]

    # output filenames
    experiment_data_filename = output_folder + cell_line + "_L1000_all_experiment_data.tsv"
    experiment_metadata_filename = output_folder + cell_line + "_L1000_all_experiment_metadata.tsv"
    control_data_filename = output_folder + cell_line + "_L1000_all_control_data.tsv"
    control_metadata_filename = output_folder + cell_line + "_L1000_all_control_metadata.tsv"
    gene_metadata_filename = output_folder + cell_line + "_L1000_all_gene_metadata.tsv"

    all_BRD_dict = get_BRD_dict_from_file(BRD_filename)

    gct_fp = open(gct_filename, "rb")
    gct_reader = csv.reader(gct_fp, delimiter='\t')

    gct_reader.next() # skip over version #1.3

    dim = gct_reader.next() # dimensions of data matrix
    dim_genes = int(dim[0])
    dim_samples = int(dim[1])
    row_annotations = int(dim[2])
    col_annotations = int(dim[3])

    headers = gct_reader.next() # row annotations
    col_headers = []
    col_headers.append(headers[0])

    # get relevant samples in cell line
    all_CLs = gct_reader.next() # 'cell_id'
    CL_indexes = [i for i,x in enumerate(all_CLs) if x == cell_line] # indexes of relevant samples in cell line
    CL_ids = [headers[i] for i in CL_indexes] # cell line ids in same order as CL_indexes

    all_CL_metadata = dict((id,[]) for id in CL_ids) # key is each sample's id
    # keep track of control ids/indexes separate from experiment ids/indexes
    control_ids = []
    control_indexes = []
    experiment_ids = list(CL_ids)
    experiment_indexes = list(CL_indexes) 

    while gct_reader.line_num < col_annotations + 3: # +3 for number of lines before in col_annotations
        line = gct_reader.next()
        cur_col_header = line[0]
        col_headers.append(cur_col_header)
        # iterate through each sample's metadata
        for i in xrange(row_annotations + 1, len(line)): # +1 for 'id' column
            if i in CL_indexes: # check if i is in the CL_indexes we are looking for
                # keep track of control ids and indexes and clean up 'SM_Name' field (name of drug) by 
                # matching BRD and providing sanitized "SM_Name"
                if cur_col_header == "SM_LINCS_ID":
                    cur_BRD = line[i]
                    if cur_BRD.lower() == DMSO_BRD: # check if control
                        # if it is control, then remove from experiment and add to control
                        experiment_ids.remove(headers[i])
                        experiment_indexes.remove(i)
                        control_ids.append(headers[i])
                        control_indexes.append(i)

                        # add sanitized "SM_LINCS_ID"
                        all_CL_metadata[headers[i]].append(cur_BRD)
                        # add "SM_Name" as "DMSO" for control
                        all_CL_metadata[headers[i]].append("DMSO")
                    else: # check if sample uses BRD in provided BRD_filename
                        match = re.search('(BRD-[A-Z]\d+)', cur_BRD)
                        cur_BRD = match.group(1)
                        if cur_BRD not in all_BRD_dict.keys():
                            experiment_ids.remove(headers[i])
                            experiment_indexes.remove(i)
                        else:
                            # add sanitized "SM_LINCS_ID"
                            all_CL_metadata[headers[i]].append(cur_BRD)
                            # add sanitized "SM_Name" given by provided BRD file
                            all_CL_metadata[headers[i]].append(all_BRD_dict[cur_BRD])
                    continue
                    
                # if this line isn't concerning "SM_LINCS_ID"
                all_CL_metadata[headers[i]].append(line[i])
        # if the line we've just parsed is for "SM_LINCS_ID", append the col_header "SM_Name" because we
        # have already added the sanitized name and skip the next line
        if cur_col_header == "SM_LINCS_ID":
            col_headers.append("SM_Name")
            gct_reader.next() 
            
    # retrieve all sample data
    gene_id = []
    gene_metadata = []
    row_headers = headers[0:row_annotations+1]
    all_experiment_data = []
    all_control_data = []

    for line in gct_reader:
        gene_id.append(line[0])
        gene_metadata.append(line[0:row_annotations+1])
        experiment_data = np.array(line)[experiment_indexes]
        control_data = np.array(line)[control_indexes]
        all_experiment_data.append(experiment_data)
        all_control_data.append(control_data)

    # experiment data and metadata
    print save_data_matrix(all_experiment_data, experiment_ids, gene_id, experiment_data_filename)
    print save_sample_metadata(experiment_metadata_filename, all_CL_metadata, experiment_ids, col_headers)

    # control data and metadata
    print save_data_matrix(all_control_data, control_ids, gene_id, control_data_filename)
    print save_sample_metadata(control_metadata_filename, all_CL_metadata, control_ids, col_headers)

    # genes metadata
    print save_genes_metadata(gene_metadata_filename, gene_metadata, headers[0:row_annotations+1])

if __name__ == "__main__":
    if len(sys.argv) != 5:
        print "Usage: python parse_gct_L1000.py <GCT file> <cell line name> <.grp file> <output folder>"
        sys.exit()
    
    main(sys.argv)