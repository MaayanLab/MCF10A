"""
Parses file for mosaic tile description. 
Returns list of Python dict formatted as such:
	{
		'title': 'GR',
		'description': 'metrics based on estimating <span class="emphasis">growth rate inhibition (GR)</span> in the presence of a drug (relative to an untreated control) using endpoint or time-course assays',
		'data':
			[
				['Cell Counts', 'gr/raw/All-Centers_cellcounts_060216.tsv', 'gr#cellcounts'],
				['GR Metrics', 'gr/raw/All-Centers_GRmetrics_060116.tsv', 'gr#grmetrics']
			]
	}
"""
import copy

def get_tile_list(filename):
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