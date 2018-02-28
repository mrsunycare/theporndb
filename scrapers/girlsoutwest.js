module.exports = function( add_actor, add_scene, get_date, request ){

  var increment = 1;
  var sites = ["girlsoutwest"];
  var urls = ["https://tour.girlsoutwest.com/categories/movies/%d/latest/"];

  return {
    urls: urls,
    sites: sites,
    increment: increment, 
    scrape: function( $, site ){
      $('.latestScene').each(function(){
        var data = {};
        var url = 'https://' + site + '.com' + $(this).find('.latestScenePic').find('a').attr('href');

        data.site = site;
        data.paysite = site;
        data.title = $(this).find('.latestScenePic').find('a').attr('title');
        data.date  = get_date( $(this).find('span').text().match(/(\d{4}\-\d{2}\-\d{2})/)[1] );
        data.paysite_id = data.date;
        data.actors = $(this).find('p').children('a').map(function(){
          return $(this).text();
        }).get();

        add_scene( data );
      })
    }
  }
}
