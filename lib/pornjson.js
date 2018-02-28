var unirest = require('unirest')
  , actor_manager = require( __dirname + '/actor.js' )

module.exports = {
  scrape: function(){
    unirest.get("https://steppschuh-json-porn-v1.p.mashape.com/actors/?actorname=A&count=500000&offset=0")
    .header("X-Mashape-Key", process.env.MASHUP )
    .header("Accept", "application/json")
    .end( function( result ){
      process_result( result.body )
    })
  }
}

function process_result( result ){
  if( result.statusCode != 200 ){
    console.log( result )
    process.exit()
  }

  for( var i=0;i<result.content.length;i++ ){
    var res_actor = result.content[i]
    if( res_actor.key.kind != "ActorEntry" )
      continue
    if( res_actor.name.split(" ").length <= 1 )
      continue  
 
    var actor = {}
    actor.name = res_actor.name
    if( res_actor.cupSize )
      actor.cupSize = res_actor.cupSize
    if( res_actor.country )
      actor.country = res_actor.country
    actor.aliases = []
    for( var j =0; j< res_actor.nickNames.length; j++)
      if( res_actor.nickNames[j].split(" ").length > 1 )
        actor.aliases.push( res_actor.nickNames[j] )

    if( res_actor.female == true )
      actor.gender = 'female'
    else
      actor.gender = 'male'
    actor_manager.check( actor )
  }
}

