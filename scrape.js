var sprintf = require('sprintf-js').sprintf
  , fs = require('fs')
  , scene_manager = require( __dirname + "/lib/scene.js" )
  , actor_manager = require( __dirname + "/lib/actor.js" )
  , request = require( __dirname + "/lib/request.js" )

// useful trim shorthand script
if(!String.prototype.trim) {  
  String.prototype.trim = function () {  
    return this.replace(/^\s+|\s+$/g,'');  
  };  
} 

module.exports= {
  scrape: function(){
    winston.info("Started scraping process");

    // list all scrapers
    fs.readdirSync(__dirname+'/scrapers').forEach( file=>{
      try{
        if( file.indexOf(".swp")>-1 ){
          return;
        }

        // load in scraper
        var scraper = require(__dirname+'/scrapers/'+file)(
            actor_manager.check,    // function to add actors into db
            scene_manager.check,    // function to add scenes into db
            get_date,               // function to format date
            request                 // general request function to be used
        );
   
        // loop through urls from a given scraper to scrape
        for( var j=0; j<scraper.urls.length; j++ ){
          scrape_page( sprintf(scraper.urls[j],1), scraper, scraper.sites[j] );
        }

      }
      catch(e){
        console.log( e );
      }
    })
  }
}

function scrape_page( url, scraper, site ){
  request( url, function( $ ){
    scraper.scrape( $, site );
  });
}

function get_date(date){
  var d = new Date(date),
      month = '' + (d.getUTCMonth() + 1),
      day = '' + d.getUTCDate(),
      year = d.getUTCFullYear();
  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return [year, month, day].join('-');
}
