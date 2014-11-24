import DS from "ember-data";
 
var User = DS.Model.extend({
    id: DS.attr('string'),    
    username: DS.attr('string')
});

User.repenClass({
	FIXTURES: [
		{id: 1, username: 'kai'},
		{id: 2, firstName: 'rmitra'}
	]
});
  
export default User;