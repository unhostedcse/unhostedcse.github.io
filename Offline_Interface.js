function Offline_Interface(res,i){

}

Offline_Interface.prototype.createCORSRequest = function(method, url) {
  var xhr = new XMLHttpRequest();
  if ("withCredentials" in xhr) {
    // Most browsers.
    xhr.open(method, url, true);
  } else if (typeof XDomainRequest != "undefined") {
    // IE8 & IE9
    xhr = new XDomainRequest();
    xhr.open(method, url);
  } else {
    // CORS not supported.
    xhr = null;
  }
  return xhr;
};

Offline_Interface.prototype.ping=function(){
  var url = 'http://unhosted.projects.uom.lk/cors/index.php';
  var method = 'GET';
  var xhr = this.createCORSRequest(method, url);

  xhr.onload = function(e) {
    // Success code goes here.
    console.log(xhr.responseText);
    whenOnline();
  };

  xhr.onerror = function() {
    // Error code goes here.
    whenOffline();
  };

  xhr.send();
}

function whenOnline(){
  $( ".con_status" ).html("online");
  Sync_Module.db.getSaveSendMail(
    function(msg){
      //console.log(msg);
      console.log('SMTP command starting');
      body=msg.body;
      mailto=msg.mailto;
      var smtp=new SMTP_Sendmail(++imaps);
      smtp.sendmail(SendMailReady);
    }
  );
}

function SendMailReady(){
  console.log('finished SendMailReady');    
  
    $.notifier({"type": 'success',
                  "title": 'Mail Sent',
                  "text": 'Mail Sent Succesfully',
                  "positionY": "bottom",
                  "positionX": "left",
                  "animationIn" : 'bounce',
                  "animationOut" : 'drop'
  });   
  
}

function whenOffline(){
  $( ".con_status" ).html("offline");
}