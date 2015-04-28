var isOpera = !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;    // Opera 8.0+ (UA detection to detect Blink/v8-powered Opera)
var isFirefox = typeof InstallTrigger !== 'undefined';   // Firefox 1.0+
var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;    // At least Safari 3+: "[object HTMLElementConstructor]"
var isChrome = !!window.chrome && !isOpera;              // Chrome 1+
var isIE = /*@cc_on!@*/false || !!document.documentMode;

function SMTP_Interface(res,i){
	this.imaps=i;
	this.type='SMTP';

	if(isFirefox){
	    this.tcp=new TCP_Interface(this);
	}else if(isChrome){
	    this.tcp = new TCP_Interface_Chrome(this);
	}else{

	}	

	this.tag=0;
	SMTP_Interface.onResponse=res;	
}

SMTP_Interface.prototype.result=function(value,id){	
	SMTP_Interface.onResponse(value,id);	
}

SMTP_Interface.prototype.getHostName = function() {
    //var dns = Components.classes["@mozilla.org/network/dns-service;1"].getService(Components.interfaces.nsIDNSService);
    //return dns.myHostName;
    return 'Ubuntu';
}

SMTP_Interface.prototype.start = function(obj) {
	var cmd=new SMTPCommand(null,null,null,null);
	this.tcp.connect('connect',JSON.stringify(cmd),JSON.stringify(obj));
	return cmd;
}

SMTP_Interface.prototype.ehlo = function() {
	var cmd=new SMTPCommand("EHLO " + this.getHostName(),null,null, /2\d* .*\r\n$/);
	this.tcp.connect('ehlo',JSON.stringify(cmd));
	return cmd;
}

SMTP_Interface.prototype.authTls = function() {
    var cmd=new SMTPCommand("STARTTLS",null,null, null);
	this.tcp.connect('authTls',JSON.stringify(cmd));
	return cmd;
}

SMTP_Interface.prototype.authPlain = function(login, password) {
	this.OK = 1;
  	this.NOT_SUPPORTED = 2;
  	this.ERROR = 3;

	var f=function(response) {		
    }

    var cmd=new SMTPCommand("AUTH PLAIN " + btoa("\0" + login + "\0" + password),f, /^/, null);
	this.tcp.connect('authPlain',JSON.stringify(cmd));
	return cmd;
}

SMTP_Interface.prototype.authLogin = function() {
	this.OK = 1;
  	this.NOT_SUPPORTED = 2;
  	this.ERROR = 3;

	var f=function(response) {
    }

    var cmd=new SMTPCommand("AUTH LOGIN", f, /^/, null);
	this.tcp.connect('authLogin',JSON.stringify(cmd));
	return cmd;
}

SMTP_Interface.prototype.authLoginLogin = function(login) {
    var cmd=new SMTPCommand(btoa(login), null, /^334/, null);
	this.tcp.connect('authLoginLogin',JSON.stringify(cmd));
	return cmd;
}

SMTP_Interface.prototype.authLoginPassword = function(password) {
    var cmd=new SMTPCommand(btoa(password), null, null, null);
	this.tcp.connect('authLoginPassword',JSON.stringify(cmd));
	return cmd;
}

SMTP_Interface.prototype.mail = function(email) {
    var cmd=new SMTPCommand("MAIL FROM:" + email,null,null, null);
	this.tcp.connect('mail',JSON.stringify(cmd));
	return cmd;
}

SMTP_Interface.prototype.rcpt = function(email) {
    var cmd=new SMTPCommand("RCPT TO:" + email,null,null, null);
	this.tcp.connect('rcpt',JSON.stringify(cmd));
	return cmd;
}

SMTP_Interface.prototype.data = function() {
    var cmd=new SMTPCommand("DATA", null, /^354/, null);
	this.tcp.connect('data',JSON.stringify(cmd));
	return cmd;
}

SMTP_Interface.prototype.dataSend = function(text) {
    var cmd=new SMTPCommand(text + "\r\n.",null,null, null);
	this.tcp.connect('dataSend',JSON.stringify(cmd));
	return cmd;
}

SMTP_Interface.prototype.quit = function() {
    var cmd=new SMTPCommand("QUIT",null,null,null);
	this.tcp.connect('quit',JSON.stringify(cmd));
	return cmd;
}

function SMTPCommand(request, onResponse, responseStart, responseEnd) {
	this.request = request;
	this.onResponse = onResponse;
	this.responseStart = responseStart || /^2/;
	this.responseEnd = responseEnd || /\r\n$/;
}

