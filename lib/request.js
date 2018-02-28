var cheerio = require('cheerio')
var request = require('sync-request')
  , options = {
    headers: {
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:58.0) Gecko/20100101 Firefox/58.0',
      'accept-language': 'en-US,en;q=0.5',
      'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'accept-encoding': 'gzip, deflate, br',
    }
  }

// the point of this module is provid synchronous requests to 
// with defined user agents to make it appear as a 'real' 
// website scraper
module.exports = function(url, callback){
  var res = request('GET', url, options);
  if( res.statusCode >= 300 ){
    winston.error('Unable to scrape: ' + url );
    return;
  }
  callback( cheerio.load(res.getBody('utf8')) );
}
