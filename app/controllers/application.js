import Ember from "ember";
import ENV from "../config/environment";

var host = ENV.backend;

export default Ember.ObjectController.extend({
    typeAheadSuggestions: [],
    typeAheadToken: '',
    selectedSuggestion: '',
    login_username: '',
    login_password: '',
	token: localStorage.token,
	tokenChanged: function() {
    	localStorage.token = this.get('token');
  	}.observes('token'),
	isAuthenticated: function() {
		if( this.get('token') ) { return true; }
		else { return false; }
	}.property('token'),
    email: '',
    firstName: '',
    lastName: '',
	actions: {
        register: function() {
            console.log(this.get('email'));
            console.log(this.get('firstName'));

            var data = {
                "apikey": "139c0c169651b04cb531a8c9ace048e4-us9",
                "id": "d96e7fec0f",
                "email": {
                    "email": this.get('email') 
                },
                "double_optin": false,
                "send_welcome": true,
                "merge_vars": {
                    "FNAME": this.get('firstName'),
                    "LNAME": this.get('lastName')
                }
            };

            $.post( "https://us9.api.mailchimp.com/2.0/lists/subscribe", data )
              .done(function( data ) {
                alert( "Data Loaded: " + data );
              });

        },
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
                //redirect to the start page
                self.transitionToRoute('projects');
            });

            loginRequest.fail( function( data, textStatus, jqXHR ) {
                console.log('fail.');                
            });
            
        },
        signOut: function() {            
           localStorage.removeItem('token');
    	this.set('token','');
            this.transitionToRoute('/');
        },
        suggestionClicked: function(suggestion) {
            console.log('application.suggestionClicked');            
            this.set('selectedSuggestion', suggestion.toString());
        }
    }
});
