import Ember from "ember";

export default Ember.Route.extend({
	model: function(params) {
		return this.store.find('project', params.project_id);
	},
    renderTemplate: function(controller) {
        this.render('project.menu', { 
          outlet: 'projectmenu',
          controller: controller 
        });
    }
});
