module.exports = function( add_actor, add_scene, get_date, request ){

  var increment = 1
  var sites = ["twistys"]
  var urls = [ "https://www.twistys.com/tour/videos/" ]

  function scene_data( url, data ){
    request( url, function($){
      data.site = $('.site-name').find('a').text()
      data.tags = $('.tags-date').find('a').map(function(){
        return $(this).text()
      }).get()

      add_scene( data )
    })
  }

  function actor_data( url, name ){
    request( url, function( $ ){
      var actor = {}

      actor.name = name
      var info = $('.model-bio-container').text()
      
      if( info.match(/Ethnicity:\s+(\w+)/) ){
        actor.ethnicity = info.match(/Ethnicity:\s+(\w+)/)[1]
        if( actor.ethnicity == "Unknown" )
          delete actor.ethnicity
      }
      if( info.match(/Measurement:\s+(\w+)\scup/) ){ 
        actor.cupSize = info.match(/Measurement:\s+(\w+)\scup/)[1]
        if( actor.cupSize = "N/A" )
          delete actor.cupSize
      }
  
      add_actor( actor )
    })
  }

  return {
    urls: urls,
    sites: sites,
    increment: increment, 
    scrape: function( $, site ){
      $('.video-ui').each(function(){
        var data = {}

        var url = 'https://' + site + '.com' + $(this).find('.video-ui__link.thumbhover-link').attr('href')
        data.paysite = site
        data.image = 'http:' + $(this).find('.thumbhover-container').find('img').attr('src')
        data.title = $(this).find('.info-box-video-title').attr('title').replace('Watch ','')
        data.date  = get_date( $(this).find('.info-box-date').text() )
        data.paysite_id = url.match(/id\/(\d+)/g)[0].replace('id/','')
        data.actors = $(this).find('.info-box-models-name').find('a').map(function(){
          actor_data( 'https://' + site + '.com' + $(this).attr('href'), $(this).text() )
          return $(this).text()
        }).get()

        scene_data( url, data ) 
      })
    }
  }
}
