'''
The clustergrammer python module can be installed using pip:
pip install clustergrammer

or by getting the code from the repo:
https://github.com/MaayanLab/clustergrammer-py
'''
import os
from clustergrammer import Network


for filename in os.listdir("tsv"):
    name = filename.split(".")[0]
    net = Network()
    # load matrix tsv file
    print name
    net.load_file('tsv/' + name + '.tsv')

    # optional filtering and normalization
    ##########################################
    net.swap_nan_for_zero()

    net.make_clust(dist_type='cos',views=['N_row_sum', 'N_row_var'] , dendro=True,
                   sim_mat=True, filter_sim=0.1, calc_cat_pval=False)

    # write jsons for front-end visualizations
    net.write_json_to_file('viz', 'output/' + name + '.json', 'indent')
