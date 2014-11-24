console.log('hi');
//console.log(Em);
//var App = Em.Application;
/**
Ember Models
**/
App.Model = Ember.Object.extend({
});

App.UserModel = App.Model.extend({
    id: '',    
    username: ''
});
 
App.ProjectModel = App.Model.extend({
    id: '',
    name: '',
    hostname: '',
    description: '',
    creationDate: '',
    contentType: '',
	projectType: '',
	simpleVocabulary: []	
});

App.MapModel = App.Model.extend({
	name: '',
	description: '',
	image: '',
	steps: []    
});

// StateModel and ResponseModel will be used when I refactor for URI style support.  These models will be used for the
// hypermedia state machine and App.ResourceModel will be used for the URI style tree
App.StateModel = App.Model.extend({
	id: '',
    name: '',
    description: '',
	transitions: [],
	responses: {}    
});

App.ResponseModel = App.Model.extend({
	id: '',
    name: '',
    description: '',
    body: '',
	headers: [],
	statusCode: ''
});

// TODO: The resource model should be used only for CRUD projects
App.ResourceModel = App.Model.extend({
    id: '',
    name: '',
    description: '',
    response: '',
    url: '',
    transitions: [],
    methods: [],
    getEnabled: false,
    putEnabled: false,
    postEnabled: false,
    deleteEnabled: false,
    patchEnabled: false,
	children: [],
	parent: ''
});

App.CRUDResourceModel = App.Model.extend({
	id: '',
    name: '',
    description: '',
    response: '',
    url: '',    
	children: [],
	parent: '',
	methods: []
});

App.ResponseModel = App.Model.extend({
	name: '',
	conditions: [{"name":"method", "value":"GET"}],
	headers: [],
	body: ''		
});

App.ALPSModel = App.Model.extend({
    id: '',
    name: '',
    description: '',
    document: '',
    format: '',
    vocabulary: {}
});

App.ALPSVocabulary = App.Model.extend({
    descriptors: {}
});

/**
Adapter for the backend.  Has a dependency on Ember objects.
**/
var Backend = (function (){
	
	console.log('iffe');
         
    var projects = Ember.A();
    var resources = Ember.A();
	var CRUDResources = Ember.A();
	var maps = Ember.A();
    var user = null;
    var host = 'http://localhost:8081'
    var alpsProfiles = Ember.A();
    var alpsVocabulary = App.ALPSVocabulary.create({descriptors: []});
    
/***********************************************************************************
 PRIVATE FUNCTIONS
***********************************************************************************/
function storeCredentials(username, token) {
    $.cookie('token', token);
    $.cookie('username', username);
}
    
//Creates a new project instance based on a server representation
function createProjectClass(project) {
	var vocabulary = [];
	if( project.simpleVocabulary ) vocabulary = project.simpleVocabulary;
    var projectClass = App.ProjectModel.create({
        id: project._id,
        name: project.name,
        hostname: project.hostname,
        description: project.description,
        creationDate: project.created,
        contentType: project.contentType,
		projectType: project.projectType,
		simpleVocabulary: vocabulary
    });    
    return projectClass;
}
 
//Updates a project instance with the data returned by server and adds it to the projects list
function projectCreated(instance, serverObject) {
    console.log(serverObject);
    instance.id = serverObject._id;
    instance.creationDate = serverObject.created;
    projects.pushObject(instance);
}
    
// Converts a Project model into a backend representation
function projectSerializer(project) {
    var serverProjectObject = {
        name: project.name,
        description: project.description,
        hostname: project.name,
        contentType: project.contentType,
		projectType: project.projectType,
		simpleVocabulary: project.simpleVocabulary
    }
    return serverProjectObject;    
}    
	
function projectVocabSerializer(vocabularyList) {
	return {
		vocabulary : vocabularyList
	};
}
    
// Converts a backend represntation into a project model
function projectParser(data) {    
    return new RSVP.Promise(function(resolve, reject) {
        var _projects = Ember.A();
        $.each(data, function (index, project) {
            ////console.log(project);      
            var projectClass = createProjectClass(project);
            _projects.pushObject(projectClass);                                
        });   
        projects = _projects;
        resolve(projects);
    });    
}
	
function mapCreated(instance, serverObject) {
	instance.id = serverObject._id;
    maps.pushObject(instance);
}
	
function mapSerializer(map) {
	
	var serverMapObject = {
        'map': {
            'name' : map.name,
            'description': map.description,
            'image': map.image,            
            'steps': map.steps			
        }
    }
	
	return serverMapObject;
}
	
function mapParser(data) {
	
	return new RSVP.Promise(function(resolve, reject) {
        var _maps = Ember.A();
        $.each(data, function (index, map) {  
			var mapClass = App.MapModel.create({
				id: map._id,
				name: map.name,
				description: map.description,
				image: map.image,
				steps: map.steps    
			});
            _maps.pushObject(mapClass);                                
        });   
        maps = _maps;
        resolve(maps);
    });    
	
}

	
function CRUDResourceCreated(instance, serverObject) {
	instance.id = serverObject._id;
    CRUDResources.pushObject(instance);
}	
	
function CRUDResourceSerializer(resource) {
	var parentId = null;
	if( resource.parent ) {
		parentId = resource.parent.id;
	}
	var children = [];
	if( resource.children ) {
		for( var i =0; i < resource.children.length; i++ ) {
			if( resource.children[i].id ) {
				children.push(resource.children[i].id);
			}
		}
	}

	console.log(resource);
	
	var serverResourceObject = {
        'resource': {
            'name' : resource.name,
            'description': resource.description,
            'responses': resource.responses,            
            'url': resource.url,
			'children' : children,
			'parent' : parentId,
			methods: resource.methods
        }
    }
    
    return serverResourceObject;
}
	
function CRUDResourceParser(data) {
	
	//TODO: Make the parser create a TreeList by pointing the children at actual objects.
	
	return new RSVP.Promise(function(resolve, reject) {
        var _resources = Ember.A();
		var _resourceMap = {};
        $.each(data, function( index, resource) {            
			
			if( !resource.methods ) resource.methods = [];
			
			// Parse the response array
			var responses = [];
			if( resource.responses ) {
				for( var i = 0; i < resource.responses.length; i++ ) {
					responses.push(App.ResponseModel.create({
						name: resource.responses[i].name,
						body: resource.responses[i].body
					}));					
				}
			}
			
            var resourceInstance = App.CRUDResourceModel.create({
                id: resource._id,
                name: resource.name,    
                description: resource.description,
                responses: responses,
                url: resource.url,
                children: resource.children,
				parent: resource.parent,
				methods: resource.methods
            });
					
			_resourceMap[resourceInstance.id] = resourceInstance;
            _resources.pushObject(resourceInstance);
        });
        CRUDResources = _resources;
		
		// Iterate through the Ember array of resources and dereference the parent and children properties
		CRUDResources.forEach(function(resource, index, resources) {
			//console.log(resource);
			if( resource.parent ) {
				var parent = _resourceMap[resource.parent];
				if( parent ) resource.parent = parent;
			}
			
			if( resource.children ) {
				var newChildList =[];
				resource.children.forEach(function (childResource) {
					var child = _resourceMap[childResource];
					if( child ) newChildList.push(child);
				});
				resource.children = newChildList;
			}
		});
		
		// Note: CRUDResources will change after we resolve it because the dereferencer is asynchronous
		console.log(CRUDResources);
        resolve(CRUDResources);
    });
}
	
function resourceCreated(instance, serverObject) {
    instance.id = serverObject._id;
    resources.pushObject(instance);
}

function resourceSerializer(resource) {
    // create the methods array based on the boolean values
    var methods = [];
    
    if( resource.getEnabled ) {
        methods.push('GET');
    }
    if( resource.putEnabled ) {
        methods.push('PUT');
    }
    if( resource.patchEnabled ) {
        methods.push('PATCH');
    }
    if( resource.postEnabled ) {
        methods.push('POST');
    }
    if( resource.deleteEnabled ) {
        methods.push('DELETE');
    }
    
    var serverResourceObject = {
        'task': {
            'title' : resource.name,
            'description': resource.description,
            'responseData': resource.response,
            'methods': methods,
            'url': resource.url            
        }
    }
        
    return serverResourceObject;
}
    
function resourceParser(data) {
    return new RSVP.Promise(function(resolve, reject) {
        var _resources = Ember.A();
        $.each(data, function( index, resource) {
            
            var resourceInstance = App.ResourceModel.create({
                id: resource._id,
                name: resource.title,    
                description: resource.description,
                response: resource.responseData,
                url: resource.url,
                methods: resource.methods,
                transitions: resource.transitions,
                getEnabled: false,
                putEnabled: false,
                postEnabled: false,
                deleteEnabled: false,
                patchEnabled: false
            });
			
			/*
            // parse the methods array
            for( var i = 0; i < resource.methods.length; i++ ) {
                // TODO: can I referency the name of a property dynamically?
                if( resource.methods[i] === 'GET' ) {
                    resourceInstance.getEnabled = true;
                }
                if( resource.methods[i] === 'PUT' ) {
                    resourceInstance.putEnabled = true;
                }
                if( resource.methods[i] === 'POST' ) {
                    resourceInstance.postEnabled = true;
                }
                if( resource.methods[i] === 'PATCH' ) {
                    resourceInstance.patchEnabled = true;
                }
                if( resource.methods[i] === 'DELETE' ) {
                    resourceInstance.deleteEnabled = true;
                }
            } 
			*/
            
            _resources.pushObject(resourceInstance);
        });
        resources = _resources;
        resolve(resources);
    });
}
    
function transitionSerializer(transition) {
    return transition;
}
    
function transitionCreated(instance, serverObject) {
    return;
}
    
function alpsParser(data) {
    return new RSVP.Promise(function(resolve, reject) {
        var _profiles = [];    
        $.each(data, function( index, profile) {
            var profileInstance = App.ALPSModel.create({
                id: profile._id,
                name: profile.name,
                description: profile.description,
                document: profile.doc,
                format: profile.format,
                vocabulary: profile.vocabulary
            });
            _profiles.pushObject(profileInstance);            
        });
        
        alpsProfiles = _profiles;
        resolve(alpsProfiles);
    });
}
    
function alpsVocabParser(data) {
    return new RSVP.Promise(function(resolve, reject) {
        alpsVocabulary.set('descriptors', data);
        resolve(alpsVocabulary);
    });
}
        
/*****************
CRUD Operations
******************/
    
function createObject(token, url, instance, serializer, postCreate, resolve, reject) {
    
    var data = serializer(instance);
    
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
        postCreate(instance, response[0]);
        resolve(instance);
    });
    
    createAJAX.fail( function( response, textStatus, jqXHR ) {
        reject(textStatus);
    });
}

    
function getObjects(token, url, dataParser, callback) {
    var getAJAX = $.ajax({
        url: url,
        type: 'GET',                    
        beforeSend: function( request ) {
            var bearerAuthString = 'Bearer ' + token;                    
            request.setRequestHeader("Authorization", bearerAuthString);
        }
    });
                
    getAJAX.done( function( data, textStatus, jqXHR ) {                    
        ////console.log(data);                
        dataParser(data).then(function(parsedData) {
            callback(null, parsedData);
        }, function(error) {
            callback(error);
        });        
    });
    
    getAJAX.fail( function( data, textStatus, jqXHR ) {
        //console.log('fail');
        callback(textStatus, null);
    });
}
    
function updateObject(token, url, instance, serializer, resolve, reject) {
    var data = serializer(instance);
    var updateAJAX = $.ajax({
        url: url,
        type: 'PUT',                    
        contentType : 'application/json',
        data: JSON.stringify(data),
        beforeSend: function( request ) {
            var bearerAuthString = 'Bearer ' + token;
            request.setRequestHeader("Authorization", bearerAuthString);
        }
    });
                
    updateAJAX.done( function( response, textStatus, jqXHR ) {                            
        // On success, create a new model instance and return it
        //postCreate(instance, response[0]);
        resolve(instance);
    });
    
    updateAJAX.fail( function( response, textStatus, jqXHR ) {
        console.log('fail');        
        reject(textStatus);
    });
}
    
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
    
function getToken() {
    var _userData = $.cookie('user');
    if( _userData != null ) {
        _userData = JSON.parse(_userData);
        return _userData.token;
    }
    return null;
}

/***********************************************************************************
Public Functions
***********************************************************************************/
    
    return {        
        
    findAll: function(dataType, identifiers) {
        return new RSVP.Promise(function(resolve, reject) {
            var token = getToken();
            if( dataType === 'project' ) {
                var url = host + '/projects';
                getObjects(token, url, projectParser, function(error, result) {
                    if( error === null ) { resolve(result); }
                    else { reject(error); }
                });
            }
            else if( dataType === 'resource' ) {
                var url = host + '/projects/' + identifiers.project + '/states';
                getObjects(token, url, resourceParser, function(error, result) {
                    if( error === null ) { resolve(result); }
                    else { reject(error); }
                });
            }
			else if( dataType === 'CRUDResource' ) {
				var url = host + '/projects/' + identifiers.project + '/resources';
                getObjects(token, url, CRUDResourceParser, function(error, result) {
                    if( error === null ) { resolve(result); }
                    else { reject(error); }
                });
			}
            else if( dataType === 'alps' ) {
                var url = host + '/ALPS/profiles';
                getObjects(token, url, alpsParser, function(error, result) {                    
                    if( error === null ) { resolve(result); }
                    else { reject(error); }
                });
            }
            else if( dataType === 'vocabulary' ) {                
                var url = host + '/ALPS/vocabulary';
                getObjects(token, url, alpsVocabParser, function(error, result) {                                        
                    if( !error ) { 
                        resolve(result); 
                    }
                    else { 
                        reject(error); 
                    }
                });
            }
			else if( dataType === 'map' ) {
				var url = host + '/projects/' + identifiers.project + '/maps';
                getObjects(token, url, mapParser, function(error, result) {
                    if( error === null ) { resolve(result); }
                    else { reject(error); }
                });
			}
        });
    },
        
    find: function(dataType, identifiers) {
        return new RSVP.Promise(function(resolve, reject) {
            var token = getToken();
            if( dataType === 'project' ) {
                var url = host + '/projects/' + identifiers.project;
                getObjects(token, url, projectParser, function(error, result) {
                    if( error === null ) { 
                        resolve(result[0]);
                    } else {
                        reject(error);
                    }
                });
            } else if( dataType === 'alps' ) {
				var url = host + '/ALPS/profiles/' + identifiers.profile;
				getObjects(token, url, alpsParser, function(error, result) {
					if( error === null ) { resolve(result); }
					else { reject(error); }
				});
			}
        });
    },

    create: function(dataType, instance, identifiers) {
        return new RSVP.Promise(function(resolve, reject) {
            var token = getToken();
            if( dataType === 'project' ) {
                var url = host + '/projects';
                createObject(token, url, instance, projectSerializer, projectCreated, resolve, reject);
            }
            else if( dataType === 'resource' ) {
                var url = host + '/projects/' + identifiers.project + '/states';
                createObject(token, url, instance, resourceSerializer, resourceCreated, resolve, reject);
            }
			else if( dataType === 'CRUDResource' ) {
				var url = host + '/projects/' + identifiers.project + '/resources';
                createObject(token, url, instance, CRUDResourceSerializer, resourceCreated, resolve, reject);
			}
            else if( dataType === 'transition' ) {
                var url = host + '/projects/' + identifiers.project + '/transitions';
                createObject(token, url, instance, transitionSerializer, transitionCreated, resolve, reject);
            }
			else if( dataType === 'map' ) {
				var url = host + '/projects/' + identifiers.project + '/maps';
                createObject(token, url, instance, mapSerializer, mapCreated, resolve, reject);
			}
        });
    },
    
    update: function(dataType, instance, identifiers) {
        return new RSVP.Promise(function(resolve, reject) {
            var token = getToken();
            if( dataType === 'project' ) {
                var url = host + '/projects/' + identifiers.project;
                updateObject(token, url, instance, projectSerializer, resolve, reject);
            }
            else if( dataType === 'resource' ) {
                var url = host + '/projects/' + identifiers.project + '/states/' + identifiers.resource;
                updateObject(token, url, instance, resourceSerializer, resolve, reject);
            } else if( dataType === 'CRUDResource' ) {				
                var url = host + '/projects/' + identifiers.project + '/resources/' + identifiers.resource;
                updateObject(token, url, instance, CRUDResourceSerializer, resolve, reject);
            }else if( dataType === 'project.vocabulary' ) {
				var url = host + '/projects/' + identifiers.project + '/vocabulary';
				updateObject(token, url, instance, projectVocabSerializer, resolve, reject);
			}else if( dataType === 'map' ) {
				var url = host + '/projects/' + identifiers.project + '/maps/' + identifiers.map;
                updateObject(token, url, instance, mapSerializer, resolve, reject);
			}
        });
    },
        
    delete: function(dataType, instance, identifiers) {
        return new RSVP.Promise(function(resolve, reject) {
            var token = getToken();
            if( dataType === 'project' ) {
                var url = host + '/projects/' + instance.id;
                deleteObject(token, url, function( error ) {
                    if( error == null ) {
                        // remove this project from the list of projects
                        resolve();
                    } else {
                        reject(error);
                    }
                });
            }
            else if( dataType === 'resource' ) {
                var url = host + '/projects/' + identifiers.project + '/states/' + instance.id;
                deleteObject(token, url, function( error ) {
                    if( error == null ) {
                        // Remove this resource from the resources array
                        resources.removeObject(instance);
                        resolve();
                    } else {
                        reject(error);
                    }
                });
            }
			else if( dataType === 'CRUDResource' ) {
				reject('not implemented yet');
			}
            else if( dataType === 'transition' ) {
                reject('not implemented yet');
            }
        });
    },
        
    signin: function(username, password) {
        // call the login endpoint 
        var promise = new RSVP.Promise(function (resolve, reject) {
            var loginRequest = $.ajax({
                url: host + '/login',
                type: 'POST',                    
                beforeSend: function( request ) {
                    var basicAuthString = 'Basic ' + btoa(username + ':' + password);
                    console.log(basicAuthString);                        
                    request.setRequestHeader("Authorization", basicAuthString);
                }
            });

            loginRequest.done( function( data, textStatus, jqXHR ) {                    
                console.log(data);
                var token = data['token'];                
                user = App.UserModel.create({
                    id: username,
                    token: token
                });
                var userStorage = {
                    id: username,
                    token: token
                }
                $.cookie('user', JSON.stringify(userStorage));
                resolve(user);
            });

            loginRequest.fail( function( data, textStatus, jqXHR ) {
                console.log('fail.');
                //console.log('fail');
                //console.log(textStatus);
                //console.log(data);
                reject();
            });

        });
        return promise;
    },

    signout: function() {
        var promise = new RSVP.Promise(function (resolve, reject) {
            $.removeCookie('user');
            user.set('id', '');
            user.set('token', '');                 
            resolve();
        });
        return promise;
    },
        
    getUser: function() {
        return new RSVP.Promise(function (resolve, reject) {
            // Is the user object still in memory?
            if( user === null ) {
                user = App.UserModel.create({
                    id: '',
                    token: ''
                });
                // if not, try and grab it from a session cookie
                var _userData = $.cookie('user');                    
                    if( _userData != null ) {
                        var _user = JSON.parse(_userData);
                        user.set('id', _user.id);
                        user.set('token', _user.token);
                    }
            }
            resolve(user);
        });        
    },
        
    retrieveExternalALPS: function(href) {
         var url = host + '/ALPS/external?href=' + href;
        return new RSVP.Promise(function (resolve, reject) {
            var getAJAX = $.ajax({
                url: url,
                type: 'GET'
            });

            getAJAX.done( function( data, textStatus, jqXHR ) {                                    
                //console.log(jqXHR.getResponseHeader('Content-Type'));
                resolve(data);
            });

            getAJAX.fail( function( data, textStatus, jqXHR ) {
                reject(textStatus);
            });
            
        });
    }

};
    
}());
