import DS from "ember-data";
 
var User = DS.Model.extend({
    id: DS.attr('string'),    
    username: DS.attr('string')
});
  
export default User;
