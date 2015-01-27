import Ember from "ember";

export default Ember.ArrayController.extend({    
	needs: ['project'],
	projectController: Ember.computed.alias("controllers.project"),
    initialize: function() {
        //console.log(this.get('model'));
        console.log('testing');
        console.log(this.get('model'));
        var maps = this.get('model').content;
        if( maps && maps.length > 0 ) { 
            this.set('selectedMap', maps[0].get('id'));
        }
    }.observes('model'),
	selectedMap: '',
	mapChanged: function() {		
		var selectedMap = this.selectedMap;
		if( !selectedMap ) {
			// Try to set the default			
			var maps = this.get('content');
			if( maps.length > 0 ) {
				//console.log(maps[0]);
				this.set('selectedMap', maps[0]);
			}
		}else {
			//console.log(selectedMap);
			this.transitionToRoute('map',selectedMap);
		}
		
		
	}.observes('selectedMap'),
	newName: '',
	newDescription: '',
	isPage1Valid: function() {
		return true;
	}.property('newName'),
    actions: { 
		save: function() {				
			var projectId = this.get('projectController').get('model').get('id');
			var newMap = this.store.createRecord('map', {
                name: this.get('newName'),                
                description: this.get('newDescription'),       
				image: '',
				steps: [],
                project: projectId          
            });

            newMap.save();

			// reset the form fields
			this.set('newName','');
			this.set('newDescription','');
			var controller = this;
		}
	}
});
