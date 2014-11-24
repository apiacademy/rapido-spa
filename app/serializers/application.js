import DS from "ember-data";

export default DS.JSONSerializer.extend({

normalize: function(type, hash) {
	console.log('normalize called');
	console.log(type);
	console.log(hash);

	var key;

	hash.id = hash._id;
	for( key in hash ) {
		if( key === 'created' ) {
			hash.creationDate = hash.created;
		}
	}

	console.log(hash);
	return hash;
},


	/*extract: function(store, type, payload, id, requestType) {
    	console.log('extract');
    	console.log(payload);
    	console.log(type);
  	},*/
  	extractArray: function(store, primaryType, rawPayload) {  		
      console.log('serializer:extractArray');      

  		var primaryArray = [];
      var i, payload, key;

      if( primaryType.typeKey === 'resource') {
        for( i = 0; i < rawPayload.length; i++ ) {
          payload = rawPayload[i];
          var resource = {};
          for( key in payload ) {
            if( key === '_id') { 
              resource.id = payload._id;
            }
            else {
              resource[key] = payload[key];
            }
          }          
          primaryArray.push(resource);  
        }        
      }
      else if( primaryType.typeKey === 'project' ) {
console.log('serializing project');
        for( i = 0; i < rawPayload.length; i++ ) {
          payload = rawPayload[i];
          var project = {};
          for( key in payload ) {
            if( key === '_id') {
              project.id = payload._id;
            }
            else {
              project[key] = payload[key];
            }
          }           
          primaryArray.push(project);                  
        }  			
  		}
  		
      console.log(primaryArray);
  		return primaryArray;
  	},
  	keyForAttribute: function(attr) {
  		console.log(attr);
  	}
});
