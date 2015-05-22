import Ember from 'ember';
import config from './config/environment';

var Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {

    this.route('projects', function() {} );

    this.route('project', { path: '/:project_id' }, function() {
        this.route('vocabulary', { path: '/vocab' } );
        this.route('sketches', { path: '/sketches' } );
        this.route('export', { path: '/export' } );

        this.route('alps', { path: '/alps' }, function() {
        });
        this.route('alps-create', { path: '/alps/create'} );
    });

    this.route('sketch', { path: '/sketches/:sketch_id' }, function() {
        this.route('graph', { path: '/graph' } );
    });

});

export default Router;
