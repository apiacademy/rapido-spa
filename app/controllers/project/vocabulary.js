import Ember from "ember";

export default Ember.ArrayController.extend({
	stage: 'vocabulary',
	needs: ['project'],
	projectController: Ember.computed.alias("controllers.project"),
	newVocab: '',
	actions: {
		createVocab: function() {		 		 	 		 		 
			this.pushObject({value:this.newVocab});		 
		 			
			var project = this.get('projectController').model;
			updateVocabulary(project, this.get('content'));		  		  
		 
			this.set('newVocab', '');
		},
		deleteWord: function(word) {
			this.removeObject(word)		  
			var project = this.get('projectController').model;
			updateVocabulary(project, this.get('content'));		  		  
		}
	}
});

function updateVocabulary(project, vocabulary) {
	var simpleVocabulary = [];
	for( var i = 0; i < vocabulary.length; i++ ) {
		simpleVocabulary.push(vocabulary[i].value);
	}

    console.log(simpleVocabulary);
    console.log(project);

    project.set('simpleVocabulary', simpleVocabulary);
    console.log(project);
    console.log(project.changedAttributes());
    project.save();


    /**
	Backend.update('project.vocabulary', simpleVocabulary, {'project': project.id})
		.then(function(result) {
                
	 }, function( error ) {
         	console.log(error);
		//TODO: What do I do if there was an error?
	});   		
    **/
}
