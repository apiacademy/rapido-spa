import Ember from "ember";

export default Ember.Route.extend({
    model: function() {
        var project = this.modelFor('project');
        if( project.get('projectType') === 'hypermedia' ) {
            return this.store.find('state', {project: project.id});
        }else {
            return this.store.find('resource', {project: project.id});
        }
    }
});
