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

function SimpleMailAddress(id, name, email, group, favorite, postaladdress, phone) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.group = group;
    this.favorite = favorite;
    this.postaladdress = postaladdress;
    this.phone = phone;
  
    this.getLogin = function() {
      return /(.*)@/.exec(this.email)[1];
    }
    this.getHost = function() {
      return /@(.*)/.exec(this.email)[1];
    }
    this.toString = function() {
      return this.name + (this.name && this.email ? " " : "") +
             (this.email ? "<" + this.email + ">" : "");
    }
    this.toHtml = function() {
      return this.name + (this.name && this.email ? " " : "") +
             (this.email ? "&lt;<a href='mailto:" + this.email + "'>" +
                           this.email + "</a>&gt;" : "");
    }
  }

SimpleMailAddress.parse = function(text) {
  if (!text) return;

  var name, email;
  text = text.replace(/[^'"\s<>]+@[^'"\s<>]+/, function($0) {
    email = $0;
    return "";
  });
  name = text.replace(/^['"\s<>]*|['"\s<>]*$/g, "");
  if (name || email) {
    return new SimpleMailAddress(null, name, email);
  }
}

SimpleMailAddress.parseList = function(text) {
  var addresses = new Array();
  if (text) {
    var list = ("" + text).split(/[,;]/);
    for(var i in list) {
      var address = SimpleMailAddress.parse(list[i]);
      if (address) addresses.push(address);
    }
  }
  return addresses;
}



var SimpleMailText = function (){
  var pub ={};

  pub.REGEXP_URL = /(https?:\/\/|ftp:\/\/|mailto:)[^\s<>\[\]\(\){}]*/gi,
  pub.REGEXP_LINK = /<img[\s\S]*?src=['"](.*?)['"][\s\S]*?>|<a[\s\S]*?href=['"](.*?)['"][\s\S]*?<\/a>/gi,

  pub.getURL = function(text) {
    var match = ("" + text).match(technalxs.simplemail.SimpleMailText.REGEXP_URL);
    return match && match[0];
  },

  pub.toHtml = function(text) {
    return text.replace(/</g, "&lt;")
               .replace(/\r?\n/g, "<br>")
               .replace(technalxs.simplemail.SimpleMailText.REGEXP_URL, function(url) {
                if (technalxs.simplemail.SimpleMailPrefs.getBool("plaintextOnSend")) {
                  return url;
                } else {
                  return "<a href='" + url + "'>" + url + "</a>";
                } 
    });
  },
  
    
  pub.linkToLink = function(html) {
    return html.replace(technalxs.simplemail.SimpleMailText.REGEXP_URL, function(url) {
      return "<a href='" + url + "'>" + url + "</a>";
    });
  },

  pub.linkToText = function(html, onUrl) {
    return technalxs.simplemail.SimpleMailText.replaceURLs(html, function(text, url) {
      if (text.match(/href\=\"simplemail\:\/\/attachments/gim)) {
        return  text;
      } else { 
        return  url;
      }
    });
  },

  pub.replaceURLs = function(text, onUrl) {
    return text.replace(SimpleMailText.REGEXP_LINK, function(text, image, anchor) {
      return onUrl(text, image || anchor, image);
    });
  },

  pub.replaceURLs2 = function(text, onUrl) {
    return text.replace(technalxs.simplemail.SimpleMailText.REGEXP_URL, function(text) {
      return onUrl(text);
    });
  },

  pub.imageToLink = function(html) {
    return technalxs.simplemail.SimpleMailText.replaceURLs(html, function(text, url, isImage) {
      return isImage ? "<a href='" + url + "'>" + text + "</a>" : text;
    });
  },

  pub.trim = function(string) {
    return string.replace(/^\s+|\s+$/g, "");
  },

  pub.toUnicode = function(text, charset) {
    try {
      if (!charset) return text;
      var converter = Components.classes["@mozilla.org/intl/scriptableunicodeconverter"]
                      .createInstance(Components.interfaces.nsIScriptableUnicodeConverter);
      converter.charset = charset;
      return converter.ConvertToUnicode(text);
    }
    catch(e) {
      technalxs.simplemail.SimpleMailUtils.error("encodingError");
      throw e;
    }
  },

  pub.fromUnicode = function(text, charset) {
    try {
      if (!charset) return text;
      var converter = Components.classes["@mozilla.org/intl/scriptableunicodeconverter"]
                      .createInstance(Components.interfaces.nsIScriptableUnicodeConverter);
      converter.charset = charset;
      var result = converter.ConvertFromUnicode(text);
      return result + converter.Finish();
    }
    catch(e) {
      technalxs.simplemail.SimpleMailUtils.error("encodingError");
      throw e;
    }
  },

  pub.getSelectedHtml = function(doc) {
    var selection = doc.defaultView.getSelection();
    if (selection.rangeCount) {
      var fragment = selection.getRangeAt(0).cloneContents();
      var div = doc.createElement("div");
      div.appendChild(fragment);
      return div.innerHTML;
    }
  },

  // Highlight given phrase, skipping html tags & entities
  pub.highlight = function(phrase, html) {
    var regexp = new RegExp("(<[\\s\\S]*?>|&.*?;)|(" + phrase + ")", "gi");
    return html.replace(regexp, function($0, $1, $2) {
      return $1 || "<span class='highlight'>" + $2 + "</span>";
    });
  }
  return pub;
}();

var MailUtils = function (){
  var lastUniqueId=0;
  var pub={};
  pub.getUniqueId = function() {
      return lastUniqueId = Math.max(lastUniqueId + 1, new Date().getTime());
  }
  return pub;
}();