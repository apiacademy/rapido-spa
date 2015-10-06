import Ember from "ember";


export default Ember.Route.extend({
    renderTemplate: function() { 
        // Choose the appropriate link wizard based on the content type
        var project = this.modelFor('project');

        console.log('******************************');

        console.log(project);
        console.log(project.get('contentType'));

        var contentType = project.get('contentType');
        var renderWizard = '';

        if( contentType === CollectionJSON.contentType ) {
            renderWizard = 'link-wizards.cj';
        } else if ( contentType === HAL.contentType ) { 
            renderWizard = 'link-wizards.hal';
        } else {
            throw new Error('Unknown content type');
        }

        
        this.render(renderWizard, {
            into: 'project.sketch.graph',
            outlet: 'modal'
        });

        Ember.run.scheduleOnce('afterRender', this, function() {
            $('#transitionModal').modal('show');
        });

    }
});



