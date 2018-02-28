module.exports = function( add_actor, add_scene, get_date, request ){

  var urls = ["https://www.realitykings.com/tour/videos/all-sites/all-categories/all-time/recent/%d/"]
  var increment = 1
  var sites = ["realitykings"]
  var base='https://realitykings.com'

  function get_scene_data( url, data ){
    request( url, function($){
      data.description = $('#trailer-desc-txt').find('p').text().replace(/\s{2,}/g,'')
      data.image = $(".card-thumb__img").last().find('img').attr('src')
      data.actors = $('#trailer-desc-txt').find('h2 > a').map(function(){
        get_actor_info( base + $(this).attr('href') )
        return $(this).attr('title')
      }).get()

      add_scene( data )
    })
  }

  function get_actor_info( url ){
    request( url, function($){
      var info = $('.model-bio')
      var actor = {}
      
      actor.name = info.find('.model-bio__name').text().trim()
      if( info.find('.model-actions').text().trim().indexOf('Her') > -1 )
        actor.gender = 'female'
      else
        actor.gender = 'male'

      add_actor( actor )
    })
  }

  return {
    urls: urls,
    sites: sites,
    increment: increment, 
    scrape: function( $, site ){
      $('.card.card--release').each(function(){
        var data = {}
        var info = $(this).find('.card-info')
        var url = info.find('.card-info__title').find('a').attr('href')

        data.paysite = site
        data.title = info.find('.card-info__title').find('a').attr('title')
        data.date  = get_date( info.find('.card-info__meta-date').text() )
        data.site  = info.find('.card-info__meta').find('a').attr('title')
        data.paysite_id = url.match(/watch\/(\d+)/g)[0].replace('watch/','')

        // grab actors
        get_scene_data( base+url, data )
      })
    }
  }
}
