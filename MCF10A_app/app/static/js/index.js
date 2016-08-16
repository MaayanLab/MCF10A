//populate data table
$(document).ready(function() {
    $('.masonry-container').masonry({
                            gutter: 10,
                            columnWidth: '.grid-item',
                            itemSelector: '.grid-item'
                        });
    
    /*var selectedView = NaN;
    if (window.location.href.lastIndexOf("#") > 0){ // there is a selected view
        selectedView = window.location.href.substr(window.location.href.lastIndexOf("#")+1);
        var containerName = selectedView + "-masonry-container";
        console.log("containerName=" + containerName);
        console.log("selectedView=" + selectedView);
        $('.current').removeClass('current');
        $("#" + selectedView + "-nav").addClass('current');
        $('.active').removeClass('active');
        $('.' + containerName).parent().addClass('active');

        $('.' + containerName).masonry({
                            gutter: 10,
                            columnWidth: '.grid-item',
                            itemSelector: '.grid-item'
                        });
    } else {
        var containerName = $('.active').children().first().attr('class');
        $('.' + containerName).masonry({
                            gutter: 10,
                            columnWidth: '.grid-item',
                            itemSelector: '.grid-item'
                        });
    }


    $(".navigation").click(function(e){
        var href = $(this).attr('href');
        console.log("href=" + href);
        $('.current').removeClass('current');
        $(this).addClass('current');
        if (typeof(href) != 'undefined'){
            var containerName = href.substr(1) + "-masonry-container";
            $('.active').removeClass('active');
            $('.' + containerName).parent().addClass('active');
            // initiate masonry layout
            $('.masonry-container').masonry({
                            gutter: 10,
                            columnWidth: '.grid-item',
                            itemSelector: '.grid-item'
                        });
        }
        
    });*/
} );
