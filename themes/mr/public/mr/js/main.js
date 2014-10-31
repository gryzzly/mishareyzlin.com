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
    availability: function() {
      var months, nextMonth, now, year;
      now = new Date();
      year = now.getFullYear();
      months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      nextMonth = now.getMonth() + 1;
      if (nextMonth === 12) {
        nextMonth = 0;
        year += 1;
      }
      return $('.home-availability-date').text("" + months[nextMonth] + " " + year);
    }
  };
  $(document).ready(UTIL.load);
}).call(this);
