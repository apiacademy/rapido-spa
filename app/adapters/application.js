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
function createObject(url, data, callback) {
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
function updateObject(url, data, callback) {
    var createAJAX = $.ajax({
        url: url,
        type: 'PUT',                    
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
 * Deletes objects from the server
 * @token {string} ???
 * @url {string} full resource path
 *
 * @return {Promise} promise
 */

function deleteObject(url, callback) {    
    var getAJAX = $.ajax({
        url: url,
        type: 'DELETE'                    
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
        return new Promise(function(resolve,reject) {
            if( type.typeKey === 'project' ) {
                url = url + '/projects/' + id;
            }else if( type.typeKey === 'sketch' ) { 
                url = url + '/sketches/' + id;
            }else if( type.typeKey === 'alps' ){
                url = url + '/alps/' + id;
            }else if( type.typeKey === 'hypernode' ){
                url = url + '/hypernodes/' + id;
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
        } else if( type.typeKey === 'crudnode') {
            url = url + '/sketches/' + query.sketch + '/crudnodes';
		} else if ( type.typeKey === 'hypernode' ) {
            url = url + '/sketches/' + query.sketch + '/hypernodes';
		} else if ( type.typeKey === 'map' ) { 
            var projectId = query.project;
            url = url + '/projects/' + projectId + '/maps';
        } else {
			console.error('findQuery is not supported for this record type.');
		}


		return new Promise(function(resolve,reject) {
			getObjects(url, function(error, result) {
                if( error ) {
                    reject(error);
                }else {
                    console.log(result);
                    resolve(result.result);
                }
			});
		});
	},
	createRecord: function(store, type, record) {
		url = host;

		var _record;

		return new Promise(function(resolve,reject) {

			if( type.typeKey === 'project' ) {
					_record = {
                        project: {
                            name: record.attr('name'),
                            description: record.attr('description'),
                            hostname: record.attr('hostname'),
                            contentType: record.attr('contentType'),
                            projectType: record.attr('projectType'),
                            activeSketch: record.attr('activeSketch')
                        }
					};
					url = url + '/projects';
			} else if( type.typeKey === 'sketch' ) {
                var _record = { sketch: {}};
				var projectId = record.attr('project');
				if( !record.attr('project') ) { reject('A parent project identifier property must be present on records of type \'sketch\''); }

                record.eachAttribute(function(attrName, meta) {
                    _record.sketch[attrName] = record.attr(attrName);
                });
				url = url + '/projects/' + projectId + '/sketches';
			} else if( type.typeKey === 'alp' ) {
                    _record = {
                        alps: {
                            name: record.attr('name'),
                            description: record.attr('description'),
                            contentType: record.attr('contentType'),
                            source: record.attr('source'),
                        }
                    };
                url = url + '/alps';
			} else if( type.typeKey === 'crudnode' ) {			
                var sketchId = record.attr('sketch');
				if( !record.attr('sketch') ) { reject('A sketch identifier property must be present on records of type \'crudnode\''); }
                
                var _record = { crudnode: {}};
                
                record.eachAttribute(function(attrName, meta) {
                    _record.crudnode[attrName] = record.attr(attrName);
                });
                
                url = url + '/sketches/' + sketchId + '/crudnodes';

			} else if( type.typeKey === 'hypernode' ) {
                var sketchId = record.attr('sketch');
				if( !record.attr('sketch') ) { reject('A sketch identifier property must be present on records of type \'hypernode\''); }
                _record = {
                    hypernode: {
                        name: record.attr('name'),
                        nodeClass : record.attr('nodeClass'),
                        url: record.attr('url'),
                        description: record.attr('description'),
                        contentType: record.attr('contentType'),
                        headers: record.attr('headers'),
                        statusCode: record.attr('statusCode'),
                        reason: record.attr('reason'),
                        body: record.attr('body'),
                        transitions: record.attr('transitions'),
                        method: record.attr('method'),
                    }
                };
                url = url + '/sketches/' + sketchId + '/hypernodes';
            } else if( type.typeKey === 'nodecollection' ) {
                var sketchId = record.attr('sketch');
				if( !record.attr('sketch') ) { reject('A parent sketch identifier property must be present on records of type \'hypernode\''); }
                _record = {
                    collection: record.attr('nodes')
                }
                url = url + '/sketches/' + sketchId + '/hypernodes/collection';

            } else if ( type.typeKey === 'map' ) {
                var projectId = record.attr('project');
				if( !record.attr('project') ) { reject('A parent project identifier property must be present on records of type \'map\''); }
                _record = {
                    map :  {
                        name: record.attr('name'),
                        description: record.attr('description'),
                        steps: record.attr('steps')
                    }
                };
                url = url + '/projects/' + projectId + '/maps';
            } else {
				reject('unknown record type');
			}

			createObject(url, _record, function(error, response) {
				if( !error ) { 
                    resolve(response.result);
                } else { reject(error); }
			});
		});

	},
	updateRecord: function(store, type, record) {
		url = host;
		var _record;

		return new Promise(function(resolve,reject) {
            if( type.typeKey === 'project' ) {
                var _record = {};

                record.eachAttribute(function(attrName, meta) {
                    _record[attrName] = record.attr(attrName);

                });

                url = url + '/projects/' + record.get('id');
            } else if( type.typeKey === 'resource' ) {
				var projectId = record.attr('project');
				if( !projectId ) { reject('A parent project identifier property must be present for records of type \'resource\''); }
				_record  = {
					resource:  {
						name: record.attr('name'),
						description: record.attr('description'),
						responses: record.attr('responses'),
						url: record.attr('url'),
						children: record.attr('children'),
						parent: record.attr('parent'),
						methods: record.attr('methods'),
                        class: record.attr('class')
					}
				};
				url = url + '/projects/' + projectId + '/resources/' + record.get('id');
				
			} else if( type.typeKey === 'hypernode' ) {
                _record = {
                    hypernode: {
                        sketch: record.attr('sketch'),
                        name: record.attr('name'),
                        nodeClass: record.attr('nodeClass'),
                        url: record.attr('url'),
                        description: record.attr('description'),
                        contentType: record.attr('contentType'),
                        headers: record.attr('headers'),
                        statusCode: record.attr('statusCode'),
                        reason: record.attr('reason'),
                        body: record.attr('body'),
                        method: record.attr('method'),
                        transitions: record.attr('transitions'),
                        method: record.attr('method'),
                        x: record.attr('x'),
                        y: record.attr('y')
                    }
                };
                url = url + '/hypernodes/' + record.get('id');
            } else if( type.typeKey === 'map' ) {
				if( !record.attr('project') ) { reject('A parent project identifier property must be present on records of type \'map\''); }
                var projectId = record.attr('project');
                var mapId = record.get('id');
                _record = {
                    map :  {
                        name: record.attr('name'),
                        description: record.attr('description'),
                        steps: record.attr('steps')
                    }
                };
                url = url + '/projects/' + projectId + '/maps/' + mapId;
            } else {
				reject('this record type cannot be updated.');
			}

			updateObject(url, _record, function(error, response) {
				if( !error ) { 
                    if( response ) {
                    resolve(response[0]); 
                    }
                    // Force a reload of the model in the Ember data store to reflect the updated version of the data


                }
				else { reject(error); }
			});
		});
	},
	deleteRecord: function(store, type, record) {
		url = host;

		return new Promise(function(resolve,reject) {
			if( type.typeKey === 'project' ) {
				url = url + '/projects/' + record.id;
			} else if( type.typeKey === 'resource' ) {
				var projectId = record.attr('project');
				if( !projectId ) { reject('A parent project identifier property must be present on records of type \'resource\''); }
				url = url + '/projects/' + projectId + '/resources/' + record.get('id');
			} else {
				reject('unknown record type');
			}

			deleteObject(url, function(error) {
				if( !error ) { resolve(); }
				else { reject(error); }
			});
		});
	}
});
