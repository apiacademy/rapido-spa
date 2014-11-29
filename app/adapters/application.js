import DS from "ember-data";
import ENV from "../config/environment";

var host = ENV.backend;
var url;
var record;

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
 * @return {Promise} promise
 */

function getObjects(token, url, callback) {
    var getAJAX = $.ajax({
        url: url,
        type: 'GET',                    
        beforeSend: function( request ) {
            var bearerAuthString = 'Bearer ' + token;                    
            request.setRequestHeader("Authorization", bearerAuthString);
        }
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
	find: function(store, type, id, record) {		
		console.log(store);
		console.log(type);
		console.log(id);
		console.log(record);
		return new Promise(function(resolve,reject) { reject('not implemented.'); });
  	},
	findAll: function(store, type, sinceToken) {
		//console.log(type.typeKey);
		//console.log(sinceToken);

		var token = localStorage.token;
		url = host;
	
		return new Promise(function(resolve,reject) {
			if( type.typeKey === 'project' ) {
				url = url + '/projects';
			}else {
				reject('findAll is not supported for this record type.');
			}

			getObjects(token, url, function(error, result) {
				if( error === null ) { resolve(result); } 
				else { reject(error); }
			});
		});
		
	},
	findQuery: function(store, type, query) {		
		var token = localStorage.token;
		url = host;

		if( type.typeKey === 'resource') {
			var projectId = query.project;
			url = url + '/projects/' + projectId + '/resources';
		} else if ( type.typeKey === 'state' ) {
			var projectId = query.project;
			url = url + '/projects/' + projectId + '/states';

			/** Mock the response for now.  Implement in back once we work out the details. **/
            /**
			return new Promise(function(resolve,reject) {
                
				var _state = [
					{
                        name: "state1",
                        _id: "asdf1",
                        description: "state description",
                        transitions: [
                           {name: 'transition1', methods: ['GET'], target: 'asdf2'},
                           {name: 't2', methods: ['GET'], target: '3'},
                           {name: 't3', methods: ['GET'], target: '4'}
                        ],
                        responses: {'primary': '{ \"collection\": {}}'}
                    },
					{
                        name: "state2",
                        _id: "asdf2",
                        description: "another description",
                        transitions: [],
                        responses: {'primary': '{ \"collection\": {}}'}
                    },
                    {
                        name: "state3",
                        _id: "3",
                        description: "third",
                        transitions: [],
                        responses: {'primary': ''}
                    },
                    {
                        name: "state 4",
                        _id: "4",
                        description: "third",
                        transitions: [],
                        responses: {'primary': ''}
                    }
				];
				console.log(_state);
				resolve(_state);
			});**/
		} else {
			console.error('findQuery is not supported for this record type.');
		}


		return new Promise(function(resolve,reject) {
			getObjects(token, url, function(error, result) {
				if( error === null ) { resolve(result); } 
				else { reject(error); }
			});
		});
	},
	createRecord: function(store, type, record) {
		console.log('**** createRecord ****');
		var token = localStorage.token;
		url = host;
		//TODO: Check if token is valid, reject if it is not there.

		var _record;

		return new Promise(function(resolve,reject) {

			if( type.typeKey === 'project' ) {
					_record = {		        
						name: record.get('name'),
						description: record.get('description'),
						hostname: '',
						contentType: record.get('contentType'),
						projectType: record.get('projectType')
					};
					url = url + '/projects';
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
						parent: record.get('parentId'),
						methods: record.get('methods')
					}
				};
				url = url + '/projects/' + projectId + '/resources';
			} else if( type.typeKey === 'state' ) {
                var projectId = record.get('project');
				if( !record.get('project') ) { reject('A parent project identifier property must be present on records of type \'resource\''); }
                _record = {
                    state: {
                        name: record.get('name'),
                        description: record.get('description'),
                        responses: record.get('responses'),
                        transitions: record.get('transitions')
                    }
                };
                url = url + '/projects/' + projectId + '/states';
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
						parent: record.get('parentId'),
						methods: record.get('methods')
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
