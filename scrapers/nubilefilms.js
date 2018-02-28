module.exports = function( add_actor, add_scene, get_date, request ){

  var increment = 15
  var urls = ["http://nubilefilms.com/video/gallery/%d", "http://nfbusty.com/video/gallery/%d"]
  var sites = ["nubilefilms","nfbusty"]

  function get_data( url, data ){
    request( url, function($){
      data.description = $('.video-description').text().replace(/\s{2,}/g,'')
      data.tags = $('.tags.categories').find('a').map(function(){
        return $(this).text() }).get()

      add_scene( data )
    })
  }

  function get_actor_data( url, name ){
    request( url, function($){
      var actor = {}
      actor.name = name
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
        var baseUrl = "http://" + site + ".com"
        var url = baseUrl+ $(this).find('.title').attr('href')

        data.paysite = site
        data.site = site
        data.title  = $(this).find('.title').text()
        data.date  = get_date( $(this).find('.date').text() )
        data.actors = $(this).find('.models').find('a').map( function(){
          get_actor_data( baseUrl + $(this).attr('href'), $(this).text().trim() )
          return $(this).text().trim()
        }).get()
        data.paysite_id = url.match(/watch\/(\d+)/)[1]
        data.image = 'https:' + $(this).find('.img-responsive').attr('src')

        get_data( url, data )
      })
    }
  }
}
