import Ember from "ember";

export default Ember.Route.extend({
    model: function() {
        var project = this.modelFor('project');

        // Get the active or last sketch

        // Load the appropriate resources (hypernodes or resources) depending on the type of project
        if( project.get('projectType') === 'hypermedia' ) {
            return this.store.find('state', {project: project.id});
        }else {
            return this.store.find('resource', {project: project.id});
        }
    }
});
