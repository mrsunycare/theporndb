var genderize = require('genderize')

// properties of an actor that we care about
// any other property we dont care.
var props = [ 
  'name','gender','alias','cupSize','country',
  'ethnicity','birthday','height'
]

module.exports = {

  check: function(test_actor){

    // in the case an actor is given without a gender, use genderize
    // to take guess at it
    guess_gender( test_actor, function(actor){

      // perform checks to make sure scene fits API spec
      if( ! check_actor_field(actor) ){
        return;
      }
 
      // search in both names and aliases to see if the given
      // actor exists in the database
      var mongo = app.get('mongodb');
      mongo.collection('actors').find({
        $or: [ { name: actor.name }, { aliases: actor.name } ]
      }).toArray( function(err, result){
        if( err ){
          winston.error( err ); 
          return; 
        }

        // loop through all possible matches and perform a comparison
        // to see which fields should be updated
        for( var i=0; i< result.length; i++ ){
          if( result[i].name = actor.name ){
            return perform_comparison( actor, result[i] );
          }
          if( result[i].aliases.indexOf(actor.name) > -1 ){
            return perform_comparison( actor, result[i] );
          }
        }

        // if no actor present in database, compare against empty object
        return perform_comparison( actor, {} );
      })
    })
  },

  check_aliases: function( actors, scene_unique_id ){
    // given a list of actors, return the 'supername',
    // in this way, actors are put into the scenes object using 
    // their primary name and not using their alias
    // primary assumption is that actors do not have overlapping
    // aliases.

    var mongo = app.get('mongodb');
    mongo.collection('actors').find({
      aliases:{$in:actors}
    }).toArray( function(err, results){
      var new_actors = [];
      var cases=0;    

      for( var j=0;j<actors.length;j++ ){
        var actor_name = actors[j];
        var found = false;

        for( var i=0;i<results.length;i++ ){
          var actor = results[i];
          if( ! actor.aliases ){
            continue;
          }

          if( actor.aliases.indexOf(actor_name) > -1 ){
            found = true;
            new_actors.push( actor.name );
          }
        }

        // if the actor is not in the database, ignore the update
        if( ! found ){
          new_actors.push( actor_name );
          cases = cases + 1;
        }
      }

      // if there are no names to change, dont bother
      if( cases == actors.length ){
        return;
      }

      // update scene with non-alias named list
      mongo.collection('scenes').update({ unique_id: scene_unique_id},
      { $set: { actors: new_actors } },
      function(err){
        if( err ){ 
          winston.error('Error updating actors in scene:' + scene_unique_id + " " +
                        JSON.stringify(new_actors,null,2) );
        }
      });
    });
  }
}

function guess_gender( actor, callback ){
  // guess gender of actor if the gender is not
  // specified using the first name only
  // must return with atleast 95% confidence

  if( actor.gender || ! actor.name ){
    return callback( actor );
  }
  genderize( actor.name.split(" ")[0], function(err, obj){
    if( obj.probability ){
      if( obj.probability > 0.95 ){
        actor.gender = obj.gender;
      }
    }
    return callback( actor );
  });
}

function perform_comparison( actor, db_actor ){
  // calculate and determine what needs to be updated
  var update_actor = {};

  for( var i=0; i< props.length; i++ ){
    var property = props[i];

    if( db_actor[property] && actor[property] ){
      if( db_actor[property] instanceof Array ){
        update_actor[property] = unique( actor[property].concat(db_actor[property]) );
        if( update_actor[property].length == 0 ){
          delete update_actor[property];
        }
      }
    }
    else if( actor[property] ){
      update_actor[property] = actor[property];
    }
  }

   // make sure there is an update to be performed
  if( Object.keys( update_actor ).length == 0 ){
    return;
  }
  if( db_actor.name ){
    update_actor.name = db_actor.name;
  }

  var mongo = app.get('mongodb');
  mongo.collection('actors').update({ name: update_actor.name },
    {$set:update_actor}, {upsert: true},
  function(err){
    if( err ){
      winston.error(err); 
      return; 
    }
    console.log( "Updated " + update_actor.name );
  })
}


function check_actor_field( actor ){
  // makes sure that the passed scene conforms
  // to the correct actor spec in API
  
  // check to required fields
  if( ! actor.name || ! actor.gender ){
    return false;
  }  

  // check optional fields
  for( var i=0; i< props.length; i ++ ){
    if( actor[props[i]] ){
      if( typeof actor[props[i]] !== 'string' || ! actor[props[i]] instanceof String ){
        return false;
      }
    }
  }

  // check array fields and make sure
  // that they are composed of strings
  if( actor.aliases ){
    if( ! actor.aliases instanceof Array ){
      return false;
    }
    for( var i=0; i< actor.aliases.length; i++ ){
      if( ! actor.aliases[i] instanceof String ){
        return false;
      }
    }
  }

  return true;
}

function count(a,val){
  var count = 0;
  for( var i=0;i<a.length;i++){
    if( a[i] == val ) count++;
  }
  return count
}
function unique( a ){
  var v=[]
  for( var i=0;i<a.length;i++){
    if( count(a,a[i]) == 1 ) v.push(a[i])
  }
  return v
}
