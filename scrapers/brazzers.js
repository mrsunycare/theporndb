module.exports = function( add_actor, add_scene, get_date, request ){

  var urls = ["https://www.brazzers.com/videos/all-sites/all-pornstars/all-categories/alltime/bydate/%d/"];
  var increment = 1;
  var sites = ["brazzers"];

  function get_scene_data( url, data ){
    request( url, function($){
      data.description = $('#scene-description').find('p').text().replace(/\s{2,}/g,'')
                         .replace('Collapse','');
      data.tags = $('.tag-card-container').find('a').map(function(){
        return $(this).text();
      }).get();
      data.actors = $('.related-model').find('a').map(function(){
        get_actor_info( 'https://brazzers.com'+ $(this).attr('href'),
                        {name:$(this).text()} 
                      );
        return $(this).text();
      }).get();

      add_scene( data );
    });
  }

  function get_actor_info( url, actor ){
    request( url, function($){
      var info = $('.model-profile-specs');
      
      actor.name = info.find('h1').text().trim();
      if( info.find('[title="Ass Type"]').text().trim() ){
        actor.gender = 'female';
        actor.ethnicity = info.find('[title="ethnicity"]').text().trim().toLowerCase();
        actor.cupSize =info.find('label:contains("Measurements")').parent().children('var').text()
                           .split('-')[0].replace(/\d+/g,'');
      }
      else{
        actor.gender = 'male';
      }

      add_actor( actor );
    });
  }

  return {
    urls: urls,
    sites: sites,
    increment: increment, 
    scrape: function( $, site ){
      $('.release-card.scene').each(function(){
        var data = {};
        var info = $(this).find('.scene-card-info');
        var url = info.find('.scene-card-title').find('a').attr('href');

        data.paysite = 'brazzers';
        data.image = 'https:' + $(this).find('.card-image').find('a').find('img').last().attr('data-src');
        data.title = info.find('.scene-card-title').find('a').attr('title');
        data.date  = get_date( info.find('time').text() );
        data.site  = info.find('.collection.label-small').find('.label-text').text();
        data.site_short = info.find('.collection.label-small').find('.label-left-box').text();
        data.paysite_id = url.match(/\/(\d+)\//g)[0].replace(/\//g,'');

        get_scene_data( 'https://brazzers.com'+url, data );
      });
    }
  }
}
