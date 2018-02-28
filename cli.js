#!/usr/bin/env node

var MongoClient = require('mongodb').MongoClient
  , sprintf = require('sprintf-js').sprintf
  , cheerio = require('cheerio')
  , program = require('commander')
  , fs = require('fs')
  , actor_manager = require( __dirname + "/lib/actor.js" )
  , scene_manager = require( __dirname + "/lib/scene.js" )
  , request = require( __dirname + "/lib/request.js")
  , express = require('express')


var pages = 1
var start = 1
app = express()
winston = require('winston');
if(!String.prototype.trim) {  
  String.prototype.trim = function () {  
    return this.replace(/^\s+|\s+$/g,'');  
  };  
} 

program
  .option('--site <site>', 'Paysite/site name to parse')
  .option('--pages <pages>','Number of pages to parse',parseInt)
  .option('--start <start>','Page to start at',parseInt)
  .option('--url <url>', 'URL to parse, must be used with --site')
  .parse(process.argv)

if( program.url && (!program.site) ){
  console.log("Must specify site with url!")
  process.exit()
}
if( program.pages )
  pages = program.pages
if( program.start )
  start = program.start 

// list all scrapers
MongoClient.connect( process.env.MONGOURL, function(err, client){
  if( err ){
    console.log( err );
  }

  app.set('mongodb',client.db('theporndb'))
  fs.readdirSync(__dirname+'/scrapers').forEach( file=>{
    try{
      if( file.indexOf(".swp")>-1 )
        return
      var paysite = require( __dirname + '/scrapers/' + file )(actor_manager.check,
                                                              scene_manager.check,get_date, request)
      var increment = paysite.increment

      // loop through pages to scrape
      var spage = start
      var epage = start + increment * pages
      for( var j=0; j<paysite.urls.length; j++ ){
        for( var i=spage; i<=epage; i+= increment ){
          if( program.site ){
            if( program.site != paysite.sites[j] )
              continue
          }
          if( program.url ){
            console.log( 'scraping ' + sprintf(program.url,i) ) 
            scrape_page( sprintf(program.url,i), paysite, paysite.sites[j] )
          }
          else{
            console.log( 'scraping ' + sprintf(paysite.urls[j],i) )
            scrape_page( sprintf(paysite.urls[j],i), paysite, paysite.sites[j] )
          }
        }
      }

    }
    catch(e){
      console.log( e )
    }
  })
})

function scrape_page( url, paysite, site ){
  request( url, function( $ ){
    paysite.scrape( $, site )
  })
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
