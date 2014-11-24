import Ember from "ember";

var host = 'http://localhost:8081';

export default Ember.ObjectController.extend({
	token: localStorage.token,
	tokenChanged: function() {
    	localStorage.token = this.get('token');
  	}.observes('token'),
	isAuthenticated: function() {
		if( this.get('token') ) { return true; }
		else { return false; }
	}.property('token'),
	actions: {
        signIn: function() {
        	var username = this.get('login_username');
        	var password = this.get('login_password');

        	var loginRequest = $.ajax({
                url: host + '/login',
                type: 'POST',                    
                beforeSend: function( request ) {
                    var basicAuthString = 'Basic ' + btoa(username + ':' + password);
                    console.log(basicAuthString);                        
                    request.setRequestHeader("Authorization", basicAuthString);
                }
            });

            var self = this;

            loginRequest.done( function( data, textStatus, jqXHR ) {                    
                console.log(data);                
                self.set('token', data.token);
            });

            loginRequest.fail( function( data, textStatus, jqXHR ) {
                console.log('fail.');                
            });
            
        },
        signOut: function() {            
           localStorage.removeItem('token');
		this.set('token','');
        },
        suggestionClicked: function(suggestion) {
            console.log('application.suggestionClicked');            
            this.set('selectedSuggestion', suggestion.toString());
        }
    }
});
