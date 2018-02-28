module.exports = function( add_actor, add_scene, get_date, request ){

  var urls = ["https://www.kink.com/shoots/latest/page/%d"];
  var increment = 1;
  var sites = ["kink"];

  function get_scene_data( url, data ){
    request( url, function($){
      if( ! $('.column.shoot-logo').find('a').attr('href') ){
        return;
      }

      data.description = $('.description').text().trim()
        .replace(/Single Scene.*downloading\s+\n+/,'');
      data.tags = $('.tag-card-container').find('a').map(function(){
        return $(this).text();
      }).get();
      data.site  = $('.column.shoot-logo').find('a').attr('href').replace('/channel/','');

      add_scene( data );
    })
  }

  function get_actor_info( url, actor ){
    request( url, function($){
      var modeldata = $('.model-data').text().toLowerCase();
      if( $('.page-title').text().trim() == "" ){
        return;
      }

      actor.name = $('.page-title').text().trim();
      actor.gender = modeldata.match(/gender:\s+(\w+)/)[1];
      actor.ethnicity = modeldata.match(/ethnicity:\s+(\w+)/)[1];
      if( modeldata.match(/cup\ssize:\s+(\w+)/) ){
        actor.cupSize = modeldata.match(/cup\ssize:\s+(\w+)/)[1].toUpperCase();
      }

      add_actor( actor );
    })
  }

  return {
    urls: urls,
    sites: sites,
    increment: increment, 
    scrape: function( $, site ){
      $('.shoot').each(function(){
        var data = {};
        var info = $(this).find('.shoot-thumb-info');
        var url = 'https://kink.com' + info.find('.shoot-thumb-title').find('a').attr('href');

        data.paysite = "kink";
        data.image = $(this).find('.adimage.portrait-').attr('src');
        data.title = info.find('.shoot-thumb-title').find('div').text().trim();
        data.date  = get_date( info.find('.date').text() );
        data.paysite_id = url.match(/shoot\/(\d+)/g)[0].replace('shoot/','');
        data.actors = info.find('.shoot-thumb-models').find('a').map(function(){
          get_actor_info( 
            'https://kink.com' + $(this).attr('href'),
            { name: $(this).text() }
          );
          return $(this).text();
        }).get();

        get_scene_data( url, data );
      })
    }
  }
}
