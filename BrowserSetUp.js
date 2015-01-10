var isOpera = !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;    // Opera 8.0+ (UA detection to detect Blink/v8-powered Opera)
var isFirefox = typeof InstallTrigger !== 'undefined';   // Firefox 1.0+
var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;    // At least Safari 3+: "[object HTMLElementConstructor]"
var isChrome = !!window.chrome && !isOpera;              // Chrome 1+
var isIE = /*@cc_on!@*/false || !!document.documentMode; 
var extInstalled=false;

if(isFirefox){
  console.log('Browser is Firefox');
  var ex=new extResult();
  var tcp=new TCP_Interface(ex);
  tcp.connect('test_connect');
  window.setTimeout(setupFirefox, 1000);
	// setupFirefox();
}else if(isChrome){
  console.log('Browser is Chrome');
}else{
  console.log('Sorry Browser is not Supported');
}



function setupFirefox(){
  if(extInstalled){
    console.log('Good Unhosted is installed');
    return;
  }
  console.log('Unhosted not installed');
  console.log('installing Unhosted');

  var x = document.createElement("a");
  x.setAttribute("id", "click"); 
  x.setAttribute("type", "hidden"); 
  x.setAttribute("href", "../xpi/unhosted@unhosted.projects.uom.lk.xpi"); 
  x.setAttribute("iconURL", "../xpi/icon.png"); 
  x.setAttribute("onclick", "return install(event);"); 
  x.click();
}


function install (aEvent){
  for (var a = aEvent.target; a.href === undefined;) a = a.parentNode;
  var params = {
    "Foo": { URL: aEvent.target.href,
             IconURL: aEvent.target.getAttribute("iconURL"),
             Hash: aEvent.target.getAttribute("hash"),
             toString: function () { return this.URL; }
    }
  };
  InstallTrigger.install(params);

  return false;
}

function extResult(){
  this.type='0';
  this.result =function(val){
    console.log(val);
    extInstalled=true;
  }
}
