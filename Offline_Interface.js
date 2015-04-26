function Offline_Interface(res,i){

}

Offline_Interface.prototype.ping=function(){
	if(navigator.onLine){
		whenOnline();
      	}else{
		whenOffline();
	}
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
