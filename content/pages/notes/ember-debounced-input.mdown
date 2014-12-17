Date: 11 Nov 2012

# Ember Debounced Input

I used ember.js in one of the projects recently. There was no prescribed way to debounce
value handlers on inputs. I have extended the default input view to debounce updates
on input’s value property. This allows for embedding controller or view to pass a property
that will correspond to that input value and will only be updated once in `wait` ms – in case
you have complicated `property` methods that contain a lot of logic and will trigger rerenders
on your UI this might be very reasonable.

In `app/components/debounced-input.js`:

    import Ember from 'ember';

    export default Ember.TextField.extend({
      debounceWait: 500, // default wait value
      fireAtStart: true, // defaults to “start at start of wait period”
      _elementValueDidChange: function() {
        Ember.run.debounce(this, this._setValue, this.debounceWait, this.fireAtStart);
      },
      _setValue: function () {
        this.set('value', this.$().val());
      }
    });

This component can then be used interchangeably with regular `{{input}}` helper and all regular text input attributes will work too.

    {{!
      Attributes:
      // propertyName corresponds to the property of the embedding template’s context that will be updated according to input value
      value=propertyName
      // debounce wait value
      debounceWait=300
      // corresponds to Ember.run.debounce’s 4th param, if false, will run at the end of wait period
      fireAtStart=false
      // all regular input attributes can be used
      placeholder="123"
    }}
    {{debounced-input
       value=propertyName
       debounceWait=300
       fireAtStart=false
       placeholder="123"
       class="form-control"
       name="price"
     }}
