import Ember from "ember";


export default Ember.Route.extend({
    renderTemplate: function() { 
        this.render('link-wizards.cj', {
            into: 'project.sketch.graph',
            outlet: 'modal'
        });

        Ember.run.scheduleOnce('afterRender', this, function() {
            $('#transitionModal').modal('show');
        });

    }
});



