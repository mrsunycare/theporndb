module.exports = function( add_actor, add_scene, get_date, request ){

  var increment = 1;
  var sites = ["blacked","tushy","vixen"];
  var urls = [ "https://www.blacked.com/videos/?page=%d",
               "https://www.tushy.com/videos/?page=%d",
               "https://www.vixen.com/videos/?page=%d"];
  return {
    urls: urls,
    sites: sites,
    increment: increment, 
    scrape: function( $, site ){
      $('.videolist-panel-item').each(function(){
        var data = {};

        var url = 'https://' + site + '.com' + $(this).children('a').attr('href');
        data.paysite = site;
        data.site = site;
        data.image = $(this).find('.panel--large-item').find('img').attr('src');
        data.title = $(this).children('a').attr('title');
        data.date  = get_date( $(this).find('.videolist-panel-caption-video-info-data').first().text()  );
        data.paysite_id = data.image.match(/TRIPPLE\/(\d+)/g)[0].replace("TRIPPLE/","");
        data.actors = $(this).find('.videolist-panel-caption-text').find('a').map(function(){
          return $(this).text();
        }).get();

        add_scene( data );
      })
    }
  }
}
