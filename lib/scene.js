var actor_manager = require( __dirname + '/actor.js' )
var props = [ 
  'paysite','site','title','date',
  'paysite_id','data18_id', 'image','site_short',
  'description','type', 'tags', 'actors']

module.exports = {

  duplicate_check: function(){duplicate_check();},

  check: function(scene){
    // perform checks to make sure scene fits API spec
    if( ! check_scene_field(scene) ){
      if( scene.description ){
        delete scene.description;
      }

      winston.warn('Unable to update scene, did not pass spec test' +
                   JSON.stringify(scene,null,2) );
      return;
    }

    // generate a unique_id, easier said than done 
    get_unique_id( scene, function( scene, db_scene){
      // here we need to calculate updates and determine
      // what needs to be set in the database and what
      // should be changed
      var update_scene = {};
      for( var i=0; i< props.length; i++ ){
        var property = props[i];
        if( db_scene[property] && scene[property] ){
          if( db_scene[property] instanceof Array ){
            update_scene[property] = unique(scene[property].concat(db_scene[property]));
            if( update_scene[property].length == 0 ){
              delete update_scene[property];
            }
          }
          continue;
        }
        else if( scene[property] ){ 
          update_scene[property] = scene[property];
        }
      }

      // make sure there is an update to apply
      if( Object.keys( update_scene ).length == 0 ){
        return;
      }

      // pass over unique_id
      update_scene.unique_id = (db_scene.unique_id)? db_scene.unique_id : scene.unique_id;

      // upsert into database
      var mongo = app.get('mongodb');
      mongo.collection('scenes').update({ unique_id: update_scene.unique_id},
        {$set:update_scene},
        {upsert:true},
      function(err){
        if( err ){ 
          winston.error(err); 
          return;
        }
        console.log( "Added/Updated scene " + update_scene.unique_id );
        
        // properly update actor information in the event of 
        // aliases
        if( update_scene.actors ){
          actor_manager.check_aliases( update_scene.actors, update_scene.unique_id );
        }
      });
    });
  }
}

function get_unique_id( scene, found ){
    var mongo = app.get('mongodb');

    // first guess is trivial guess that the given
    // id (paysite or data18) is part of the unique_id
    scene.unique_id = [
      scene.paysite, 
      scene.site, 
      (scene.data18_id)? scene.data18_id: scene.paysite_id
    ].join("_");

    mongo.collection('scenes').find({ unique_id: scene.unique_id }).toArray( function(err, results){
      if( err ){ 
        winston.error( err ); 
        return;
      }

      for( var i=0; i< results.length; i++ ){
        found( scene, results[i] );
        return;
      }
      
      // if we have reached here, likely scene 
      // does not exist in database, or other id (which we dont have)
      // serves as basis for unique id. this is a gamble, 
      // we are going to assume UNIQUE(site,date)
      mongo.collection('scenes').find({ site: scene.site, date: scene.date }).
      toArray( function(err, results){
        if( err ){ 
          winston.error( err ); 
          return 
        }
        
        // if there are too many results, then we 
        // shall compare based on title, otherwise scene
        // does not exist
        if( results.length == 1){
          found( scene, results[0] );
          return;
        }
        for( var i=0; i< results.length; i++ ){
          if( results[i].title == scene.title  ){
            found( scene, results[i] );
            return;
          }
        }

        found( scene, {} );
      });
    });
}


function check_scene_field( scene ){
  // makes sure that the passed scene conforms
  // to the correct scene spec in API
  
  // check to required fields
  if( (! scene.paysite) || ( typeof scene.paysite !== 'string' || ! scene.paysite instanceof String)  ){
    return false;
  }
  if( (! scene.site) || ( typeof scene.site !== 'string' || ! scene.site instanceof String) ){
    return false;
  }
  if( (! scene.title) || ( typeof scene.title !== 'string' || ! scene.title instanceof String) ){
    return false;
  }
  if( ! scene.date  ){
    return false;
  }
  if( ! scene.date.match(/^\d{4}\-\d{2}\-\d{2}$/) ){
    return false;
  }
  
  // check optional fields
  if( scene.image ){
    if( typeof scene.image !== 'string' || ! scene.image instanceof String ){
      return false;
    }
  }
  if( scene.site_short ){
    if( typeof scene.site_short !== 'string' || ! scene.site_short instanceof String ){
      return false;
    }
  }
  if( scene.description ){
    if( typeof scene.description !== 'string' || ! scene.description instanceof String ){
      return false;
    }
  }
  if( scene.type ){
    if( typeof scene.type !== 'string' || ! scene.type instanceof String ){
      return false;
    }
  }

  // check array fields
  if( scene.actors ){
    if( ! scene.actors instanceof Array ){
      return false;
    }
    for( var i=0; i< scene.actors.length; i++ ){
      if( ! scene.actors[i] instanceof String ){
        scene.actors[i] = scene.actors[i].trim();
        return false;
      }
    }
  }
  if( scene.tags ){
    if( ! scene.tags instanceof Array ){
      return false;
    }
    for( var i=0; i< scene.tags.length; i++ ){
      if( ! scene.tags[i] instanceof String ){
        return false;
      }
    }
  }

  // make sure that either data18 or paysite
  // id is present
  var id = (scene.data18_id)? scene.data18_id: scene.paysite_id;
  if( ! id instanceof String ){
    return false;
  }
  if( ! id ){
    return false;
  }
  if( id.indexOf(" ") > -1 ){
    return false;
  }

  // clean up site and paysite information
  scene.paysite = scene.paysite.replace(/[^A-Za-z0-9]+/g,'').toLowerCase();
  scene.site = scene.site.replace(/[^A-Za-z0-9]+/g,'').toLowerCase();

  // make sure site and paysite are defined after cleaning up
  if( (! scene.paysite) || ( typeof scene.paysite !== 'string' || ! scene.paysite instanceof String)  ){
    return false;
  }
  if( (! scene.site) || ( typeof scene.site !== 'string' || ! scene.site instanceof String) ){
    return false;
  }

  return true;
}

function duplicate_check(){
  // check for duplicate scenes. This sometimes happens when data18 has
  // the wrong date upon posting and later updates with the correct date.
  
  var mongo = app.get('mongodb');
  mongo.collection('scenes').aggregate([
    { 
      $group: { 
        _id:{title:"$title",date:"$date",site:"$site"} ,
        count : { $sum: 1 }
      }
    },
    { $match: {count:{$gt:1}} }
  ]).toArray( function(err, results){
    for( var i=0; i<results.length;i++){
      find_dupes( results[i]._id );
    }
  });
}
function find_dupes(query){
  var mongo = app.get('mongodb');
  mongo.collection('scenes').find(query).sort({paysite_id:-1}).toArray( function(e,res){
    var scene = {};
    for( var i=0; i<res.length; i++ ){
      rscene = res[i];

      if( i != 0 ){
        if( rscene.data18_id ){
          scene.data18_id = rscene.data18_id;
        }
        mongo.collection('scenes').deleteOne(rscene);
      }
      else{
        scene = rscene;
      }
    }
    update_dupe_scene( scene );
  });
}
function update_dupe_scene( scene ){
  var mongo = app.get('mongodb');
  mongo.collection('scenes').update(
    {_id:scene._id},
    {$set:{ data18_id: scene.data18_id }}
  );
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
