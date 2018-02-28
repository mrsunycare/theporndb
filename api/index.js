const routes = require('express').Router()
  , scenes = require('./scenes')
  , actors = require('./actors');


routes.use('/scenes', scenes);
routes.use('/actors', actors);

routes.all('/',function(req,res){
  res.send('Version 1.0 ThePornDB API');
})

module.exports = routes;
