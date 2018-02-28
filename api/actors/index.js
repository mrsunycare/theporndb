const properties = ['name','gender','alias','cupSize','country',
                    'ethnicity','birthday','height'];
const routes = require('express').Router();

routes.all(['/','/find'], function(req,res){
  var query = req.body.query;
  var db = app.get('mongodb');

  // make sure we actually have a query to find
  if( ! query ){
    query = {};
    
    // check posted other params
    for( var i=0;i<properties.length;i++){
      if( req.body[ properties[i] ] ){
        query[ properties[i] ] = req.body[ properties[i] ];
      }
    }    
  }

  // check if query is empty
  if( Object.keys(query).length == 0 ){
    respond(res,undefined,[]);
    return;
  }

  // muster and send response
  db.collection('actors').find(query).toArray(function(err,result){
    respond(res,err,result);
  });
});

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


module.exports = routes;
