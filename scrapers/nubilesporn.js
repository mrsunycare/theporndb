module.exports = function( add_actor, add_scene, get_date, request ){

  var increment = 15
  var urls = ["http://nubiles-porn.com/video/gallery/%d"]
  var sites = ["nubilesporn"]
  var baseUrl = "http://nubiles-porn.com"

  function get_data( url, data ){
    request( url, function($){
      data.description = $('.video-description').children('article').find('p').first().text()
      data.tags = $('.tags.categories').find('a').map(function(){
        return $(this).text() }).get()

      add_scene( data )
    })
  }

  function get_actor_data( url, name ){
    request( url, function($){
      var actor = {name:name}
      var measurement = $('.model-profile-desc').text().trim().replace(/\s{2,}/g,'')
                        .match(/Figure\d+(\w+)\-/)
      if( measurement ){
        actor.cupSize = measurement[1]
        actor.gender  = 'female'
      }
   
      add_actor( actor )
    })
  }

  return {
    urls: urls,
    sites: sites,
    increment: increment, 
    scrape: function( $, site ){
      $('.videoset').each(function(){
        var data = {}
        var url = baseUrl+ $(this).find('.inner-wrapper').find('a').attr('href')

        data.paysite = "nubilesporn"
        data.site = $(this).find('.website').text()
        data.title  = $(this).find('.title').text().trim()
        data.date  = get_date( $(this).find('.date').text() )
        data.actors = $(this).find('.models').find('a').map( function(){
          get_actor_data( baseUrl + $(this).attr('href'), $(this).text().trim() )
          return $(this).text().trim()
        }).get()
        data.paysite_id = url.match(/watch\/(\d+)/)[1]
        data.image = baseUrl + $(this).find('.inner-wrapper').find('img').attr('src')

        get_data( url, data )
      })
    }
  }
}
