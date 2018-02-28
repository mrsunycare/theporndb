module.exports = function( add_actor, add_scene, get_date, request ){

  var urls = ["https://www.babes.com/tour/videos/all-sites/all/all/alltime/all/%d/"];
  var increment = 1;
  var sites = ["babesnetwork"];

  return {
    urls: urls,
    sites: sites,
    increment: increment, 
    scrape: function( $, site ){
      $('.scene').each(function(){
        var data = {};

        data.paysite = site;
        data.title = $(this).find('.scene-title').attr('title');
        data.date  = get_date( $(this).find('.release-date').text() );
        data.site  = $(this).find('.release-site').text().trim();
        data.paysite_id = $(this).find('.scene-title').attr('href').match(/id\/(\d+)/)[1];
        data.actors = $(this).find('.model-names').find('a').map(function(){
          return $(this).text();
        }).get();

        add_scene( data );
      })
    }
  }
}
