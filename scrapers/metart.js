module.exports = function( add_actor, add_scene, get_date, request ){

  var increment = 1;
  var sites = ["sexart","vivthomas","thelifeerotic"];
  var urls = [ 
    "http://www.sexart.com/movies/latest/%d/",
    "http://www.vivthomas.com/movies/latest/%d/", 
    "http://www.thelifeerotic.com/movies/latest/%d/" 
  ];

  function scene_data( url, data ){ 
    request( url, function($){
      data.description = $('.custom-description-long').text().trim().replace(/^\w+:\s+/,'');

      add_scene( data );
    })
  }

  function actor_data( url, actor ){
    request( url, function($){
      var tags = $('.list-of-tags').text().toLowerCase();

      if( tags.indexOf('pussy') > -1 ){
        actor.gender = 'female';
      }else if( tags.indexOf('dick') > -1 ){
        actor.gender = 'male';
      }
      
      add_actor( actor );
    })
  }

  return {
    urls: urls,
    sites: sites,
    increment: increment, 
    scrape: function( $, site ){
      $('.custom-list-item-default').each(function(){
        var data = {};

        var url = $(this).find('.custom-img-container').find('img').parent().attr('href');
        data.paysite = "metartx";
        data.site  = site;
        data.image = $(this).find('.custom-img-container').find('img').attr('src');
        data.title = $(this).find('.custom-img-container').find('img').attr('alt');
        data.date  = get_date( $(this).find('.custom-list-item-date').text().replace(/Rated.*$/,'') );
        data.paysite_id = data.date.replace(/\-/g,'') + "_"+data.title.toLowerCase().replace(/[^a-z]+/g,'');
        data.actors = $(this).find('.custom-list-item-name-model').map(function(){
          actor_data( $(this).attr('href'), {name:$(this).text()} );
          return $(this).text();
        }).get();

        scene_data( url, data );
      })
    }
  }
}
