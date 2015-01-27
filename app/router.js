import Ember from 'ember';
import config from './config/environment';

var Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {

    this.resource('debug', function() { path: '/debug'});

	this.resource('projects', function() {});

	this.resource('project', { path: '/:project_id'}, function() {       
		this.resource('start');

		this.resource('resources', function() {
			//Removing nesting because the templates will not be nested.
			//this.resource('resource', { path: '/:resource_id' });
		});
		this.resource('resources-editor', function() {
			this.resource('resource', { path: '/:resource_id' });
		}); 
		this.resource('states', function() {
            this.resource('state', { path: '/:state_id' }, function() {
                this.route('create-cj-transition', {path: '/cj-create'});
            });
		});
        this.resource('states-editor', function() {
            this.resource('state-editor', { path: '/:state_id' } );
        });
		this.resource('__resource', { path: '/resources/:resource_id' }, function() {
			this.resource('response', { path: '/:response_name' });
		});
		this.resource('alps', function() {
			this.route('create', {path: '/create'});
			this.resource('profile', { path: '/:alps_profile_id' }, function() {
				this.route('edit', {path: '/edit'});
			});
		});
		this.resource('maps', {path: '/maps'}, function() {
			this.resource('map', {path: '/:map_id'});
		});

		this.route('export', {path: '/export'});		
		this.route('run', {path: '/engine'});
		this.route('vocabulary', {path: '/vocab'});
		this.route('editor', {path: '/explore'});
	});


	
});

export default Router;
