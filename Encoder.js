/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

function Part(source,attachments) {
  //console.log(attachments);
    var self = this;
    var headers = getHeaders();

    Part.ContentDisposition = [];
    Part.ContentType = [];
    Part.ContentId = [];
    Part.cidNames = [];
    // Part.attachments=[];

    function getHeaders() {
        source=source ? source : "";
        var end = source.indexOf("\r\n\r\n");
        return (end != -1) ? source.substr(0, end + 2) : source;
    }

    this.getHeader = function(name) {
        // Headers may be multiline (RFC 2822: "folding")
        var regexp = new RegExp("(^|\\r\\n)" + name +
                " *: *((.|\\r\\n\\s)*) *\\r\\n", "i");
        var result = regexp.exec(headers);
        if (result) {
            result = result[2].replace(/\r\n\s+/g, ""); // Unfold (RFC 2822)
            return decodeHeader(result);
        }
        return "";
    }

    // Removes redundant quotes, etc.
    function cleanAddressList(list) {
        var addresses = SimpleMailAddress.parseList(list);
        return addresses.join(", ");
    }

    this.getAddressHeader = function(name) {
        return cleanAddressList(self.getHeader(name));
    }

    // Decode Quoted Printable string
    function qp(string) {
        return string.replace(/=\r\n|=(..)/g, function($0, $1) {
            return ($0 != "=\r\n") ? String.fromCharCode("0x" + $1) : "";
        });
    }

    function atob_fixed(str) {
        try {
            return str ? atob(str.replace(/=+$/, "")) : str;
        }
        catch (e) {
            return technalxs.simplemail.SimpleMailUtils.error("messageParseError", [e]);
        }
    }

    // Decode Base64 / Quoted Printable encoded header
    function decodeHeader(string) {
        if (string) {
//            technalxs.simplemail.SimpleMailMessageEncoder.charset = message.charset;
            var regexp = /=\?(.*?)\?([BQ])\?(.*?)\?=/gi;
            string = string.replace(regexp, function($0, $1, $2, $3) {
//                technalxs.simplemail.SimpleMailMessageEncoder.charset = $1;
                return $2 == 'B' || $2 == 'b' ? atob_fixed($3)
                        : qp($3).replace(/_/g, " ");
            });
            try {
                // string = technalxs.simplemail.SimpleMailText.toUnicode(string, technalxs.simplemail.SimpleMailMessageEncoder.charset);
                toUnicode(string);// need to fix
            }
            catch (e) {
            }
        }
        return string;
    }

    function getByRegexp(string, regexp) {
        var result = regexp.exec(string);
        return result ? result[1] : "";
    }

    function getContentType() {
        var ContentType = self.getHeader("Content-Type");
        return getByRegexp(ContentType, /([^;\s]*)/);
    }

    function getBoundary() {
        var ContentType = self.getHeader("Content-Type");
        return getByRegexp(ContentType, /boundary *= *['"]?([^;\r'"]*)/i);
    }

    this.getCharset = function() {
        var ContentType = self.getHeader("Content-Type");
        return getByRegexp(ContentType, /charset *= *['"]?([^;\s'"]*)/i);
    }

    function getFileName() {
        var ContentDisposition = self.getHeader("Content-Disposition");
        var ContentType = self.getHeader("Content-Type");
        var regexp = /(file)?name *= *['"]?([^;\r"]*)/i;
        var result = regexp.exec(ContentDisposition) || regexp.exec(ContentType);
        return result ? result[2].replace(/[\'\[\]\(\)]/g, "_") : "";
    }

    function getContentId() {
        var cid = self.getHeader("Content-ID");
        if (cid)
            return cid.replace(/^<|>$/g, "");
    }

    function isAttachment() {
        var ContentDisposition1 = self.getHeader("Content-Disposition");
        var value = getByRegexp(ContentDisposition1, /([^;\s]*)/);
        return value.toLowerCase() == "attachment";
    }

    // String.replace(/\r\n/g, "") on large (10 Mb) strings is time consuming,
    // It's better to split() string, write chunks to a temporary file and then read it back into memory

    function stripCRLFs(string) {
        return string.replace(/\r\n/g, "");
        
        var tmpFile = technalxs.simplemail.SimpleMailFile.createTemporaryFile();
        var chunks = string.split(/\r?\n/);
        for (var i in chunks) {
            tmpFile.write(chunks[i], chunks[i].length);
        }
        string = tmpFile.readFully();
        tmpFile.remove();
        return string;
    }

    function getBody() {
        var start = source.indexOf("\r\n\r\n");
        if (start == -1)
            return "";

        var body = source.substr(start + 4);
        var encoding = self.getHeader("Content-Transfer-Encoding");

        if (encoding.match(/base64/i)) {
            var end = body.lastIndexOf("=");
            if (end != -1)
                body = body.substr(0, end + 1);
            //body = atob_fixed(stripCRLFs(body));
            var type=self.getHeader('Content-Type');
            type=type.split(';')[0];
            // console.log(type);
            //data:application/zip;base64,
            //return encoding+'*'+type+'*'+stripCRLFs(body);
            return 'data:'+type+';base64,'+stripCRLFs(body);
        }
        else if (encoding.match(/quoted-printable/i)) {
            body = qp(body);
        }

//        technalxs.simplemail.SimpleMailMessageEncoder.charset = self.getCharset();
        try {
            body = technalxs.simplemail.SimpleMailText.toUnicode(body, technalxs.simplemail.SimpleMailMessageEncoder.charset);
            if (!message.charset)
                message.charset = technalxs.simplemail.SimpleMailMessageEncoder.charset;
        }
        catch (e) {
        }
        return body;
    }

    function parseMultipart() {
        var html = "";
        var parts = source.split("--" + getBoundary());
        var count = parts.length;
        if (parts[count - 1].match(/^--/))
            count--;

        if (false && technalxs.simplemail.SimpleMailPrefs.getBool("plaintextOnReceive")) {
            var i = getContentType().match(/multipart\/alternative/i) ? count - 1 : 1;

            for (; i >= 1 && i < count; i++) {
                var htmlTemp = htmlTemp + new Part(parts[i]).toHtml();
            }
            html += new Part(parts[1]).toHtml();
            return html;
        }
        else {
            // For multipart/alternative take the latest alternate part
            var i = getContentType().match(/multipart\/alternative/i) ? count - 1 : 1;

            for (; i >= 1 && i < count; i++) {
                html += new Part(parts[i]).toHtml();
            }
            return html;
        }
    }

    function parseAttachment(body) {


      //make attentiom
        var name = getFileName() || MailUtils.getUniqueId();
      //   console.log(body);
      // console.log(name);

        if(!Part.attachments){
          Part.attachments=[];
        }

        Part.attachments[name] = body;

        var cid = getContentId();
        var disposition = self.getHeader("Content-Disposition");
        var type = self.getHeader("Content-Type");
        if (name) {
            Part.ContentDisposition[name] = disposition;
            Part.ContentType[name] = type;
        }
        if (cid) {
            for (var i in cid) {
                Part.ContentId[i] = cid;
            }
            Part.cidNames[cid] = name
        };

        return "";
    }

    // Some mail servers split lines longer than 1000 bytes by inserting "\r\n\s".
    // When such string is inserted inside html attribute, html gets broken.

    function repairHtml(html) {
        return html.replace(/<[^>]+>/g, function(tag) {
            return tag.replace(/["'][^'"]+["']/g, function(attribute) {
                return attribute.replace(/\r\n\s/g, "");
            });
        });
    }

    this.toHtml = function() {
        var ContentType = getContentType();
        if (ContentType.match(/^multipart/i))
            return parseMultipart();

        var body = getBody();

        if (!isAttachment()) {
          // alert('isAttachment '+ContentType);
            if (!ContentType || ContentType.match(/text\/plain/i)) {
                //return technalxs.simplemail.SimpleMailText.toHtml(body);
                return textToHtml(body);
            }else if (ContentType.match(/text\/html/i)) {
                return repairHtml(body);
            }else if (ContentType.match(/message\/rfc822/i)) {
                var msg = technalxs.simplemail.SimpleMailMessageEncoder.parse(body, attachments, technalxs.simplemail.SimpleMailMessageEncoder.cidNames, technalxs.simplemail.SimpleMailMessageEncoder.ContentId, technalxs.simplemail.SimpleMailMessageEncoder.ContentDisposition, technalxs.simplemail.SimpleMailMessageEncoder.ContentType);
                return "<hr>" + msg.toHtml();
            }
        }
        return parseAttachment(body);
    }
    
    function textToHtml (text) {
    var REGEXP_URL = /(https?:\/\/|ftp:\/\/|mailto:)[^\s<>\[\]\(\){}]*/gi;
    //technalxs.simplemail.SimpleMailPrefs.getBool("plaintextOnSend")
    return text.replace(/</g, "&lt;")
               .replace(/\r?\n/g, "<br>")
               .replace(REGEXP_URL, function(url) {
                if (true) {
                  return url;
                } else {
                  return "<a href='" + url + "'>" + url + "</a>";
                } 
    });
  }
}

function toUnicode(theString) {
  var unicodeString = '';
  for (var i=0; i < theString.length; i++) {
    var theUnicode = theString.charCodeAt(i).toString(16).toUpperCase();
    while (theUnicode.length < 4) {
      theUnicode = '0' + theUnicode;
    }
    theUnicode = '\\u' + theUnicode;
    unicodeString += theUnicode;
  }
  return unicodeString;
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


var Encoder= function(){
    var pub={};

pub.createAttachmentHtml = function(url, message) {
    var name = message.file.name;

    // if(technalxs.simplemail.SimpleMailDom.get("body") == null){
    //   var messagehtml =  message.html;
    // } else {
    //   var messagehtml = technalxs.simplemail.SimpleMailDom.get("body").contentDocument.body.innerHTML;
    // }

    var messagehtml =  message.html;

    var myExp = new RegExp('<img src="' + Encoder.url0);
    if(myExp.test(messagehtml) && !technalxs.simplemail.SimpleMailPrefs.getBool("plaintextOnSend")){
      return '<img src="' + url + '"' + 'alt="' + name + '">'
    }
    else {
     return "";
    }
},

pub.encode =function(message) {

    // Base64 encode header
    function encodeHeader(string) {
      if (string && message.charset) {
        for(var i in string) {
          // Do not encode string if it contains only English characters
          if (string.charCodeAt(i) > 127) {
            return "=?" + message.charset + "?B?" +
                   btoa(technalxs.simplemail.SimpleMailText.fromUnicode(string, message.charset)) + "?=";
          }
        }
      }
      return string;
    }

    function addHeader(name, value) {
      headers += name + ": " + value + "\r\n";
    }

    function addAddressHeader(name, value) {
      if (value && message.charset) {
        var addresses = SimpleMailAddress.parseList(value);
        for(var i in addresses) {
          addresses[i].name = encodeHeader(addresses[i].name);
        }
        value = addresses.join(", ");
      }
      if (value) addHeader(name, value);
    }

    // String concatenation on large (10 Mb) strings is time consuming,
    // It's better to write chunks to a temporary file and then read it back into memory

    function addCRLFs(string) {
        return string;
      const CHUNK_LEN = 75;

      var tmpFile = technalxs.simplemail.SimpleMailFile.createTemporaryFile();
      var index = 0;
      var chunk;

      while((chunk = string.substr(index, CHUNK_LEN))) {
        tmpFile.write(chunk, chunk.length);
        tmpFile.write("\r\n", 2);
        index += CHUNK_LEN;
      }
      string = tmpFile.readFully();
      tmpFile.remove();
      return string;
    }

    // Some SMTP servers don't allow lines longer than 1000 bytes (not characters).
    // If line.length > MAX_LEN then insert line break beside nearest white-space.
    // If line has no white-spaces, leave it as it is.

    function splitLongLines(string) {
      const MAX_LEN = 75;

      var result = "";
      var lines = string.split("\r\n");

      for(var i = 0; i < lines.length; i++) {
        var line = lines[i];
        if (!line) continue; // Skip empty lines
        do {
          var index = line.length > MAX_LEN ? line.lastIndexOf(" ", MAX_LEN) : -1;
          result += (index != -1 ? line.substr(0, index) : line) + "\r\n";
        }
        while(index != -1 && (line = line.substr(index + 1)));
      }
      return result;
    }
    
    function encodeBody() {
      var attachments = new Array();

      message.html = SimpleMailText.replaceURLs(message.html,
        function(text, url, image) {
          if (!image && !SimpleMailFile.isLocalURL(url)) return text;
          url = url.replace(/&amp;/gi, "&"); // Decode html entities
          message.attachmentsCount++;

          //var name = SimpleMailFile.getFileName(url);
          var ind=url.replace('file://',"");
          var name=message.file[ind].name;
          // var name=message.file.name;

          attachments[name] = {
            url: url,
            cid: MailUtils.getUniqueId() + "@simplemail"
          };
          
          Encoder.url0 = url;
          var newUrl = SimpleMailFile.getAttachmentURL(message.attachmentsDir, name);
          return Encoder.createAttachmentHtml(newUrl, message);
        });

      // If plaintext remove somes HTML tags      
      if (false && technalxs.simplemail.SimpleMailPrefs.getBool("plaintextOnSend")) {
        var html = message.html.replace(/<[\/]{0,1}(span|font|p|div)[^><]*>/g,"");
        var html = html.replace(/<\s*a[^>]*>(.*?)<\s*\/\s*a>{1,}/ig,"");
      } else {
        var html = "<html>\r\n   <head>\r\n" + "      <meta http-equiv=\"" + 
                   "content-type" + "\"" + " content: text/html; charset=" + message.charset + ">\r\n" +
                   "   </head>\r\n" + "<body>\r\n" + message.html + "\r\n</body>\r\n</html>";
      }
      
      html = SimpleMailText.replaceURLs(html,
        function(text, url) {
          if (!url.match(/^simplemail:/)) return text;

          // var name = technalxs.simplemail.SimpleMailFile.getFileName(url);
          var ind=url.replace('file://',"");
          var name=message.file[ind].name;
          // var name = message.file.name;

          var regexp = url.replace(/[\/\(\)\[\]\{\}\.\+\?]/g, function($0) { return "\\" + $0; });
          return text.replace(new RegExp(regexp, "g"), "cid:" + attachments[name].cid);
        });

      // Replace "bare LFs", some mail servers don't accept them
      html = html.replace(/(^|[^\r])\n+/g, function($0) {
                                             return $0.replace(/\n/g, "\r\n");
                                           });
    // Replace <br> with \r\n
    if (false && technalxs.simplemail.SimpleMailPrefs.getBool("plaintextOnSend")) {
      html = html.replace(/(<br>).*?/g,"\r\n");
      html = "--" + boundary + "\r\n" +
             "Content-Type: text/plain; charset=" + message.charset + "\r\n" +
             "Content-Transfer-Encoding: 7bit\r\n" +
             "\r\n" + technalxs.simplemail.SimpleMailText.fromUnicode(splitLongLines(html), message.charset);
    }
    else { 
      // Replace <br> with <br>\r\n to beautify result html
      html = html.replace(/(<br.*?>)(?!\r)/g, "$1\r\n");  
      html = "--" + boundary + "\r\n" +
             "Content-Type: text/html; charset=" + message.charset + "\r\n" +
             "Content-Transfer-Encoding: 7bit\r\n" +
             "\r\n" + SimpleMailText.fromUnicode(splitLongLines(html), message.charset);
    };

      for(var name in attachments) {
        var attachment = attachments[name];
        var contents = readURL(attachment.url,message.file);

        // var contents;
        // var reader  = new FileReader();
        // reader.readAsDataURL(message.file);        

        // reader.onloadend = function () {
        //     contents = reader.result;
        //     // console.log(reader.result);
        // }

        // while(!contents){};
        

        name = name.toString().replace(/[\'\[\]\(\)] */gi, "_");
        //SimpleMailFile.saveAttachment(message.attachmentsDir, name, contents);

        // if (SimpleMailFile.isImage(attachment.url) || name == "MDNFile.txt") { 
        //   var disposition = "inline";
        // } else {
          var disposition = "attachment";
        // }

        name = encodeHeader(name);

        if(name == "MDNFile.txt") {
          var conType = "message/disposition-notification";
        } else {
          //var conType = SimpleMailFile.getMimeType(attachment.url);
          //var ext = SimpleMailFile.getFileExtension(attachment.url);

          // var conType=message.file.type;
          // var ext=message.file.name.split('.').pop();
          console.log(attachment.url);
          var ind=attachment.url.replace('file://',"");
          var conType=message.file[ind].type;
          var ext=message.file[ind].name.split('.').pop();

          if (ext == "pdf") {
            var conType = "application/pdf";
          }  
        }

        if (false && technalxs.simplemail.SimpleMailPrefs.getBool("plaintextOnSend")) { 
          html += "--" + boundary + "\r\n" +
                  "Content-Type: " + conType +";\r\n" +
                  " name=\"" + name + "\"\r\n" +
                  "Content-Transfer-Encoding: base64\r\n" +
                  // "Content-ID: <" + attachment.cid + ">\r\n" +      // No Content-ID for Eudora
                  "Content-Disposition: attachment;\r\n" +
                  " filename=\"" + name + "\"\r\n" + "\r\n" +
                  addCRLFs(btoa(contents));
        } else {
        
          html += "--" + boundary + "\r\n" +
                  "Content-Type: " + conType + ";\r\n" +
                  " name=\"" + name + "\"\r\n" +
                  "Content-Transfer-Encoding: base64\r\n" +
                  "Content-ID: <" + attachment.cid + ">\r\n" +
                  "Content-Disposition: " + disposition + ";\r\n" +
                  " filename=\"" + name + "\"\r\n" + "\r\n" +
                  contents+"\r\n";
                  // addCRLFs(btoa(contents));        
        }
      }
      
        function readURL(url,atc) {

            //return atUri;
            var ind=attachment.url.replace('file://',"");
            return atc[ind].uri;
            //console.log(message.file.name);
            // return 'data:text/plain;base64,ZGF0YSBwYXNzaW5nLHJlcGx5IGZvcndhcmQgbWFpbCBhZGRpbmcsIFNUQVJUVExTIHN1cHBvcnQKVGltZSBmb3JtYXR0aW5nCg==';
            return 'ZGF0YSBwYXNzaW5nLHJlcGx5IGZvcndhcmQgbWFpbCBhZGRpbmcsIFNUQVJUVExTIHN1cHBvcnQ'+'\r\n'+
                    'KVGltZSBmb3JtYXR0aW5nCg=='+'\r\n'+
                    'KVGltZSBmb3JtYXR0aW5nCg=='+'\r\n';
            // return 'ZGF0YSBwYXNzaW5nLHJlcGx5IGZvcndhcmQgbWFpbCBhZGRpbmcsIFNUQVJUVExTIHN1cHBvcnQKVGltZSBmb3JtYXR0aW5nCg==';
            //alert(url);
          var ioService = Components.classes["@mozilla.org/network/io-service;1"]
                          .getService(Components.interfaces.nsIIOService);
          var bstream = Components.classes["@mozilla.org/binaryinputstream;1"]
                        .createInstance(Components.interfaces.nsIBinaryInputStream);
          var channel = ioService.newChannel(url, null, null);
          
          var input = channel.open();
          bstream.setInputStream(input);
      
          var size, data = "";
          while((size = bstream.available())) {
            data += bstream.readBytes(size);
          }
          return data;
        }
      
      return html + "--" + boundary + "--\r\n";
    }

    var headers = "";
    message.date = new Date().getTime();
    addHeader("Date", DateUtil.toMIME(message.date));
    addAddressHeader("Disposition-Notification-To", message.returnReceiptTo);
    addAddressHeader("From", message.from);
    addHeader("User-Agent", "Unhosted V" + Unhosted_version);
    addHeader("MIME-Version", "1.0");
    addAddressHeader("Reply-To", message.replyTo);
    addAddressHeader("To", message.to);
    addAddressHeader("Cc", message.cc);
    addAddressHeader("Bcc", message.bcc);
    addHeader("Subject", encodeHeader(message.subject));
    var boundary = "----------simplemail" + MailUtils.getUniqueId();
    if(message.subject.match(/^(Rcpt:)/i)){
      addHeader("Content-Type", "multipart/report; report-type=disposition-notification;\r\n boundary=" + boundary);
    } else {
      addHeader("Content-Type", "multipart/related;\r\n boundary=" + boundary);
    }
    return headers + "\r\n" + encodeBody();
  }


return pub;

}();