import Ember from "ember";

export default Ember.Route.extend({
    afterModel: function(model, transition) {
        console.log(model);

        var thisRoute = this;

        var promise = new Promise(function(resolve, reject){
            thisRoute.store.find('alps', { project: model.get('id')}).then(
            function(profiles) {
            var alpsVocabList = { meta: 'ALPS', words: []};
            for( var i = 0; i < profiles.get('content').length; i++ ) {
                var profile = profiles.get('content')[i];
                var profileWords = Object.keys(profile.get('json'));
                console.log(profileWords);
                for( var j = 0; j < profileWords.length; j++ ) {
                    alpsVocabList.words.push(profileWords[j]);
                }
            }
            console.log(alpsVocabList);
            model.set('alps', alpsVocabList);
            resolve(model);
            });
        });

        return promise;
    },
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
