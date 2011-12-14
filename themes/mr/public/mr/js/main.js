(function() {
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
      if (nextMonth === 12) {
        nextMonth = 0;
      }
      return $('.home-availability-date').text(months[nextMonth] + ' ' + now.getFullYear());
    }
  };
  $(document).ready(UTIL.load);
}).call(this);
