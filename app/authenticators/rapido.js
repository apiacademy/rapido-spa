import Base from 'simple-auth/authenticators/base';
import ENV from "../config/environment";

var host = ENV.backend;

export default Base.extend({


  restore: function(data) {
      return new Promise(function(resolve, reject) {
          if( data.token ) {
              resolve({token:data.token});
          }
      });
  },

  authenticate: function(options) {
    var username = options.identification;
    var password = options.password;

    // Try to make call to backend for authentication
    return new Promise(function(resolve,reject) {

        var loginRequest = $.ajax({
            url: host + '/login',
            type: 'POST',                    
            beforeSend: function( request ) {
                var basicAuthString = 'Basic ' + btoa(username + ':' + password);
                //console.log(basicAuthString);                        
                request.setRequestHeader("Authorization", basicAuthString);
            }
        });

        loginRequest.done( function( data, textStatus, jqXHR ) {                    
            resolve({token:data.token});
        });

        loginRequest.fail( function( data, textStatus, jqXHR ) {
            reject(textStatus);
        });

    });

  },
  invalidate: function(data) {
      return new Promise(function(resolve,reject){ 
          console.log('inside invalidate function');
           var logoutRequest = $.ajax({
            url: host + '/logout',
            type: 'POST'
        });

        logoutRequest.done( function( data, textStatus, jqXHR ) {                    
            resolve({token:data.token});
        });

        logoutRequest.fail( function( data, textStatus, jqXHR ) {
            console.log('logout request failed');
            reject(textStatus);
        });

      });
  }
});
