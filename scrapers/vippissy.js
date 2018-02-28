module.exports = function( add_actor, add_scene, get_date, request ){

  var urls = ["https://www.vipissy.com/updates/page-%d/"]
  var increment = 1
  var sites = ["vippissy"]

  function actor_data( url, actor){
    request( url, function($){
      var info = $('.sub_con').text()

      if( info.match(/Breasts:\s(\w+)/g) ){
        actor.gender = 'female'
        actor.cupSize = info.match(/Breasts:\s(\w+)/g)[0].replace("Breasts: ","")
      }
      add_actor( actor )
    })
  }

  return {
    urls: urls,
    sites: sites,
    increment: increment, 
    scrape: function( $, site ){
      $('.item').each(function(){
        var data = {}
        var url = $(this).children('.img').attr('href')

        data.paysite = site
        data.site = site
        data.image = $(this).children('.img').find('img').attr('src')
        data.title = $(this).find('.title').children('a').text()
        data.date  = get_date( $(this).find('.date').text() )
        data.paysite_id = data.date.replace("-","_")
        data.description = $(this).find('.desc').text().trim().replace("... Show more","")
        data.actors = $(this).find('.info').text().trim().replace(/\s+/g," ")
                          .match(/Starring:(.*)Tags:/)[0].replace("Starring: ","")
                          .replace(" Tags:","")
        data.tags = $(this).find('.info').find('a').map(function(){
          if( data.actors.indexOf( $(this).text() ) == -1 )
            return $(this).text()
          else
            actor_data( $(this).attr('href'), {name: $(this).text()} )
        }).get()
        data.actors = data.actors.split(" - ")

        add_scene( data )
      })
    }
  }
}
