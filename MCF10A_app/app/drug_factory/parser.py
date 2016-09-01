"""
Parses file for drug view. 
Returns Python dict formatted as such:
	{
		'drug': 'Trametinib',
		'kinase': '(MEK)',
		'BRD': BRD-K12343256,
		'description':
		'links': {
			'pubchem': 'https://pubchem.ncbi.nlm.nih.gov/compound/Trametinib',
			'lincs': 'http://lincsportal.ccs.miami.edu/entities/#/view/LSM-1143',
			'drugbank': 'http://www.drugbank.ca/drugs/DB08911b',
			'chembl': 'https://www.ebi.ac.uk/chembldb/index.php/compound/inspect/CHEMBL2103875'
		}
		'datatable':
			[
				[{'GR Metrics': }],
				[{'L1000', 'gr/raw/All-Centers_GRmetrics_060116.tsv', 'gr#grmetrics'}]
			]
	}
"""
import copy

def parse_drug_file(filename):
	all_tiles = []
	tile_dict = {}
	with open(filename, 'rb') as f:
		for line in f:
			if line.lower().strip() == "title":
				# finished adding tile text, add completed tile to list
				if len(tile_dict) > 0:
					all_tiles.append(copy.deepcopy(tile_dict))
					tile_dict = {} # new tile
				tile_dict["title"] = f.next().strip()

			if line.lower().strip() == "description":
				line = f.next().strip()
				description = ""
				# iterate through all lines of description
				while line != "data":
					description += line
					line = f.next().strip()
				tile_dict["description"] = description

			if line.lower().strip() == "data":
				if "data" not in tile_dict:
					tile_dict["data"] = []
				data = []
				# data formated in 5 lines, iterate through 5 line chunks
				for i in xrange(5):
					line = f.next()
					if i % 2 == 0:
						data.append(line.strip())
				tile_dict["data"].append(data)

	# add final tile to list
	if len(tile_dict) > 0:
					all_tiles.append(copy.deepcopy(tile_dict))
	return all_tiles