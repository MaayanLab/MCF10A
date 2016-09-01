var enrichment_libraries = ["ChEA_2015", "ENCODE_TF_ChIP-seq_2015", "KEGG_2016", "MGI_Mammalian_Phenotype_Level_4", "GO_Biological_Process_2015"];
function updateTerms(direction, library){

}
// setup trigger for when gene set library changes
var $librarySelector = $("#library-dropdown")
var prevLibrary = $librarySelector.val().replace(/\s+/g, '_');
$("#library-dropdown").change(function(){
  var newLibrary = this.value.replace(/\s+/g, '_');

  // update up/down genes terms
  updateTerms("up", newLibrary);
  updateTerms("down", newLibrary);

  // update Clustergrammer
  $("#" + prevLibrary).hide();
  $("#" + newLibrary).show();

  prevLibrary = newLibrary;

});

// drug dropdown changes, redirect to appropriate drug page
$("#drug-dropdown").change(function(){
  window.location = $(':selected',this).attr('href')
})
