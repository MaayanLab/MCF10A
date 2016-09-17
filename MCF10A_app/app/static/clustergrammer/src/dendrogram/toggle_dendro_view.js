var make_row_dendro_triangles = require('../dendrogram/make_row_dendro_triangles');
var make_col_dendro_triangles = require('../dendrogram/make_col_dendro_triangles');

module.exports = function toggle_dendro_view(cgm, row_col, wait_time = 1500){

  var params = cgm.params;

  // row and col are reversed
  if (row_col === 'row'){
    if (params.viz.inst_order.col === 'clust'){
      // the last true tells the viz that I'm chaning group size and not to
      // delay the change in dendro
      setTimeout( make_row_dendro_triangles, wait_time, cgm, true);
    }
  }

  if (row_col === 'col'){
    if (params.viz.inst_order.row === 'clust'){
      setTimeout( make_col_dendro_triangles, wait_time, cgm, true);
    }
  }

  if (params.viz.inst_order.row != 'clust' && params.viz.dendro_filter.col === false){
    d3.selectAll(params.root+' .col_dendro_group')
      .style('opacity',0)
      .on('mouseover',null)
      .on('mouseout',null);
  }

  if (params.viz.inst_order.col != 'clust' && params.viz.dendro_filter.row === false){
    d3.selectAll(params.root+' .row_dendro_group')
      .style('opacity',0)
      .on('mouseover',null)
      .on('mouseout',null);
  }
};