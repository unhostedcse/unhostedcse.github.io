var isOpera = !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;    // Opera 8.0+ (UA detection to detect Blink/v8-powered Opera)
var isFirefox = typeof InstallTrigger !== 'undefined';   // Firefox 1.0+
var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;    // At least Safari 3+: "[object HTMLElementConstructor]"
var isChrome = !!window.chrome && !isOpera;              // Chrome 1+
var isIE = /*@cc_on!@*/false || !!document.documentMode;

function Auto_Config_Interface(res,i){
  this.imaps=i;
  this.type='config';
  if(isFirefox){
    this.tcp=new TCP_Interface(this);
  }else if(isChrome){
    this.tcp = new TCP_Interface_Chrome(this);
  }else{

  }	   
	Auto_Config_Interface.onResponse=res;
}

Auto_Config_Interface.prototype.result=function(value,id){
  Auto_Config_Interface.onResponse(value,id);  
}

Auto_Config_Interface.prototype.start = function(){
  var cmd=new Command(null, null, /^HTTP/, /\r\n/);   
  var obj={
        host : 'autoconfig.thunderbird.net',
        port : 443,
        sec : 'ssl'
  };

  this.tcp.connect('connect',JSON.stringify(cmd),JSON.stringify(obj));
  return cmd;
}

Auto_Config_Interface.prototype.HTTPGet = function(domain) {
  var req='GET /v1.1/'+domain+' HTTP/1.1'+'\r\n'+
      'Host: autoconfig.thunderbird.net:443'+'\r\n'+      
      '\r\n';

  var fun=function(response){
    //console.log(response);

    var regStart=/^HTTP\/1.1 200 OK/g;
    var regStop=/<\/clientConfig>\r\n$/g;

    if(response.match(regStart)){
      var ind=response.indexOf('<clientConfig version="1.1">');
      response=response.substring(ind);
    }else{
      console.log('unknown domain');      
      return null;
    }
    
    //document.getElementById('dis').value=value;
    
    try{
      if (window.DOMParser){
        parser=new DOMParser();
        xmlDoc=parser.parseFromString(response,"text/xml");
        var imapHost="//incomingServer[@type='imap']/hostname";
        var imapPort="//incomingServer[@type='imap']/port";
        var imapSec="//incomingServer[@type='imap']/socketType";      
        
        var smtpHost="//outgoingServer[@type='smtp']/hostname";
        var smtpPort="//outgoingServer[@type='smtp']/port";
        var smtpSec="//outgoingServer[@type='smtp']/socketType";
        
        imapHost=xmlDoc.evaluate(imapHost, xmlDoc, null, XPathResult.ANY_TYPE,null).iterateNext();
        imapPort=xmlDoc.evaluate(imapPort, xmlDoc, null, XPathResult.ANY_TYPE,null).iterateNext();
        imapSec=xmlDoc.evaluate(imapSec, xmlDoc, null, XPathResult.ANY_TYPE,null).iterateNext();

        smtpHost=xmlDoc.evaluate(smtpHost, xmlDoc, null, XPathResult.ANY_TYPE,null).iterateNext();
        smtpPort=xmlDoc.evaluate(smtpPort, xmlDoc, null, XPathResult.ANY_TYPE,null).iterateNext();
        smtpSec=xmlDoc.evaluate(smtpSec, xmlDoc, null, XPathResult.ANY_TYPE,null).iterateNext();

        // console.log('IMAP settings');
        // console.log(imapHost.textContent);
        // console.log(imapPort.textContent);
        // console.log(imapSec.textContent);
        
        // console.log('\nSMTP settings');        
        // console.log(smtpHost.textContent);
        // console.log(smtpPort.textContent);
        // console.log(smtpSec.textContent);;

        var conf={
          imaphost:imapHost.textContent,
          imapport:imapPort.textContent,
          imapsec:imapSec.textContent,
          smtphost:smtpHost.textContent,
          smtpport:smtpPort.textContent,
          smtpsec:smtpSec.textContent
        }
        return conf;
      }
    }catch(e){
      console.log(e);
    }

  }

  var cmd=new Command(req, fun, /^HTTP/, /\r\n/);  
  this.tcp.connect('HTTPGet',JSON.stringify(cmd));
  return cmd;
}

function Command(request, onResponse, responseStart, responseEnd) {
      this.request = request;
      this.onResponse = onResponse;
      this.responseStart = responseStart;
      this.responseEnd = responseEnd;
}