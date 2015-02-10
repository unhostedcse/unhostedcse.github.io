/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

function Part(source) {
    var self = this;
    var headers = getHeaders();

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
        var addresses = technalxs.simplemail.SimpleMailModel.SimpleMailAddress.parseList(list);
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
            body = atob_fixed(stripCRLFs(body));
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
        var name = getFileName() || technalxs.simplemail.SimpleMailUtils.getUniqueId();
        attachments[name] = body;
        var cid = getContentId();
        var disposition = self.getHeader("Content-Disposition");
        var type = self.getHeader("Content-Type");
        if (name) {
            technalxs.simplemail.SimpleMailMessageEncoder.ContentDisposition[name] = disposition;
            technalxs.simplemail.SimpleMailMessageEncoder.ContentType[name] = type;
        }
        if (cid) {
            for (var i in cid) {
                technalxs.simplemail.SimpleMailMessageEncoder.ContentId[i] = cid;
            }
            technalxs.simplemail.SimpleMailMessageEncoder.cidNames[cid] = name
        }
        ;

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
            if (!ContentType || ContentType.match(/text\/plain/i)) {
                //return technalxs.simplemail.SimpleMailText.toHtml(body);
                return textToHtml(body);
            }
            else if (ContentType.match(/text\/html/i)) {
                return repairHtml(body);
            }
            else if (ContentType.match(/message\/rfc822/i)) {
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
