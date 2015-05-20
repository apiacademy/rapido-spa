import Ember from "ember";
import AuthenticatedRouteMixin from 'simple-auth/mixins/authenticated-route-mixin';

export default Ember.Route.extend(AuthenticatedRouteMixin, {
	model: function() {
        // retrieve all ALPS that are associate with this project
		return this.store.find('alps', { project: 12 });
	}
});
