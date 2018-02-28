module.exports = function( add_actor, add_scene, get_date, request ){

  var urls = ["https://www.girlsway.com/en/videos//updates/0/Pornstar/%d/0"];
  var increment = 1;
  var sites = ["girlsway"];

  function get_scene_data( url, data ){
    request( url, function($){
      data.description = $('.sceneDesc.bioToRight.showMore').text().replace(/\s{2,}/g,'')
                         .replace('Scene Description:','');
      data.tags = $('.sceneCol.sceneColCategories').find('a').map(function(){
        return $(this).attr('title');
      }).get();
      data.actors = $('.sceneCol.sceneColActors').find('a').map(function(){
        return $(this).attr('title');
      }).get();
      
      add_scene( data );
    })
  }

  return {
    urls: urls,
    sites: sites,
    increment: increment, 
    scrape: function( $, site ){
      $('.tlcItem').each(function(){
        var data = {};
        var info = $(this).find('.tlcDetails');
        var url = info.find('.tlcTitle').find('a').attr('href');

        data.paysite = site;
        data.image = $(this).children('a').find('img').attr('data-original');
        data.title = info.find('.tlcTitle').find('a').attr('title');
        data.date  = get_date( info.find('.tlcSpecsDate').find('.tlcDetailsValue').text() );
        data.site  = info.find('.tlcSourceSite').text().trim();

        // grab paysite defined id and an actual unique id
        data.paysite_id = url.match(/\/(\d+)$/g)[0].replace('/','');
        get_scene_data( 'http://' + site + '.com' + url, data );
      })
    }
  }
}
