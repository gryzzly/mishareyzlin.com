# slightly simplified GARBER-IRISH init
# http://www.viget.com/inspire/extending-paul-irishs-comprehensive-dom-ready-execution/
window.UTIL = 
  fire : ( func, args ) -> 
    MR[func](args) if func isnt '' and typeof MR[func] is 'function' 
  load : ->
    if $('body').data('action')
      $.each $('body').data('action').split(/\s+/), ( i, action ) ->
        UTIL.fire( action )

# main object
window.MR =
  # full years of age 
  age : ->
    dob = new Date( 1988, 08, 23 )
    ageElem  = $ ".years-age"
    now = new Date()

    ageElem.text ->
      age = now.getYear() - dob.getYear()
      monthDiff = now.getMonth() - dob.getMonth()
      if monthDiff <= 0
        unless monthDiff is 0 && now.getDay() - dob.getDay() >= 0
          age -= 1
      age += if ( age + '' ).slice(-1) is '1' then ' year' else ' years'
      
  # next month 
  availability : ->
    now = new Date()
    months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ]
    nextMonth = now.getMonth() + 1
    # in December, select January
    nextMonth = 0 if nextMonth is 11
    # returns "%Month% %YEAR%"
    $('.home-availability-date').text months[nextMonth] + ' ' + now.getFullYear()

$(document).ready UTIL.load



class Human
  constructor: (@name, @saying) ->
    
  say: (saying) ->
    alert @name + "says " + saying + "!"
    
class Bob extends Human
  say:(saying) ->
    alert @name + "sings " + saying
  
bob = new Bob("Bob")