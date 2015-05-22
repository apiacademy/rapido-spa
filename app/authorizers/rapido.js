import Base from 'simple-auth/authorizers/base';

export default Base.extend({
  authorize: function(jqXHR, requestOptions) {
    if (this.get('session.isAuthenticated') && !Ember.isEmpty(this.get('session.token'))) {
        jqXHR.setRequestHeader('Authorization', 'Bearer ' + this.get('session.token'));
    }
  }
});
