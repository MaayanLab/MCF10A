#!/bin/bash

# run_L1000.sh data\GSE70138_Broad_LINCS_Level3_INF_mlr12k_n115209x22268_2015-12-31.gct MCF10A ..\brd_drugname output\



gct_filename="$1"
cell_line="$2"
brd_filename="$3"
output_folder="$4"
output_filename="L1000_csv_filenames.txt"
chdir_filenames="L1000_chdir_filenames.txt"
up_down_filenames="L1000_chdir_up_down_filenames.txt"

python parse_gct_L1000.py "$gct_filename" "$cell_line" "$brd_filename" > "$output_filename" 2>> ../error.log
python L1000_csv_to_chdir.py "$output_filename" "$chdir_filenames" "$output_folder" 2>> ../error.log
python get_up_down_regulated_genes.py "$chdir_filenames" '..\output\up-down-chdir\' > "$up_down_filenames" 2>> ../error.log
python upload_to_L1000CDS2.py "$up_down_filenames" > L1000CDS2_dict 2>> ../error.log


# python correlation_L1000.py > correlation_filenames.txt # this script uploads genes to Enrichr, then gets enriched terms from appropriate gene lists, performs correlation 
# python similarity_matrix.py correlation_filenames.txt # this script generates similarity matricies for Network2Canvas
# need to integrate with Network2Canvas somehow