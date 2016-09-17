
make_clust('ChEA_2015_' + window.drug + '_24h_combined_score.json', 'enrichr-clustergrammer', false);
make_clust('L1000_' + window.drug + '_3h_down.json', 'l1000-clustergrammer', false);
make_clust('P100_' + window.drug + '_3h.json', 'p100-3h', true);
make_clust('GCP_' + window.drug + '_24h.json', 'gcp-24h', false);

function make_clust(inst_network, divId, hasGeneInfo){
  if (divId == "l1000-clustergrammer" || divId == "enrichr-clustergrammer"){
    $("#" + divId + "-container").empty();
    $("#" + divId + "-container").append("<div id='" + divId + "-loading'>Loading Clustergrammer...</div>");
    $("#" + divId + "-container").append("<div id='" + divId + "'></div>");
  }

    d3.json('../static/clustergrammer/output/'+inst_network, function(network_data){

      // define arguments object
      var args = {
        root: '#' + divId,
        'network_data': network_data,
        'about':'Zoom, scroll, and click buttons to interact with the clustergram.',
        'row_tip_callback':gene_info,
        'order': 'alpha'
      };

      resize_container(args);

      d3.select(window).on('resize',function(){
        resize_container(args);
        cgm.resize_viz();
      });

      cgm = Clustergrammer(args);

      $(cgm.params.root + "-loading").remove();
  });

}

function resize_container(args){

  var screen_height = 650;
  var clustergrammer_width = $(args.root).width();

  d3.select(args.root)
    .style('width', clustergrammer_width+'px')
    .style('height', screen_height+'px');
}