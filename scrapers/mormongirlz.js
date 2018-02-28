module.exports = function( add_actor, add_scene, get_date, request ){

  var increment = 1
  var urls = ["http://mormongirlz.com/videos/%d/"]
  var sites = ["mormongirlz"]

  function get_data( url, data ){
    request( url, function($){
      data.description = $('.h-contant').parent().find('div').text().trim().replace(/\s{2,}/g,'')
                        .replace(/^[^"]+"/,'')
      var thumb = $('.ngg-gallery-thumbnail').find('a').first().find('img')
      data.paysite_id = thumb.attr('title') + "_" + thumb.attr('src').match(/gallery\/([^\/]+)/)[1]

      add_scene( data )
    })
  }

  return {
    urls: urls,
    sites: sites,
    increment: increment, 
    scrape: function( $, site ){
      var baseUrl = "http://" + site + ".com"
      $('.mormon-updates').each(function(){
        return; // mormon girlz has removed dates from their website
        var data = {}
        var url = $(this).find('.mormon-update-title').attr('href')

        data.paysite = site
        data.site = site
        data.title  = $(this).find('.mormon-update-title').text()
        data.date  = get_date( $(this).find('.mormon-update-title').parent().parent().find('h5').text() )
        data.image = $(this).find('.mormon-big-picture').find('img').attr('src')

        get_data( url, data )
      })
    }
  }
}
