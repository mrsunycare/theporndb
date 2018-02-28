module.exports = function( add_actor, add_scene, get_date, request ){

  var increment = 1
  var sites = ["straplessdildo"]
  var urls = ["http://www.straplessdildo.com/tour/updates/page_%d.html"]

  function scene_data( url, data ){
    request( url, function($){

      data.description = $('p.hide-mobile').first().text().trim()
      data.tags = $('.video-info-left').find('.meta-list').first().find('a').map(function(){
        return $(this).text() }).get()
      data.date = get_date( $('.video-info-right').find('.hide-mobile').first().text() )

      add_scene( data )
    })
  }

  return {
    urls: urls,
    sites: sites,
    increment: increment, 
    scrape: function( $, site ){
      $('article').each(function(){
        var data = {}

        var url = $(this).find('.preview').find('h3').find('a').attr('href')
        data.paysite = "karbo"
        data.site  = site
        data.image = 'https://straplessdildo.com/' + $(this).find('.preview').find('img').attr('src')
        data.title = $(this).find('.preview').find('img').attr('alt')
        data.paysite_id = data.image.split("/")[4]
        data.actors = $(this).find('.meta-list').last().find('a').map(function(){
          return $(this).text()
        }).get()

        scene_data( url, data ) 
      })
    }
  }
}
