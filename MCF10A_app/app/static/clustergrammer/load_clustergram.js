
/*
Example files
*/

make_clust('mult_view.json', 'ChEA_2015');
make_clust('mult_view.json', 'l1000-24h');
make_clust('mult_view.json', 'p100-3h');
make_clust('mult_view.json', 'gcp-24h');

function make_clust(inst_network, divId){

    d3.json('../static/clustergrammer/json/'+inst_network, function(network_data){
      console.log("network_Data=" + network_data);

      // define arguments object
      var args = {
        root: '#' + divId,
        'network_data': network_data,
        //'about':'Zoom, scroll, and click buttons to interact with the clustergram.',
        'row_tip_callback':gene_info, //interacts with Harmonizome to retrieve gene info
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
