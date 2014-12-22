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