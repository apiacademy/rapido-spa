import Ember from "ember";

export default Ember.Controller.extend({
    routeName: 'sketch.graph',
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
