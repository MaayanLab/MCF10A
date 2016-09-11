#!/bin/bash
# run_grmetrics.sh data\All-Centers_GRmetrics_060116.tsv ..\brd_drugname output\

gr_filename="$1"
brd_filename="$2"
output_folder="output/"

while read -r line
do
    set -- $line
    name=${2%$'\r'}
    outfile=$(python scripts/gr_metrics.py "$gr_filename" "$name" "$output_folder" 2>> ../error.log)
done < "$brd_filename"
python scripts/gr_curve_datapoints.py "$gr_filename" "$output_folder"