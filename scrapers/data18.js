module.exports = function( add_actor, add_scene, get_date, request ){

  var today = new Date();
  var date = get_date( today ).replace(/\-/g,"");
  var yest = get_date( today.setDate(today.getDate() - 1) ).replace(/\-/g,"");

  var urls = ["http://www.data18.com/content/date-"+date+".html",
              "http://www.data18.com/content/date-"+yest+".html",
              "http://www.data18.com/content/all.html/p=%d"];
  var increment = 1;
  var sites = ["data18_today","data18_yesterday","data18_page"];

  function get_scene_data( url, data ){
    request( url, function($){
      var info = $('#moviewrap').parent().children('div').last();

      data.description =info.find('.gen12').children('p').text().replace(/\s{2,}/g,'').trim().replace(/^\w+:/,'');
      data.tags = info.children('div').first().children('div').find('a').map(function(){
        return $(this).text();
      }).get()

      if( data.description == "" ){
        delete data.description;
      }

      add_scene( data );
    });
  }

  function get_actor_data( url, actor ){
    request( url, function($){
      var orientation = $('i:contains("Orientation:")').parent().find('a').map(function(){
        return $(this).text();
      }).get();
      var measurement = $('p:contains("Measurements:")').parent().find('p').last().text().split("-")[0];
       
      var cupsize = measurement.replace(/[\d\?]+/g,'')
      if( cupsize ){
        actor.cupSize = cupsize;
        actor.gender  = 'female';
      }

      add_actor( actor );
    });
  }

  return {
    urls: urls,
    sites: sites,
    increment: increment, 
    scrape: function( $, site ){
      $('.bscene.genmed').each(function(){
        var data = {};
        var url = $(this).children('div').first().find('a').attr('href');

        data.title  = $(this).children('p:nth-of-type(2)').text();
        data.site  = $(this).children('p:nth-of-type(3)').text().replace(/^\w+:\s/,'');
        data.paysite  = $(this).children('p:nth-of-type(4)').text();
        data.date  = get_date( $(this).find('p.genmed').first().text().replace(/#\d+/g,'') );
        var actors = $(this).children('p:nth-of-type(5)');

        if( data.paysite.indexOf("Cast: ") > -1 ){
          data.paysite = data.site;
          actors = $(this).children('p:nth-of-type(4)') ;
        }
        data.paysite = data.paysite.replace(/^\w+:\s/,'');
        data.actors = actors.find('a').map( function(){
          get_actor_data($(this).attr('href'),{name:$(this).text().trim()});
          return $(this).text().trim();
        }).get()
        data.data18_id = url.match(/\/(\d+)$/g)[0].replace('/','');

        get_scene_data( url, data );
      })
    }
  }
}
