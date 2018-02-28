const properties = ['paysite','site','title','date','data18_id',
                    'paysite_id','date','site_short','type','tags',
                    'actors'];
const routes = require('express').Router();

routes.all('/latest',get_latest);
routes.all(['/','/find'], function(req,res){
  var query = req.body.query;
  var db = app.get('mongodb');

  // make sure we actually have a query to find
  if( ! query ){
    query = {};

    // parse other post options
    for( var i=0; i<properties.length; i++ ){
      if( req.body[ properties[i] ] ){
        query[ properties[i] ] = req.body[ properties[i] ];
      }
    }
  }

  // check if query is empty
  if( Object.keys(query).length == 0 ){
    get_latest(req,res);
    return;
  }


  // muster and send response
  db.collection('scenes').find(query).toArray(function(err,result){
    respond(res,err,result);
  });
});


// function to handle returning the lates scenes 
// from within the last week (7 days previous today)
function get_latest(req,res){
  var db = app.get('mongodb');
  var today = new Date();
  var date  = get_date(today.setDate( today.getDate() - 7 ));

  db.collection('scenes').find({date:{'$gte':date}}).sort({date:-1}).toArray(function(err,result){
    respond(res,err,result);
  });
}

// general response function
function respond(res,err,result){
  res.setHeader('Content-Type', 'application/json');
  if( err ){
    res.send( JSON.stringify([err]) );
  }
  else{
    res.send( JSON.stringify(result) );
  }
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

module.exports = routes;
