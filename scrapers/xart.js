module.exports = function( add_actor, add_scene, get_date, request ){

  var urls = ["https://www.x-art.com/videos/"]
  var increment = 1
  var sites = ["xart"]

  return {
    urls: urls,
    sites: sites,
    increment: increment, 
    scrape: function( $, site ){
      $('#allvideos').children('li').each(function(){
        var data = {}
        var url = $(this).children('a').attr('href')

        data.paysite = site
        data.site = site
        data.image = $(this).find('img').attr('src')
        data.title = $(this).find('img').attr('alt')
        data.date  = get_date( $(this).find('h2').text() )
        data.paysite_id = data.title.replace(/\s/g,"")+"__"+data.date.replace(/\-/g,"_")

        add_scene( data )
      })
    }
  }
}
