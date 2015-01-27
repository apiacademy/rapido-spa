import Ember from "ember";
import AuthenticatedRouteMixin from 'simple-auth/mixins/authenticated-route-mixin';

export default Ember.Route.extend(AuthenticatedRouteMixin, {
	model: function() {
        console.log('debug');

        return new Promise(function(resolve){
            //Ember.$.get('/v4/data').then(function(response) {
            Ember.$.get('http://localhost:8081/projects').then(function(response) {
              resolve(JSON.stringify(response));
            });
        });
	}
});
