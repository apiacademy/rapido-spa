import Ember from "ember";
import ENV from "../config/environment";
import LoginControllerMixin from 'simple-auth/mixins/login-controller-mixin';

var host = ENV.backend;

export default Ember.Controller.extend(LoginControllerMixin, {
    authenticator: 'authenticator:rapido',
    content: {},
    typeAheadSuggestions: [],
    typeAheadToken: '',
    selectedSuggestion: '',
    email: '',
    firstName: '',
    lastName: '',
    subscribed: false,
	actions: {
        register: function() {
            var data = {};
            data.email = this.get('email');
            data.firstName = this.get('firstName');
            data.lastName = this.get('lastName');
            var controller = this;

            $.post( host + '/subscribe', data )
              .done(function( data ) {
                  controller.set('subscribed', true);
              });

        },
        signOut: function() {            
            this.get('session').invalidate();
            this.transitionToRoute('/');
        },
        suggestionClicked: function(suggestion) {
            console.log('application.suggestionClicked');            
            this.set('selectedSuggestion', suggestion.toString());
        }
    }
});
