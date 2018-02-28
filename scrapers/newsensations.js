module.exports = function( add_actor, add_scene, get_date, request ){

  var increment = 15
  var urls = ["http://www.newsensations.com/tour_ns/category.php?id=5&page=%d&s=d"]
  var sites = ["newsensations"]
  var baseUrl = "http://newsensations.com/"

  function get_data( url, data ){
    request( url, function($){
      data.description = $('.update_description').text().trim()
      data.tags = $('.update_tags').find('a').map(function(){
        return $(this).text() }).get()
      data.title  = $('.update_title').text().trim()

      data.actors = $('.update_models').find('a').map(function(){
        get_actor_data( baseUrl + $(this).attr('href'), $(this).text() )
        return $(this).text() 
      }).get()

      add_scene( data )
    })
  }

  function get_actor_data( url, name ){
    request( url, function($){
      var actor = {name:name}
      var measurement = $('.model_bio').text().trim().replace(/\s{2,}/g,'')
                        .match(/Measurements:\d+(\w+)\-/)
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
      $('.update_details').each(function(){
        var data = {}
        var url = baseUrl+ $(this).find('a').first().attr('href')

        data.paysite = site
        data.site = site
        data.date  = get_date( $(this).find('.date_small').text() )
        data.paysite_id = url.match(/id=(\d+)/)[1]
        data.image = baseUrl + $(this).find('.stdimage').attr('src0_1x')

        get_data( url, data )
      })
    }
  }
}
