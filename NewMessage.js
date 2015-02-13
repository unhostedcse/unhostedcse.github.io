NewMessage= function(){
  var pub = {};

  pub.createForward = function(msg) {

    var forward = new MessageModel();
    forward.from=msg.From;
    // forward.accountId = this.accountId;
    // forward.charset = this.charset;
    forward.subject = msg.Subject.replace(/^(Fwd?: )?/i, "Fwd: ");
    if (true || technalxs.simplemail.SimpleMailPrefs.getBool("plaintextOnSend")) {
      forward.body = "<br><br> -- Message -- <br><br>" + msg.body;
      return forward;
    } else {
      forward.body = "<br><br><hr>" + msg.body;
      return forward;
    }
    // return 'createForward';
  },

  pub.createReply = function(msg) {

    var reply = new MessageModel();
      // reply.accountId = this.accountId;
      // reply.charset = this.charset;
      reply.to = msg.From;     
      reply.subject = msg.Subject.replace(/^(Re: )?/i, "Re: ");

    return reply;
  } 

  return pub;

}();

function MessageModel(subject,body,to,cc,bcc){
    this.subject=subject;
    this.body=body;
    this.to=to;
    this.cc=cc;
    this.bcc=bcc;
}

this.createReply = function(all) {
      var reply = new technalxs.simplemail.SimpleMailModel.SimpleMailMessage();
      reply.accountId = this.accountId;
      reply.charset = this.charset;
      reply.to = this.replyTo || this.from;
      if (all) {
        if (this.to) reply.to += ", " + this.to;
        reply.cc = this.cc;
        reply.bcc = this.bcc;
      }
      reply.subject = this.subject.replace(/^(Re: )?/i, "Re: ");
      // Remove attachments
      reply.html = technalxs.simplemail.SimpleMailText.replaceURLs(this.html,
        function(text, url) {
          return technalxs.simplemail.SimpleMailFile.isLocalURL(url)
             ? technalxs.simplemail.SimpleMailBundle.getString("attachments") + " : " + "[" + technalxs.simplemail.SimpleMailFile.getFileName(url) + "]" + "<br>" : text;
        });

      if (technalxs.simplemail.SimpleMailPrefs.getBool("plaintextOnSend")) {
        this.from = this.from.replace(/<[\/]{0,1}/ig,"(");
        this.from = this.from.replace(/>[\/]{0,1}/ig,")");
        reply.html = "<br><br><span style='color: gray;'>" +
                     technalxs.simplemail.SimpleMailPrefs.getString("reply")
                            .replace(/{author}/gi, this.from)
                            .replace(/{date}/gi, technalxs.simplemail.SimpleMailDate.toString(this.date))
                            .replace(/{date-gmt}/gi, technalxs.simplemail.SimpleMailDate.toGMT(this.date))
                            .replace(/{date-locale}/gi, new Date(this.date).toLocaleString())
                            .replace(/{subject}/gi, this.subject) +
                     "</span><br>" +
                     "<span style='font-style: italic'>" + reply.html + "</span>"
        return reply;
      } else {
        reply.html = "<br><br><span style='color: gray;'>" +
                     technalxs.simplemail.SimpleMailPrefs.getString("reply")
                            .replace(/{author}/gi, technalxs.simplemail.SimpleMailModel.SimpleMailAddress.parse(this.from).toHtml())
                            .replace(/{date}/gi, technalxs.simplemail.SimpleMailDate.toString(this.date))
                            .replace(/{date-gmt}/gi, technalxs.simplemail.SimpleMailDate.toGMT(this.date))
                            .replace(/{date-locale}/gi, new Date(this.date).toLocaleString())
                            .replace(/{subject}/gi, this.subject) +
                     "</span><br>" +
                     "<blockquote style='border-left: 1px solid rgb(204, 204, 204);" +
                                        "margin: 0 0 0 0.8ex;" +
                                        "padding: 1ex 0 0 1ex;'>" + reply.html + "</blockquote>";
        return reply;      
      }                                
    }    

//////

//SimpleMailMessage
var NewMessageModel = function(id, accountId, uid, from, to, cc, bcc, subject, date, size, charset,
                     read, deleted, attachmentsDir, attachmentsCount, html, folderId,
                     partial, template, color, returnReceiptTo, replyTo, spam, replied, fwd) {
    this.id = id;
    this.accountId = accountId;
    this.uid = uid;
    this.from = from;
    this.to = to || "";
    this.cc = cc || "";
    this.bcc = bcc || "";
    this.subject = subject;
    this.date = date;
    this.size = size;
    this.charset = charset;
    this.read = read;
    this.deleted = deleted;
    //this.attachmentsDir = attachmentsDir || technalxs.simplemail.SimpleMailUtils.getUniqueId();
    this.attachmentsCount = attachmentsCount || 0;
    this.html = html;
    this.folderId = folderId;
    this.partial = partial;
    this.template = template;
    this.color = color;
    this.returnReceiptTo = returnReceiptTo;
    this.replyTo = replyTo;
    this.spam = spam;
    this.replied = replied;
    this.fwd = fwd;
      
    this.contentType;
    this.source;
    this.file;
  
    this.getSize = function() {
      if (this.size == null) {
        this.size = this.toString().length;
      }
      return this.size;
    }
  
    this.toString = function() {
      if (!this.source) {
        this.source = Encoder.encode(this);
      }
      return this.source;
    }
  
    this.toHtml = function() {
      function mailList2html(value) {
        var addresses = technalxs.simplemail.SimpleMailModel.SimpleMailAddress.parseList(value);
        var result = "";
        if (technalxs.simplemail.SimpleMailPrefs.getBool("plaintextOnSend")) {
          for(var i in addresses) {
            result += (result ? ", " : "") + addresses[i].toString();
          }
          result = result.replace(/<[\/]{0,1}/ig,"(");
          result = result.replace(/>[\/]{0,1}/ig,")");
          return result;
        } else {
          for(var i in addresses) {
            result += (result ? ", " : "") + addresses[i].toHtml();
          }
          return result;
        }
      }

      if (technalxs.simplemail.SimpleMailPrefs.getBool("plaintextOnSend") && this.from) {
        this.from = this.from.replace(/<[\/]{0,1}/ig,"(");
        this.from = this.from.replace(/>[\/]{0,1}/ig,")");
        var from = this.from
      } else {
        var from = this.from ? technalxs.simplemail.SimpleMailModel.SimpleMailAddress.parse(this.from).toHtml() : "";
      }
      return "<span style='color: gray;'>" +
             "From: " + from + "<br>" +
             "To: " + mailList2html(this.to) + "<br>" + 
             (this.cc ? "Cc: " + mailList2html(this.cc) + "<br>" : "") +
             "Date: " + technalxs.simplemail.SimpleMailDate.toString(this.date) + "<br>" +
             "Subject: " + this.subject + "<br>" +
             "</span><br>" + this.html;
    }

    this.toHtmlReceipt = function() {
      function mailList2html(value) {
        var addresses = technalxs.simplemail.SimpleMailModel.SimpleMailAddress.parseList(value);
        var result = "";
        for(var i in addresses) {
          result += (result ? ", " : "") + addresses[i].toHtml();
        }
        return result;
      }
      var from = this.from ? technalxs.simplemail.SimpleMailModel.SimpleMailAddress.parse(this.from).toHtml() : "";
      return "<span style='color: gray;'>" +
             "From: " + from + "<br>" +
             "To: " + mailList2html(this.to) + "<br>" + 
             (this.cc ? "Cc: " + mailList2html(this.cc) + "<br>" : "") +
             "Date: " + technalxs.simplemail.SimpleMailDate.toString(this.date) + "<br>" +
             "Subject: " + this.subject + "<br>" +
             "</span><br>";
    }

    this.createReply = function(all) {
      var reply = new technalxs.simplemail.SimpleMailModel.SimpleMailMessage();
      reply.accountId = this.accountId;
      reply.charset = this.charset;
      reply.to = this.replyTo || this.from;
      if (all) {
        if (this.to) reply.to += ", " + this.to;
        reply.cc = this.cc;
        reply.bcc = this.bcc;
      }
      reply.subject = this.subject.replace(/^(Re: )?/i, "Re: ");
      // Remove attachments
      reply.html = technalxs.simplemail.SimpleMailText.replaceURLs(this.html,
        function(text, url) {
          return technalxs.simplemail.SimpleMailFile.isLocalURL(url)
             ? technalxs.simplemail.SimpleMailBundle.getString("attachments") + " : " + "[" + technalxs.simplemail.SimpleMailFile.getFileName(url) + "]" + "<br>" : text;
        });

      if (technalxs.simplemail.SimpleMailPrefs.getBool("plaintextOnSend")) {
        this.from = this.from.replace(/<[\/]{0,1}/ig,"(");
        this.from = this.from.replace(/>[\/]{0,1}/ig,")");
        reply.html = "<br><br><span style='color: gray;'>" +
                     technalxs.simplemail.SimpleMailPrefs.getString("reply")
                            .replace(/{author}/gi, this.from)
                            .replace(/{date}/gi, technalxs.simplemail.SimpleMailDate.toString(this.date))
                            .replace(/{date-gmt}/gi, technalxs.simplemail.SimpleMailDate.toGMT(this.date))
                            .replace(/{date-locale}/gi, new Date(this.date).toLocaleString())
                            .replace(/{subject}/gi, this.subject) +
                     "</span><br>" +
                     "<span style='font-style: italic'>" + reply.html + "</span>"
        return reply;
      } else {
        reply.html = "<br><br><span style='color: gray;'>" +
                     technalxs.simplemail.SimpleMailPrefs.getString("reply")
                            .replace(/{author}/gi, technalxs.simplemail.SimpleMailModel.SimpleMailAddress.parse(this.from).toHtml())
                            .replace(/{date}/gi, technalxs.simplemail.SimpleMailDate.toString(this.date))
                            .replace(/{date-gmt}/gi, technalxs.simplemail.SimpleMailDate.toGMT(this.date))
                            .replace(/{date-locale}/gi, new Date(this.date).toLocaleString())
                            .replace(/{subject}/gi, this.subject) +
                     "</span><br>" +
                     "<blockquote style='border-left: 1px solid rgb(204, 204, 204);" +
                                        "margin: 0 0 0 0.8ex;" +
                                        "padding: 1ex 0 0 1ex;'>" + reply.html + "</blockquote>";
        return reply;      
      }                                
    }
  
    this.createForward = function() {
      var forward = new technalxs.simplemail.SimpleMailModel.SimpleMailMessage();
      forward.accountId = this.accountId;
      forward.charset = this.charset;
      forward.subject = this.subject.replace(/^(Fwd?: )?/i, "Fwd: ");
      if (technalxs.simplemail.SimpleMailPrefs.getBool("plaintextOnSend")) {
        forward.html = "<br><br> -- Message -- <br><br>" + this.toHtml();
        return forward;
      } else {
        forward.html = "<br><br><hr>" + this.toHtml();
        return forward;
      }
    }
  
    this.createReturnReceipt = function(recipient, message) {
      var source = technalxs.simplemail.SimpleMailFile.getAttachmentsDirectory(message.attachmentsDir);
      source.append(technalxs.simplemail.SimpleMailFile.MESSAGE_SOURCE);
      source = technalxs.simplemail.SimpleMailFile.readFile(source);
      var originalMessageID = source.match(/^Message-ID:[^<]*<(.*?)>/gim)
      originalMessageID = originalMessageID.toString().match(/<.*>/);
          
      var receipt = new technalxs.simplemail.SimpleMailModel.SimpleMailMessage();
      receipt.accountId = this.accountId;
      receipt.from = recipient;
      receipt.to = this.returnReceiptTo;
      receipt.charset = "utf-8";
      receipt.subject = "Rcpt: " + this.subject;

      var html = technalxs.simplemail.SimpleMailBundle.getString("receipt") + "<br>" + technalxs.simplemail.SimpleMailBundle.getString("date") +" : " + technalxs.simplemail.SimpleMailDate.toString(new Date().getTime()) + " - " + technalxs.simplemail.SimpleMailBundle.getString("messageReceived")+" :<br><hr>";

      // Create MDNFile.txt
      var file = technalxs.simplemail.SimpleMailFile.getAttachmentsDirectory(receipt.attachmentsDir);
      file.append("MDNFile.txt");
      var out = technalxs.simplemail.SimpleMailFile.createOutputStream(file);
      out.write("Reporting-UA: SimpleMail V2.86.7" + "\r\n");
      out.write("Final-Recipient: rfc822;" + receipt.from + "\r\n");
      out.write("Original-Message-ID: " + originalMessageID + "\r\n");
      if (technalxs.simplemail.SimpleMailPrefs.getString("sendreceiptresp") == "asksend") {
        out.write("Disposition: manual-action/MDN-sent-manually; displayed" + "\r\n");
      } else {
        out.write("Disposition: automatic-action/MDN-sent-automatically; displayed" + "\r\n");
      }
      out.close();
            
      // Attach MDNFile.txt
      var url = technalxs.simplemail.SimpleMailFile.getFileURL(file);
      var filename = technalxs.simplemail.SimpleMailFile.getFileName(url);
      var background = technalxs.simplemail.SimpleMailMessageEncoder.getIconForAttachment(filename);
      html += "<a class='attachment' style='background: url(" + background + ")center left no-repeat;' href='" + url + "'>" + filename + "</a>";
      receipt.html = html + this.toHtmlReceipt() + "<hr>";
      return receipt;
    }
  
    var fields = ["from", "to", "cc", "bcc", "subject", "charset",
                  "html", "returnReceiptTo"];
  
    this.equals = function(message) {
      if (message == null) return true;
      for(var i in fields) {
        var field = fields[i];
        if (this[field] != message[field]) return false;
      }
      return true;
    }
  
    this.copyTo = function(message) {
      for(var i in fields) {
        var field = fields[i];
        message[field] = this[field];
      }
    }
  
    this.recode = function(charset) {
      try {
        var message = new technalxs.simplemail.SimpleMailModel.SimpleMailMessage();
        for(var i in fields) {
          var field = fields[i];
          message[field] = technalxs.simplemail.SimpleMailText.fromUnicode(this[field], this.charset);
          message[field] = technalxs.simplemail.SimpleMailText.toUnicode(message[field], charset);
        }
        message.charset = charset;
        // If no exceptions, update original message
        message.copyTo(this);
      }
      catch(e) {}
    }
  }