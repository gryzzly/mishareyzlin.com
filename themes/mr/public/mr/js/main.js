(function() {
  var Bob, Human, bob;
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  window.UTIL = {
    fire: function(func, args) {
      if (func !== '' && typeof MR[func] === 'function') {
        return MR[func](args);
      }
    },
    load: function() {
      if ($('body').data('action')) {
        return $.each($('body').data('action').split(/\s+/), function(i, action) {
          return UTIL.fire(action);
        });
      }
    }
  };
  window.MR = {
    age: function() {
      var ageElem, dob, now;
      dob = new Date(1988, 08, 23);
      ageElem = $(".years-age");
      now = new Date();
      return ageElem.text(function() {
        var age, monthDiff;
        age = now.getYear() - dob.getYear();
        monthDiff = now.getMonth() - dob.getMonth();
        if (monthDiff <= 0) {
          if (!(monthDiff === 0 && now.getDay() - dob.getDay() >= 0)) {
            age -= 1;
          }
        }
        return age += (age + '').slice(-1) === '1' ? ' year' : ' years';
      });
    },
    availability: function() {
      var months, nextMonth, now;
      now = new Date();
      months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      nextMonth = now.getMonth() + 1;
      if (nextMonth === 11) {
        nextMonth = 0;
      }
      return $('.home-availability-date').text(months[nextMonth] + ' ' + now.getFullYear());
    }
  };
  $(document).ready(UTIL.load);
  Human = (function() {
    function Human(name, saying) {
      this.name = name;
      this.saying = saying;
    }
    Human.prototype.say = function(saying) {
      return alert(this.name + "says " + saying + "!");
    };
    return Human;
  })();
  Bob = (function() {
    __extends(Bob, Human);
    function Bob() {
      Bob.__super__.constructor.apply(this, arguments);
    }
    Bob.prototype.say = function(saying) {
      return alert(this.name + "sings " + saying);
    };
    return Bob;
  })();
  bob = new Bob("Bob");
}).call(this);
