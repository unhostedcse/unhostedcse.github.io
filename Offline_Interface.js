function Offline_Interface(res,i){

var isOpera = !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;    // Opera 8.0+ (UA detection to detect Blink/v8-powered Opera)
var isFirefox = typeof InstallTrigger !== 'undefined';   // Firefox 1.0+
var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;    // At least Safari 3+: "[object HTMLElementConstructor]"
var isChrome = !!window.chrome && !isOpera;              // Chrome 1+
var isIE = /*@cc_on!@*/false || !!document.documentMode; 

  this.imaps=i;
  this.type='offline';
  if(isFirefox){
    this.tcp=new TCP_Interface(this);
  }else if(isChrome){
    this.tcp = new TCP_Interface_Chrome(this);
  }else{

  }	   
	Offline_Interface.onResponse=res;
}

Offline_Interface.prototype.result=function(value,id){
  Offline_Interface.onResponse(value,id);  
}

Offline_Interface.prototype.connect = function(){
  //var cmd=new SMTPCommand(null, null, "\\* OK", "\r\n");
  var cmd=new SMTPCommand(null, null, null,null);
  var obj={
        host : 'smtp.gmail.com',
        port : 465,
        sec : 'ssl'
  };
  // var obj={
  //       host : 'autoconfig.thunderbird.net',
  //       port : 443,
  //       sec : 'ssl'
  // };

  this.tcp.connect('connect',JSON.stringify(cmd),JSON.stringify(obj));
  return cmd;
}

Offline_Interface.prototype.ping = function(){
  // var cmd=new SMTPCommand("EHLO unhosted",null,null, /2\d* .*\r\n$/);
  // this.tcp.connect('ehlo',JSON.stringify(cmd));
  // return cmd;
  var domain="gmail.com";
  var req='GET /v1.1/'+domain+' HTTP/1.1'+'\r\n'+
      'Host: autoconfig.thunderbird.net:443'+'\r\n'+      
      '\r\n';
  var cmd=new SMTPCommand(req, null, /^HTTP/, /\r\n/);  
  this.tcp.connect('HTTPGet',JSON.stringify(cmd));
  return cmd;
}

function SMTPCommand(request, onResponse, responseStart, responseEnd) {
  this.request = request;
  this.onResponse = onResponse;
  this.responseStart = responseStart || /^2/;
  this.responseEnd = responseEnd || /\r\n$/;
}