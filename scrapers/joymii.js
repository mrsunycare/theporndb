module.exports = function( add_actor, add_scene, get_date, request ){

  var increment = 1;
  var sites = ["joymii"];
  var urls = ["https://joymii.com/site/videos?page=%d&tab=latest"];

  function scene_data( url, data ){
    request( url, function($){
      data.description = $('.text').text().trim();
      add_scene( data );
    })
  }

  return {
    urls: urls,
    sites: sites,
    increment: increment, 
    scrape: function( $, site ){
      $('.set.set-photo').each(function(){
        var data = {};

        var url = 'https://joymii.com'+$(this).children('a').attr('href');
        data.paysite = site;
        data.site  = site;
        data.image = $(this).children('a').find('img').attr('src');
        data.title = $(this).children('a').find('img').attr('alt');
        data.date  = get_date( $(this).find('.box-release_date.release_date').text() );
        data.paysite_id = url.match(/code\/(.*)/)[1];
        data.actors = $(this).find('.box-actors.actors').find('a').map(function(){
          add_actor({ name: $(this).text() });
          return $(this).text();
        }).get();

        scene_data( url, data );
      })
    }
  }
}
