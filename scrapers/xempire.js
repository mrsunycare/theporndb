module.exports = function( add_actor, add_scene, get_date, request ){

  var increment = 1
  var sites = ["hardx","eroticax","darkx","lesbianx"]
  var urls = [
    "https://www.hardx.com/en/videos/AllCategories/0/%d",
    "https://www.eroticax.com/en/videos/AllCategories/0/%d",
    "https://www.darkx.com/en/videos/AllCategories/0/%d",
    "https://www.lesbianx.com/en/videos/AllCategories/0/%d"
  ]

  function scene_data( url, data ){
    request( url, function($){
      data.description = $('.sceneDesc.bioToRight.showMore').text().replace(/\s{2,}/g,'')
                         .replace(/^\w+\s+Description:/,'')
      data.tags = $('.sceneCol.sceneColCategories').find('a').map(function(){
        return $(this).attr('title') }).get()

      add_scene( data )
    })
  }

  return {
    urls: urls,
    sites: sites,
    increment: increment, 
    scrape: function( $, site ){
      $('.sceneContainer').each(function(){
        var data = {}
        
        var url = 'https://' + site + '.com' + $(this).find('.imgLink.tnoScene').attr('href')
        data.paysite = "xempire"
        data.site  = site
        data.image = $(this).find('.imgLink.tnoScene').children('img').attr('data-original')
        data.title = $(this).find('.sceneTitle').find('a').attr('title')
        data.date  = get_date( $(this).find('.sceneDate').text() )
        data.paysite_id = url.match(/\/(\d+)$/g)[0].replace('/','')
        data.actors = $(this).find('.sceneActors').find('a').map(function(){
          return $(this).attr('title')
        }).get()
        
        scene_data( url, data ) 
      })
    }
  }
}
