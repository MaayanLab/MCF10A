"""
Uploads characteristic direction signature to L1000CDS2 to retrieve shareId for perturbations

Usage: python upload_to_L1000CDS2.py <filenames>
Example: python upload_to_L1000CDS2.py L1000_chdir_up_down_filenames.txt > L1000CDS2_dict

"""
import sys
import requests
import json
import csv

def upperGenes(genes):
    # The app uses uppercase gene symbols. So it is crucial to perform upperGenes() step.
    return [gene.upper() for gene in genes]

def main(args):
    url = 'http://amp.pharm.mssm.edu/L1000CDS2/query'
    L1000CDS2_shareIds = {}

    with open(args[1], 'rb+') as f:
        for line in f:
            filename_up = line.strip()
            filename_down = f.next().strip()

            filename = filename_up[filename_up.rfind("\\"):].split("_")
            drug = filename[3]
            time = filename[4]
            dose = filename[5]

            up_genes = []
            with open(filename_up, 'rb') as tsvfile:
                csvreader = csv.reader(tsvfile, delimiter='\t')
                for row in csvreader:
                    up_genes.append(row[1])

            down_genes = []
            with open(filename_down, 'rb') as tsvfile:
                csvreader = csv.reader(tsvfile, delimiter='\t')
                for row in csvreader:
                    down_genes.append(row[1])

            data = {"upGenes": up_genes, "dnGenes": down_genes}
            data['upGenes'] = upperGenes(data['upGenes'])
            data['dnGenes'] = upperGenes(data['dnGenes'])

            config = {"aggravate":True,"searchMethod":"geneSet","share":True,"combination":True,"db-version":"latest"}
            metadata = [{"key":"Tag","value":"MCF10A Dense Cube"},{"key":"Cell","value":"MCF10A"}]
            payload = {"data":data, "config":config, "meta":metadata}
            headers = {'content-type':'application/json'}
            r = requests.post(url,data=json.dumps(payload),headers=headers)
            resGeneSet = r.json()
            shareId = resGeneSet['shareId']

            if drug not in L1000CDS2_shareIds:
                L1000CDS2_shareIds[drug] = {}
            if time not in L1000CDS2_shareIds[drug]:
                L1000CDS2_shareIds[drug][time] = {}
            L1000CDS2_shareIds[drug][time][dose] = str(shareId)

    print L1000CDS2_shareIds


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print "Usage: python get_up_down_regulated_genes.py <filenames>"
        sys.exit()
    main(sys.argv)