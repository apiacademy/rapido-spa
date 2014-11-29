import Ember from "ember";

export default Ember.Route.extend({
	model: function() {
		var route = this;
		return new Promise(function(resolve, reject) {
			var projectModel = route.modelFor('project');
			var simpleVocabulary = projectModel.get('simpleVocabulary');

			var vocabulary = [];

			for( var i = 0; i < simpleVocabulary.length; i++ ) {
				vocabulary.push({value: simpleVocabulary[i]});
			}

			resolve(vocabulary);
		});
	}
});
