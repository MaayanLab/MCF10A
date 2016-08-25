
/*
Example files
*/
make_clust('mult_view.json');
// make_clust('filter_row_sum.json');
// make_clust('mult_cats.json');
// make_clust('large_vect_post_example.json');
// make_clust('vect_post_example.json');
// make_clust('enr_clust_example.json');
// make_clust('default_example.json');
// make_clust('ccle.json');
// make_clust('updn_example.json');
// make_clust('narrow_example.json');
// make_clust('narrow_long_name.json');
// make_clust('bar_example.json');
// make_clust('kin_sub_example.json');
// make_clust('harmonogram_example.json');
// make_clust('sim_mat.json');

function make_clust(inst_network){

    d3.json('json/'+inst_network, function(network_data){

      // define arguments object
      var args = {
        root: '#p100-clustergrammer',
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

  var screen_height = window.innerHeight - 20;
  var clustergrammer_width = $(args.root).width();

  d3.select(args.root)
    .style('width', clustergrammer_width+'px')
    .style('height', screen_height+'px');
}
