"""
Parses file for drug view. 
Returns Python dict formatted as such:
	{
		'drug': 'Trametinib',
		'kinase': '(MEK)',
		'BRD': 'BRD-K12343256',
		'description': 'MEK Inhibitor Trametinib is an orally bioavailable inhibitor of mitogen-activated protein kinase kinase (MEK MAPK/ERK kinase) with potential antineoplastic activity. Trametinib specifically binds to and inhibits MEK 1 and 2, resulting in an inhibition of growth factor-mediated cell signaling and cellular proliferation in various cancers. MEK 1 and 2, dual specificity threonine/tyrosine kinases often upregulated in various cancer cell types, play a key role in the activation of the RAS/RAF/MEK/ERK signaling pathway that regulates cell growth.',
		'pubchem': 'https://pubchem.ncbi.nlm.nih.gov/compound/Trametinib',
		'lincs': 'http://lincsportal.ccs.miami.edu/entities/#/view/LSM-1143',
		'drugbank': 'http://www.drugbank.ca/drugs/DB08911b',
		'chembl': 'https://www.ebi.ac.uk/chembldb/index.php/compound/inspect/CHEMBL2103875',
		'assays': {
			'L1000': {
				'3h': [0.01, 0.12, 0.37, 1.11, 3.33, 10],
				'24h': [0.04, 0.12, 0.37, 1.11, 3.33, 10]
			},
			'P100': {
				'3h': [0.001, 0.003162, 0.01]
			},
			'GCP': {
				'24h': [0.001, 0.003162, 0.01]
			}
		}
	}
"""
import copy

def parse_drug_file(filename):
	drug_dict = {}
	with open(filename, 'rb') as f:
		for line in f:
			key = line.lower().strip()
			if key == 'assay': # remaining content in file is assays
				drug_dict['assays'] = {}
				for assay_line in f:
					assay = assay_line.strip()
					time = next(f).strip()
					all_concentrations = []
					for concentration in f:
						concentration = concentration.strip()
						if concentration != "Assay":
							all_concentrations.append(concentration)
						else:
							if assay not in drug_dict['assays']:
								drug_dict['assays'][assay] = {}
							drug_dict['assays'][assay][time] = all_concentrations
							break
			try:
				drug_dict[key] = next(f).strip()
			except StopIteration:
				break		

	return drug_dict

def drug_data_available(drug_dict):
	"""
	Takes a drug_dict and returns a dictionary with 
		keys as "time", "assay", and "concentration"
		values as lists for easy parsing when displaying the data available
	"""
	data_available = {'time': [], 'assay': [], 'concentration': []}
	temp_dict = {}
	for assay in drug_dict['assays']:
		for time in drug_dict['assays'][assay]:
			if time not in temp_dict:
				temp_dict[time] = {}
			temp_dict[time][assay] = drug_dict['assays'][assay][time]

	for time in temp_dict:
		num_assays = len(temp_dict[time].keys())			
		i = 0
		for assay in temp_dict[time]:
			if i == 0:
				data_available['time'].append([time, num_assays])
			else:
				data_available['time'].append(['',''])

			data_available['assay'].append(assay)
			data_available['concentration'].append(temp_dict[time][assay])
			i += 1

	return temp_dict, data_available

# drug_dict = parse_drug_file('../static/data/drugs/trametinib.txt')
# drug_data_available(drug_dict)