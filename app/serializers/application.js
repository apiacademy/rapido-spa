import DS from "ember-data";

export default DS.JSONSerializer.extend({

normalize: function(type, hash) {
	console.log('normalize called');

	var key;

	hash.id = hash._id;
	for( key in hash ) {
		if( key === 'created' ) {
			hash.creationDate = hash.created;
		} else if( key === 'class' ) {
            hash.classString = hash.class;
        }
	}

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

    for( i = 0; i < rawPayload.length; i++ ) {
        payload = rawPayload[i];
        var resource = {};
        for( key in payload ) {
            if( key === '_id') { 
                resource.id = payload._id;
            }else {
                resource[key] = payload[key];
            }
        }          
        primaryArray.push(resource);  
    }
   
	return primaryArray;
}
});
