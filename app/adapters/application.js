import DS from "ember-data";

var host = 'http://localhost:8081';

/**
 * Creates objects on the server
 * @token {string} ???
 * @url {string} full resource path
 */
function createObject(token, url, data, callback) {
console.log('createObject called');
console.log(data);
console.log(JSON.stringify(data));
    
    var createAJAX = $.ajax({
        url: url,
        type: 'POST',                    
        contentType : 'application/json',
        data: JSON.stringify(data),
        beforeSend: function( request ) {
            var bearerAuthString = 'Bearer ' + token;
            request.setRequestHeader("Authorization", bearerAuthString);
        }
    });
                
    createAJAX.done( function( response, textStatus, jqXHR ) {                    
        // On success, create a new model instance and return it
        callback(null, response);
    });
    
    createAJAX.fail( function( response, textStatus, jqXHR ) {
        callback(textStatus);
    });
}

/**
 * Retrieves objects from the server
 * @token {string} ???
 * @url {string} full resource path
 * @dataparser {function} parser for the returned object
 * @return {Promise} promise
 */
function getObjects(token, url, dataParser, callback) {
    var getAJAX = $.ajax({
        url: url,
        type: 'GET',                    
        beforeSend: function( request ) {
            //var bearerAuthString = 'Bearer ' + token;                    
            //request.setRequestHeader("Authorization", bearerAuthString);
        }
    });
                
    getAJAX.done( function( data, textStatus, jqXHR ) {                            
        if(!dataParser) {        	
        	callback(null,data);
        }else {
        	dataParser(data).then(function(parsedData) {
	            callback(null, parsedData);
	        }, function(error) {
	            callback(error);
	        });
        }        
    });
    
    getAJAX.fail( function( data, textStatus, jqXHR ) {
        //console.log('fail');
        callback(textStatus, null);
    });
}

/* The custom Ember-Data Adapter.
 * Connects with my custom backend.
 */
export default DS.Adapter.extend({	
	find: function(store, type, id, record) {		
		console.log(store);
		console.log(type);
		console.log(id);
		console.log(record);
		return {};
  	},
	findAll: function(store, type, sinceToken) {
		//console.log(type.typeKey);
		//console.log(sinceToken);

		var url = '';
		if( type.typeKey === 'project' ) {
			url = host + '/projects';
		}

		var token = '';
		var dataParser = null;

		return new Promise(function(resolve,reject) {
			getObjects(token, url, dataParser, function(error, result) {
				if( error === null ) { resolve(result); } 
				else { reject(error); }
			});
		});
		
	},
	findQuery: function(store, type, query) {		
		var url = host;

		if( type.typeKey === 'resource') {
			var projectId = query.project;
			url = url + '/projects/' + projectId + '/resources';
		} else {
			console.error('unknown record type');
		}

		var token = '';
		var dataParser = null;

		return new Promise(function(resolve,reject) {
			getObjects(token, url, dataParser, function(error, result) {
				if( error === null ) { resolve(result); } 
				else { reject(error); }
			});
		});
	},
	createRecord: function(store, type, record) {
		console.log('create');

		var url = host;

		if( type.typeKey === 'project' ) {
console.log(localStorage.token);
			var token = localStorage.token;
			var project = {		        
		        	name: record.get('name'),
		        	description: record.get('description'),
		        	hostname: '',
		        	contentType: record.get('contentType'),
				projectType: record.get('projectType')
	    		};
	    		console.log(project);
			url = url + '/projects';
			console.log('calling ' + url);
return new Promise(function(resolve,reject) {
			createObject(token, url, project, function(error, response) {
				if( error === null ) { resolve(response[0]); } 
				else { reject(error); }
			});
		});

		} else if( type.typeKey === 'resource' ) {			
		}
	},
	updateRecord: function(store, type, record) {
		console.log('update');
		console.log(store);
		console.log(type);
		console.log(record);
	},
	deleteRecord: function(store, type, record) {
		console.log('delete');
		console.log(store);
		console.log(type);
		console.log(record);
	}
});
