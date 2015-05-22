import DS from "ember-data";
import ENV from "../config/environment";

var host = ENV.backend;
var url;
var record;

/** 
 * Authentication tokens are automatically injected by the Simple Auth module.
 * See app/authorizers/rapido.js
 */


/**
 * Creates objects on the server
 * @token {string} ???
 * @url {string} full resource path
 */
function createObject(token, url, data, callback) {
    var createAJAX = $.ajax({
        url: url,
        type: 'POST',                    
        contentType : 'application/json',
        data: JSON.stringify(data)
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
 * @url {string} full resource path
 * @return {Promise} promise
 */

function getObjects(url, callback) {
    var getAJAX = $.ajax({
        url: url,
        type: 'GET'
    });
                
    getAJAX.done( function( data, textStatus, jqXHR ) {                            
        	callback(null,data);
    });
    
    getAJAX.fail( function( data, textStatus, jqXHR ) {
        callback(textStatus, null);
    });
    

}

/**
 * Updates an object on the server
 * @token {string} ???
 * @url {string} full resource path
 */
function updateObject(token, url, data, callback) {
    var createAJAX = $.ajax({
        url: url,
        type: 'PUT',                    
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
 * Deletes objects from the server
 * @token {string} ???
 * @url {string} full resource path
 *
 * @return {Promise} promise
 */

function deleteObject(token, url, callback) {    
    var getAJAX = $.ajax({
        url: url,
        type: 'DELETE',                    
        beforeSend: function( request ) {
            var bearerAuthString = 'Bearer ' + token;                    
            request.setRequestHeader("Authorization", bearerAuthString);
        }
    });
                
    getAJAX.done( function( data, textStatus, jqXHR ) {                                 
        callback(null);
    });
    
    getAJAX.fail( function( data, textStatus, jqXHR ) {
        console.log('fail');
        callback(textStatus);
    });
}


/* The custom Ember-Data Adapter.
 * Connects with my custom backend.
 */
export default DS.Adapter.extend({	
    find: function(store, type, id ) {
		url = host;
        console.log('find');
        console.log(type);
        return new Promise(function(resolve,reject) {
            if( type.typeKey === 'project' ) {
                url = url + '/projects/' + id;
            }else if( type.typeKey === 'sketch' ) { 
                url = url + '/sketches/' + id;
            }else if( type.typeKey === 'alps' ){
                url = url + '/alps/' + id;
            }else {
				reject('find is not supported for record type ' + type);
			}

            getObjects(url, function(error, result) {
				if( !error  ) { 
                    resolve(result); 
                } else { 
                    reject(error); 
                }
			});
        });
    },
	findAll: function(store, type, sinceToken) {
		url = host;
        console.log('findAll');
	
		return new Promise(function(resolve,reject) {
			if( type.typeKey === 'project' ) {
				url = url + '/projects';
			}else if( type.typeKey === 'alp' ) {
                url = url + '/alps';
            }else {
				reject('findAll is not supported for this record type.');
			}

			getObjects(url, function(error, result) {
				if( error === null ) { resolve(result); } 
				else { reject(error); }
			});
		});
		
	},
	findQuery: function(store, type, query) {		
		url = host;

        if( type.typeKey === 'project') {
			var projectId = query.project;
            url = url + '/projects/' + projectId;
        } else if( type.typeKey === 'sketch' ) {
			var projectId = query.project;
            url = url + '/projects/' + projectId + '/sketches';
        } else if( type.typeKey === 'alp') {
			var projectId = query.project;
			url = url + '/alps?projectId='+projectId;
        } else if( type.typeKey === 'resource') {
			var projectId = query.project;
			url = url + '/projects/' + projectId + '/resources';
		} else if ( type.typeKey === 'hypernode' ) {
			var sketchId = query.sketch;
			url = url + '/sketches/' + sketchId + '/hypernodes';
		} else if ( type.typeKey === 'map' ) { 
            console.log('looking for maps');
            var projectId = query.project;
            url = url + '/projects/' + projectId + '/maps';
        } else {
			console.error('findQuery is not supported for this record type.');
		}


		return new Promise(function(resolve,reject) {
			getObjects(url, function(error, result) {
				if( error === null ) { resolve(result); } 
				else { reject(error); }
			});
		});
	},
	createRecord: function(store, type, record) {
		var token = localStorage.token;
		url = host;
		//TODO: Check if token is valid, reject if it is not there.

		var _record;

		return new Promise(function(resolve,reject) {

			if( type.typeKey === 'project' ) {
					_record = {		        
						name: record.get('name'),
						description: record.get('description'),
						hostname: record.get('hostname'),
						contentType: record.get('contentType'),
						projectType: record.get('projectType'),
                        templates: record.get('templates'),
					};
					url = url + '/projects';
			} else if( type.typeKey === 'alp' ) {
                    console.log(record.get('source'));
                    _record = {
                        alps: {
                            name: record.get('name'),
                            description: record.get('description'),
                            contentType: record.get('contentType'),
                            source: record.get('source'),
                        }
                    };
                url = url + '/alps';
			} else if( type.typeKey === 'resource' ) {			
				var projectId = record.get('project');
				if( !record.get('project') ) { reject('A parent project identifier property must be present on records of type \'resource\''); }
				_record  = {
					resource:  {
						name: record.get('name'),
						description: record.get('description'),
						responses: record.get('responses'),
						url: record.get('url'),
						children: record.get('children'),
						parent: record.get('parent'),
						methods: record.get('methods'),
                        class: record.get('class')
					}
				};
                console.log(_record);
				url = url + '/projects/' + projectId + '/resources';
			} else if( type.typeKey === 'state' ) {
                var projectId = record.get('project');
				if( !record.get('project') ) { reject('A parent project identifier property must be present on records of type \'state\''); }
                _record = {
                    state: {
                        name: record.get('name'),
                        description: record.get('description'),
                        responses: record.get('responses'),
                        transitions: record.get('transitions')
                    }
                };
                url = url + '/projects/' + projectId + '/states';
            } else if ( type.typeKey === 'map' ) {
                var projectId = record.get('project');
				if( !record.get('project') ) { reject('A parent project identifier property must be present on records of type \'map\''); }
                _record = {
                    map :  {
                        name: record.get('name'),
                        description: record.get('description'),
                        steps: record.get('steps')
                    }
                };
                url = url + '/projects/' + projectId + '/maps';
            } else {
				reject('unknown record type');
			}

			createObject(token, url, _record, function(error, response) {
				if( !error ) { resolve(response[0]); }
				else { reject(error); }
			});
		});

	},
	updateRecord: function(store, type, record) {
		var token = localStorage.token;
		url = host;
		var _record;

		return new Promise(function(resolve,reject) {
            if( type.typeKey === 'project' ) {
                console.log(record);
                // merge the ALPS and simple vocabularies into a single list of words
                var wordList = [];
                _record = {
                    simpleVocabulary: record.get('simpleVocabulary')
                }
                url = url + '/projects/' + record.get('id');
            } else if( type.typeKey === 'resource' ) {
				var projectId = record.get('project');
				if( !projectId ) { reject('A parent project identifier property must be present for records of type \'resource\''); }
				_record  = {
					resource:  {
						name: record.get('name'),
						description: record.get('description'),
						responses: record.get('responses'),
						url: record.get('url'),
						children: record.get('children'),
						parent: record.get('parent'),
						methods: record.get('methods'),
                        class: record.get('class')
					}
				};
				url = url + '/projects/' + projectId + '/resources/' + record.get('id');
				
			} else if( type.typeKey === 'state' ) {
                var projectId = record.get('project');
				if( !projectId ) { reject('A parent project identifier property must be present for records of type \'state\''); }
                _record = {
                    state: {
						name: record.get('name'),
						description: record.get('description'),
						responses: record.get('responses'),
                        transitions: record.get('transitions'),
                        x: record.get('x'),
                        y: record.get('y')
                    }
                };

                url = url + '/projects/' + projectId + '/states/' + record.get('id');
            } else if( type.typeKey === 'map' ) {
				if( !record.get('project') ) { reject('A parent project identifier property must be present on records of type \'map\''); }
                var projectId = record.get('project');
                var mapId = record.get('id');
                _record = {
                    map :  {
                        name: record.get('name'),
                        description: record.get('description'),
                        steps: record.get('steps')
                    }
                };
                url = url + '/projects/' + projectId + '/maps/' + mapId;
            } else {
				reject('this record type cannot be updated.');
			}

            console.log(url);
			updateObject(token ,url, _record, function(error, response) {
				if( !error ) { resolve(response[0]); }
				else { reject(error); }
			});
		});
	},
	deleteRecord: function(store, type, record) {
		var token = localStorage.token;
		url = host;

		return new Promise(function(resolve,reject) {
			if( type.typeKey === 'project' ) {
				url = url + '/projects/' + record.id;
			} else if( type.typeKey === 'resource' ) {
				var projectId = record.get('project');
				if( !projectId ) { reject('A parent project identifier property must be present on records of type \'resource\''); }
				url = url + '/projects/' + projectId + '/resources/' + record.get('id');
			} else {
				reject('unknown record type');
			}

			deleteObject(token, url, function(error) {
				if( !error ) { resolve(); }
				else { reject(error); }
			});
		});
	}
});
