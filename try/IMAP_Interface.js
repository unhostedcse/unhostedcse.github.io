var isOpera = !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;    // Opera 8.0+ (UA detection to detect Blink/v8-powered Opera)
var isFirefox = typeof InstallTrigger !== 'undefined';   // Firefox 1.0+
var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;    // At least Safari 3+: "[object HTMLElementConstructor]"
var isChrome = !!window.chrome && !isOpera;              // Chrome 1+
var isIE = /*@cc_on!@*/false || !!document.documentMode;

function IMAP_Interface(res,i){
  this.imaps=i;
  this.type='IMAP';
  if(isFirefox){
    this.tcp=new TCP_Interface(this);
  }else if(isChrome){
    this.tcp = new TCP_Interface_Chrome(this);
  }else{

  }	   
	this.tag=0;
	IMAP_Interface.onResponse=res;
}

IMAP_Interface.prototype.send = function(){
	this.tcp.connect('connect');
}

IMAP_Interface.prototype.result=function(value,id){
	IMAP_Interface.onResponse(value,id);	
}

IMAP_Interface.prototype.start = function(obj){
	//var cmd=new Command(null, null, /\* OK/, /\r\n/);   
  var cmd=new Command(null, null, "\\* OK", "\r\n");   
	this.tcp.connect('connect',JSON.stringify(cmd),JSON.stringify(obj));
}

IMAP_Interface.prototype.login = function(obj) {
	this.tag++;
	var cmd=new IMAPCommand(this.tag,"LOGIN " + obj.username + " " + obj.password);
	this.tcp.connect('LOGIN',JSON.stringify(cmd));
}

IMAP_Interface.prototype.select = function(folder) {
	this.tag++;
	var f=function(response) {
      //alert(response);
      var regexp = /\* (\d+) EXISTS/;
      var count = regexp.exec(response)[1];
      return parseInt(count, 10);
    };
	var cmd=new IMAPCommand(this.tag,'SELECT "' + folder+'"',f);
	this.tcp.connect('select',JSON.stringify(cmd));
	return cmd;
}


IMAP_Interface.prototype.ListFolder = function() {
  var f=function(response) {
    //alert(response);        
        //var regexp = /((\HasNoChildren (\w+))[\s)]+){3}/g
      var getres;
      res=response;
      //var regflag1 = /(\\HasNoChildren (\w+))/g;  
       var regexp = /\((.+?)\)/g;
      var regflag1 = /(\\(HasNoChildren|Noselect)( )*(\\(\w+))*)/g;
      //var regflag1 = /(\\(\w+)( )*(\\(\w+))*)/g;

      // var regflag2 = /\"\/\" \"(.*?)\"/g;  
      // var regflag3 = /\"\/\" \"(.*?)\"/g;  

      var regflag2 = /\"(\/|\.)\" (.*?)\r\n/g;  
      var regflag3 = /\"(\/|\.)\" (.*?)\r\n/g;  

      var out=new Array();
      var type,folder,i=0,tmp;

  while((getres = regflag3.exec(res))){      
    type=regflag1.exec(res);
    folder=regflag2.exec(res);

    tmp=regexp.exec(res);

    folder=folder[2].replace(/"/g,"");
    //console.log(folder);

    // true || crome not support contain
    //if(tmp[1].contains('HasNoChildren')){ 
      try{
        if(tmp[1].indexOf('HasNoChildren') >= 0){   
            var ruk={
             type:  (type ? type[5] || null : null),
             folder: folder
            };
            out[i]=ruk;
            i++;
            console.log(ruk);
        }
      }catch(e){
        console.log(e);     
      }
    // console.log(folder+' '+ruk  );    
  }
     
  console.log(out);   
  var isInbox=/inbox/i;

  //Move Inbox mbox at first
    if(out.length>0){
      for (var i = 0; i < out.length; i++) {
        if(out[i].folder.match(isInbox)){
          if(i!=0){
            var tm=out[0];
            out[0]=out[i];
            out[i]=tm;
          }
        }
      };      
    }

    //console.log(out);
    return out;
  }

  this.tag++;
  var cmd=new IMAPCommand(this.tag,"LIST \"\" \"*\"",f);
  this.tcp.connect('ListFolder',JSON.stringify(cmd));
  return cmd;
}

IMAP_Interface.prototype.fetchList = function() {
    var f=function(response) {
      // result.test=response;
      // "UID xx", "RFC822.SIZE yy", "FLAGS (zz)" order may differ
        var regexp = /((UID (\w+)|RFC822.SIZE (\w+)|FLAGS \((.*?)\))[\s)]+){3}/g;
        var regid = /(UID (\w+))/g;
        var regsize = /(RFC822.SIZE (\w+))/g; 
        var regflag = /(FLAGS \((.*?)\))/g;
        var getres, getid, getsize, getflag, sizes = new Array(),ids = new Array();
        var i=0;
        while((getres = regexp.exec(response))){
          getflag = regflag.exec(response);
          var flags = getflag[2];
          getsize = regsize.exec(response);
          getid = regid.exec(response) ;
          if (!flags.match(/Deleted/)) {
            sizes[getid[2]] = getsize[2];
            ids[i++]=getid[2];
            //ids[i++]=[getid[2],getflag[2]];
          }
        }

        var obj={};
        obj.ids=ids;
        obj.sizes=sizes;
        return obj;
        // return ids;

      }

    this.tag++;
    var cmd=new IMAPCommand(this.tag,"FETCH 1:* (UID RFC822.SIZE FLAGS)",f);
	  this.tcp.connect('fetchList',JSON.stringify(cmd));
	  return cmd;

  }

IMAP_Interface.prototype.fetchListFlags = function() {
    var f= function(response) {
      result.test=response;
      // "UID xx", "RFC822.SIZE yy", "FLAGS (zz)" order may differ
        var regexp = /((UID (\w+)|RFC822.SIZE (\w+)|FLAGS \((.*?)\))[\s)]+){3}/g;
        var regid = /(UID (\w+))/g;
        var regsize = /(RFC822.SIZE (\w+))/g; 
        var regflag = /(FLAGS \((.*?)\))/g;
        var getres, getid, getsize, getflag, Flags = new Array();
        while((getres = regexp.exec(response))){
          getflag = regflag.exec(response);
          var flags = getflag[2];
          getsize = regsize.exec(response);
          getid = regid.exec(response) ;
          if (!flags.match(/Deleted/)) {
            Flags[getid[2]] = getflag[2];
          }
        }
        return Flags;
      }

    this.tag++;
    var cmd=new IMAPCommand(this.tag,"FETCH 1:* (UID RFC822.SIZE FLAGS)",f);
    this.tcp.connect('fetchListFlags',JSON.stringify(cmd));
    return cmd;
  }

  IMAP_Interface.prototype.fetchBody = function(uid, headersOnly) {

    var f=function(response) {
        return response.replace(/^.*\r\n|\)?\r\n.*\r\n.*\r\n$/g, "");
    }
    this.tag++;

    //not update seen flag on server
    var cmd=new IMAPCommand(this.tag,"UID FETCH " + uid + (headersOnly ? " (body.peek[header])" : " (body.peek[])"),f);
    
    //var cmd=new IMAPCommand(this.tag,"UID FETCH " + uid + (headersOnly ? " BODY[HEADER]" : " BODY[]"),f);
    this.tcp.connect('fetchBody',JSON.stringify(cmd));
    return cmd;
  }

IMAP_Interface.prototype.fetchOnlyBody = function(uid) {

    var f=function(response) {
        return response.replace(/^.*\r\n|\)?\r\n.*\r\n.*\r\n$/g, "");
    }
    this.tag++;
    //4 uid fetch "+getid[2]+" (body.peek[text])"
    var cmd=new IMAPCommand(this.tag,"UID FETCH " + uid + " (body.peek[text])",f);
    this.tcp.connect('fetchOnlyBody',JSON.stringify(cmd));
    return cmd;
}
  

IMAP_Interface.prototype.expunge = function() {

  var f=function(response) {
  }

  this.tag++;
  var cmd=new IMAPCommand(this.tag,"EXPUNGE ",f);
  this.tcp.connect('expunge',JSON.stringify(cmd));
  return cmd;
}

IMAP_Interface.prototype.logout = function() {

  var f=function(response) {
  }
  this.tag++;
  var cmd=new IMAPCommand(this.tag,"LOGOUT",f);
  this.tcp.connect('logout',JSON.stringify(cmd));
  return cmd;
}

function Command(request, onResponse, responseStart, responseEnd) {
      this.request = request;
      this.onResponse = onResponse;
      this.responseStart = responseStart;
      this.responseEnd = responseEnd;
}


function IMAPCommand(tag,request, onResponse, responseStart, responseEnd) {
	this.request = tag + " " + request;
	this.onResponse = onResponse;
	//this.responseStart = new RegExp("(^|\r\n)" + tag + " OK");
	//this.responseEnd = new RegExp("(^|\r\n)" + tag + " ");
  this.responseStart = "(^|\r\n)" + tag + " OK";
  this.responseEnd = "(^|\r\n)" + tag + " ";
}
