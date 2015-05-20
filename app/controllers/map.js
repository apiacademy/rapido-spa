export default Ember.Controller.extend({
	needs: ['project'],
	projectController: Ember.computed.alias("controllers.project"),
	indexedSteps: function() {
		var steps = this.get('content').get('steps');
		return steps.map(function(i, idx) {
      		return {item: i, index: idx};
		});    
	}.property('steps.@each'),
	isDirty: false,
	blah: '',
	isPage1Valid: true,
	noteTypeOptions: '',
	editingStep: '',
	noteValue: '',
	actions: {     
		addStep: function(e) {
			this.get('content').get('steps').pushObject({"value" : "", "questions" : [], "comments": [], "ideas": []});
		},		
		save: function() {
			var projectId = this.get('projectController').get('model').get('id');  
			var map = this.get('content');			
            map.set('project', projectId);

            console.log(projectId);
            console.log(map);

            map.save();
		
        /*    
			Backend.update('map', map, {'project': projectId, 'map': map.id}).then(function(result) {                
				controller.set('isDirty',false);								
            }, function( error ) {
                console.log(error);
            });
        */
		},
		addNote: function(index) {
			this.set('editingStep',index);
			$('#modal_addNote').modal();
		},
		saveNote: function() {			
			console.log(this.noteTypeOptions);
			//Ember doesn't support radio buttons.  We don't need to bind the data, so just use JQuery to quickly grab the selected value.
			var selValue = $('input[name=noteTypeOptions]:checked').val(); 
			console.log(selValue);
			var index = this.get('editingStep');
			var steps = this.get('content').get('steps');
			
			if( selValue === 'question' ) {				
				steps[index].questions.pushObject(this.noteValue);
			}else if( selValue === 'comment' ) {
				steps[index].comments.pushObject(this.noteValue);
			}else if( selValue === 'idea' ) {
				steps[index].ideas.pushObject(this.noteValue);
			}
			
			this.noteValue = '';
			this.editingStep = '';
		}
	}
});
