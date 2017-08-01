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
    if (name.split("_")[0] == "CycIF"):
        df_data = net.export_df()
        cols = df_data.columns.tolist()
        new_cols = []
        for inst_col in cols:
            inst_dose = 'dose: ' + inst_col.split('_')[1]
            inst_comp = 'compartment: ' + inst_col.split('_')[3] 
            inst_col = (inst_col.split('_', 1)[1], inst_dose, inst_comp)
            new_cols.append(inst_col)
    
        df_data.columns = new_cols
        net.load_df(df_data)

    # if (name.split("_")[0] == "P100"):
    #     df_data = net.export_df()
    #     cols = df_data.columns.tolist()
    #     new_cols = []
    #     for inst_col in cols:
    #         inst_dose = 'dose (uM): ' + inst_col.split('_')[0]
    #         inst_time = 'time (hr): ' + inst_col.split('_')[1] 
    #         inst_col = (inst_col, inst_dose, inst_time)
    #         new_cols.append(inst_col)
    
    #     df_data.columns = new_cols
    #     net.load_df(df_data)

    #optional filtering and normalization
    #########################################
        net.swap_nan_for_zero()

        net.make_clust(dist_type='cos',views=['N_row_sum', 'N_row_var'] , dendro=True,
                   sim_mat=True, filter_sim=0.1, calc_cat_pval=False)

    # write jsons for front-end visualizations
        net.write_json_to_file('viz', 'output/' + name + '.json', 'indent')
