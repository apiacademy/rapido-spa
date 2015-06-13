import Ember from 'ember';
import config from './config/environment';

var Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {

    this.route('projects', function() {} );

    this.route('project', { path: '/:project_id' }, function() {
        this.route('vocabulary', { path: '/vocab' } );
        this.route('sketch', { path: '/sketches/:sketch_id' }, function() {
            //TODO: Nest the graph route inside hypernodes
            this.route('hypernodes', { path: '/nodes' }, function() {
                this.route('hypernode', { path: '/:node_id' } );
            });
            this.route('hypernode', { path: '/:node_id' } );
            this.route('graph', { path: '/graph' }, function() {
                this.route('hypernode', { path: '/:node_id' }, function() {
                    this.route('create-link', { path: '/create-link' } );
                });
            });
        });

        this.route('sketches', { path: '/sketches' } );
        this.route('export', { path: '/export' } );

        this.route('alps', { path: '/alps' }, function() {
        });
        this.route('alps-create', { path: '/alps/create'} );
    });

});

export default Router;
