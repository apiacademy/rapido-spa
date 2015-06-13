import Ember from "ember";

//TODO: re-route the user to the most recent sketch (or sketch last opened)

export default Ember.Controller.extend({
    routeName: 'project.sketch.graph',
    actions: {
        screenshot: function() {
            html2canvas(document.body, {
                onrendered: function(canvas) {
                //document.body.appendChild(canvas);
              }
            });
            console.log('screenshot taken');
        }
    }
});
