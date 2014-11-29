import Ember from 'ember';

// How do I bind this so that it executes when properties change?
// Ember... sometimes I hate you so much.

export default function wizardTest(val, options) {
    console.log('wizard-test');
    var wizardState = this.get('wizardState');
    if( val === wizardState ) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }
};

//export default Ember.Handlebars.makeBoundHelper(wizardTest);
