var MongoClient = require('mongodb').MongoClient
  , express = require('express')
  , bodyParser = require('body-parser')
  , schedule = require('node-schedule')
  , rarbg = require('rarbg')
  , RateLimit = require('express-rate-limit')
  , compression = require('compression')
  , api = require('./api')
  , logzioWinstonTransport = require('winston-logzio')

// define winston logger
winston = require('winston');
winston.add(logzioWinstonTransport,{token: process.env.LOGZIO});
winston.remove(winston.transports.Console);

// setting up routes and stuff
rarbg = new rarbg();
app = express();
app.use( bodyParser.json() );
app.use( bodyParser.urlencoded({ extended: true }) );
app.use( compression() );
app.use('/api',api);

// define api limits
// 1000 requests allowed within 15 minute interval
app.enable('trust proxy');
var apiLimiter = new RateLimit({
  windowsMs: 15*60*1000,
  max: 1000,
  delayMs: 0
});
app.use(apiLimiter);

// schedule scraper
// scrape websites every 8 hours and scrape json-porn api
// every week for actor information
if( process.env.SCRAPE ){
  var scraper  = require(__dirname+'/scrape.js');
  var pornjson = require(__dirname+'/lib/pornjson.js');
  var scene_manager = require( __dirname + "/lib/scene.js" );
  schedule.scheduleJob('45 */8 * * *',() => {scene_manager.duplicate_check()}); 
  schedule.scheduleJob('5 */8 * * *', () => { scraper.scrape() } );
  schedule.scheduleJob('5 12 * * 1', () => { pornjson.scrape() } );
}

MongoClient.connect( process.env.MONGOURL, function(err, client){
  if (err ){ winston.error(err); return; }
  
  var db = client.db('theporndb');
  app.set('mongodb',db);

  // redict to github pages for info on usage of this api
  app.all('/', function(req,res){
    res.redirect('https://mrsunycare.github.io/theporndb/');
  });

  // in testing, some simple rarbg search provider
  app.all('/rarbg', function(req,res){
    
    var search = req.body.search;
    if( ! search ){
      res.send('Error, no query');
    }

    rarbg.search({
        search_string:search,
        sort:'seeders',
        category:rarbg.categories.XXX,
        min_seeders: 10
      }).then( data=> res.send( JSON.stringify(data) ) )
    .catch( function(e){
      res.send( JSON.stringify([]) );
    });
  });
 
  winston.log('info','server started') 
  app.listen( process.env.PORT || 8080 );
}) 
