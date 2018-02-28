module.exports = function( add_actor, add_scene, get_date, request ){

  var increment = 1
  var sites = ["sexyhub"]
  var urls = [ "https://www.sexyhub.com/tour/videos/%d/" ]

  function scene_data( url, data ){
    request( url, function($){

      data.description = $('.overview').text().replace(/\s{2,}/g,'')
      data.tags = $('.tag-group').find('a').map(function(){
        return $(this).attr('title') }).get()
      add_scene( data )
    })
  }

  function actor_data( url, name ){
    request( url, function( $ ){
      var actor = {}

      actor.name = name
      var tags = $('.model-profile-tags').text().toLowerCase()

      if( tags.indexOf('pussy') > -1 )
        actor.gender = 'female'
      else if( tags.indexOf('dick') > -1 )
        actor.gender = 'male'
    
      add_actor( actor )
    })
  }

  return {
    urls: urls,
    sites: sites,
    increment: increment, 
    scrape: function( $, site ){
      $('.article-wrapper').each(function(){
        var data = {}

        var url = 'https://' + site + '.com' + $(this).find('.card-image').attr('href')
        data.paysite = site
        data.site  = $(this).find('.site-domain').text()
        data.image = 'http:' + $(this).find('.card-image').find('img').attr('src')
        data.title = $(this).find('.card-title').find('a').attr('title')
        data.date  = get_date( $(this).find('.release-date').text() )
        data.paysite_id = url.match(/video\/(\d+)/g)[0].replace('video/','')
        data.actors = $(this).find('.model-name').find('a').map(function(){
          actor_data( 'https://' + site + '.com' + $(this).attr('href'), $(this).text() )
          return $(this).text()
        }).get()
        
        scene_data( url, data ) 
      })
    }
  }
}
