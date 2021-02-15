Date: 17 May 2012

# Combining DOM handleEvent and Backbone views

I'm sure for most of you it's old news, but here's a short reminder anyway:

    song = {
      // this function will be invoked with correct context
      handleEvent: function (event) {
        switch (event.type) {
          case: "click":
            console.log(this.name);
            break;
      },
      name: "Yesterday"
    };

    // songNode is a DOM object
    songNode.addEventListener("click", song, false);

We can use an object `obj` that has `handleEvent` property as a second parameter on `addEventListener` and `removeEventListener` on a DOM element object to catch
its DOM events and have event handler’s context set to that object `obj` without
the use of `Function.prototype.bind`.

This comes in handy when working with Backbone views:

    var SongView = Backbone.View.extend({
      handleEvent: function (e) {
        switch (e.type) {
          case "loadeddata":
            this.trigger('loaded');
            break;
          case "ended":
            this.trigger('ended');
            break;
          case "error":
            this.trigger('error');
            break;
          }
      },
      initialize: function () {
        var events = ['loadeddata', 'ended', 'error'];
        _.forEach(events, function (eventType) {
          this.el.addEventListener(eventType, this, false);
        }, this);
      }
    });


Following the example above eliminates the need to bind all DOM events handler (saving on many closures), places the event handling logic in one place and allows for easy removal of previously set handlers, without repetitively storing refences to these handlers.


This technique can also be handy to react to DOM events of a media element (or any DOM elemennt that you can get a reference of), if you'd like the handling logic to be part of the view.


Of course, in real project the code to attach the event handlers should live somewhere in library files, so that all inheriting views would extend this functionality. The event handlers also have to be unbound upon view’s removal.
