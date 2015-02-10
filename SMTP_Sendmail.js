
SMTP_Sendmail.prototype.func=function(response,id){
    console.log('SMTP '+id+'> '+response);
    
     if(SMTP_Sendmail.smtp.onTheResponse){
        var val=SMTP_Sendmail.smtp.onTheResponse(response);
        SMTP_Sendmail.smtp.onTheResponse=null;        
        if(SMTP_Sendmail.cmds.length > SMTP_Sendmail.nextFuncIndex+1){
          nextFunc=SMTP_Sendmail.cmds[++SMTP_Sendmail.nextFuncIndex];
        }
        SMTP_Sendmail.smtp.setVal(val,nextFunc);
    }else{
        if(SMTP_Sendmail.cmds.length > SMTP_Sendmail.nextFuncIndex+1){
          nextFunc=SMTP_Sendmail.cmds[++SMTP_Sendmail.nextFuncIndex];

          var para="";
          if(nextFunc instanceof Array){
            para=nextFunc[1];
            nextFunc=nextFunc[0];
          }
          nextFunc(para);
        }
    }

}

function SMTP_Sendmail(id){
  SMTP_Sendmail.smtp = new SMTP_Interface(this.func,id);
  SMTP_Sendmail.cmds = new Array();
  SMTP_Sendmail.nextFuncIndex=0;
}

SMTP_Sendmail.prototype.start = function(){
    var obj={
        host : smtphost,
        port : smtpport,
        sec : smtpsecurity
    };

    SMTP_Sendmail.smtp.start(obj);
}

SMTP_Sendmail.prototype.ehlo = function(){
    SMTP_Sendmail.smtp.ehlo();
}

SMTP_Sendmail.prototype.authTls = function(){
    SMTP_Sendmail.smtp.authTls();
}

SMTP_Sendmail.prototype.authLogin = function(){
    cmd=SMTP_Sendmail.smtp.authLogin();
}

SMTP_Sendmail.prototype.authLoginLogin = function(){
    //SMTP_Sendmail.smtp.authLoginLogin('unhostedcse@gmail.com');
    SMTP_Sendmail.smtp.authLoginLogin(username);
}

SMTP_Sendmail.prototype.authLoginPassword = function(){
    //SMTP_Sendmail.smtp.authLoginPassword('unhostedcse12345');
    SMTP_Sendmail.smtp.authLoginPassword(password);
}

SMTP_Sendmail.prototype.authPlain = function(){
    cmd=SMTP_Sendmail.smtp.authPlain(username,password);
}

SMTP_Sendmail.prototype.mail = function(){
    //SMTP_Sendmail.smtp.mail('<unhostedcse@gmail.com>');
    SMTP_Sendmail.smtp.mail('<'+username+'>');
}

SMTP_Sendmail.prototype.rcpt = function(mailto){
    // SMTP_Sendmail.smtp.rcpt('<unhostedcse@gmail.com>');
    // console.log('rcpt: '+mailto);
    SMTP_Sendmail.smtp.rcpt('<'+mailto+'>');  
}
SMTP_Sendmail.prototype.data = function(){
    SMTP_Sendmail.smtp.data();
}
SMTP_Sendmail.prototype.dataSend = function(){
    SMTP_Sendmail.smtp.dataSend(body);
}
SMTP_Sendmail.prototype.quit = function(){
    SMTP_Sendmail.smtp.quit();
}

SMTP_Sendmail.prototype.send = function(fun){  
  SMTP_Sendmail.cmds.push(this.start);
  SMTP_Sendmail.cmds.push(this.ehlo);
  
  if(smtpsecurity=='tls'){
    //alert('tls');
    SMTP_Sendmail.cmds.push(this.ehlo);
    SMTP_Sendmail.cmds.push(this.authTls);
    SMTP_Sendmail.cmds.push(this.ehlo);
    SMTP_Sendmail.cmds.push(this.authLogin);
    SMTP_Sendmail.cmds.push(this.authLoginLogin);
    SMTP_Sendmail.cmds.push(this.authLoginPassword);
  }else if(smtpsecurity=='ssl'){
    //alert('ssl');
    SMTP_Sendmail.cmds.push(this.authLogin);
    SMTP_Sendmail.cmds.push(this.authLoginLogin);
    SMTP_Sendmail.cmds.push(this.authLoginPassword);
  }else{
    //alert('plan');
    //SMTP_Sendmail.cmds.push(this.authPlain);
  }


  SMTP_Sendmail.cmds.push(this.mail);
  
  for(var i=0;i<mailto.length;i++){
    SMTP_Sendmail.cmds.push([this.rcpt,mailto[i]]);
  }

  // SMTP_Sendmail.cmds.push([this.rcpt,'unhostedcse@gmail.com']);
  // SMTP_Sendmail.cmds.push([this.rcpt,'unhostedcse@outlook.com']);

  SMTP_Sendmail.cmds.push(this.data);

  SMTP_Sendmail.cmds.push(this.dataSend);
  SMTP_Sendmail.cmds.push(this.quit);


  SMTP_Sendmail.cmds.push(fun);                 // called when all command executed
  SMTP_Sendmail.cmds.push(this.clearCmds);  

  SMTP_Sendmail.nextFuncIndex=0;
  var f=SMTP_Sendmail.cmds[SMTP_Sendmail.nextFuncIndex];
  f();
}



SMTP_Sendmail.prototype.sendmail = function(func){
  this.send(func);                // passs the last function
}

SMTP_Sendmail.prototype.clearCmds=function (){
  console.log('SMTP cmds clearing> ');
  SMTP_Sendmail.cmds=[];
}

SMTP_Sendmail.prototype.parse = function(text) {
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

SMTP_Sendmail.prototype.parseList = function(text) {
  var addresses = new Array();
  if (text) {
    var list = ("" + text).split(/[,;]/);
    for(var i in list) {
      var address = this.parse(list[i]);
      if (address) addresses.push(address);
    }
  }
  return addresses;
}

SimpleMailAddress = function(id, name, email, group, favorite, postaladdress, phone) {
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