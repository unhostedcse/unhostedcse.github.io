DateUtil = function(){
  var pub = {};
  
  pub.toMIME = function(date) {
    date = new Date(date);
    return date.toString().replace(/(^\w+) (\w+) (\w+) (.*) GMT(.*)/,
                                   "$1, $3 $2 $4 $5");
  },

  pub.toString = function(date) {
    date = new Date(date);
    if (!date.getTime()) return "";

    var timeZone = - date.getTimezoneOffset() / 60;
    if (true) {
    return pad(date.getDate()) + "/" +
           pad(date.getMonth() + 1) + "/" +
           date.getFullYear().toString().substr(2) + " " +
           pad(date.getHours()) + ":" +
           pad(date.getMinutes()) + ":" +
           pad(date.getSeconds());    
    }
    else { 
    return pad(date.getMonth() + 1) + "/" +
           pad(date.getDate()) + "/" +
           date.getFullYear().toString().substr(2) + " " +
           pad(date.getHours()) + ":" +
           pad(date.getMinutes()) + ":" +
           pad(date.getSeconds());
    }
  },

  pub.toShortString = function(date) {
    date = new Date(date);
    if (!date.getTime()) return "";

    var timeZone = - date.getTimezoneOffset() / 60;
    return pad(date.getDate()) + "/" +
           pad(date.getMonth() + 1) + "/" +
           date.getFullYear().toString().substr(2);
  },

  pub.toGMT = function(date) {
    date = new Date(date);
    if (!date.getTime()) return "";

    var gmt = new Date(date.getTime() + date.getTimezoneOffset() * 60 * 1000);
    return gmt.getFullYear() + "-" +
           pad(gmt.getMonth() + 1) + "-" +
           pad(gmt.getDate()) + " " +
           pad(gmt.getHours()) + ":" +
           pad(gmt.getMinutes()) + ":" +
           pad(gmt.getSeconds()) + " GMT";
  },

  pub.timePassed = function(date) {
    if (date) {
      var seconds = Math.floor((new Date() - date) / 1000);
      var hours = Math.floor(seconds / 3600);
      seconds = seconds - hours * 3600;
      var minutes = Math.floor(seconds / 60);
      seconds = seconds - minutes * 60;
      return pad(hours) + ":" +
             pad(minutes) + ":" +
             pad(seconds);
    }
  },

  pub.parse = function(date) {
    // Convert short year to full
    date = date.replace(/(\w+, \d+ \w+) (\d{2}) /, "$1 20$2 ");
    return Date.parse(date);
  }
  return pub;
}();

function pad(number){
    return (number < 10) ? "0" + number : number;  
}