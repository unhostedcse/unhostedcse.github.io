// Interface for Chrome
function TCP_Interface_Chrome(server){
	this.server=server;
	// console.log(server);
}

// var self;

TCP_Interface_Chrome.prototype.connect = function(act,cmd,settings){
	var self=this;	

	var editorExtensionId = chromeKey;//	
	// var editorExtensionId = 'ikhibemopdnmbjfnhoepochhedbodhih';
	try{
		chrome.runtime.sendMessage(editorExtensionId, {actionEvt: act, command: cmd, settings:settings, conID:this.server.imaps},
  		function(response) {
			if(response){

				if(self.server){
					if(self.server.imaps==response.id)
					self.server.result(response.message,response.id);
				}else{
					console.log('no server ');	
					console.log(response);
				}
			}
			else
				console.log('error');

  		});
 	}catch(e){
		console.log(e);
		alert("Connection error, Check the Chrome App");
 	}
}

// $(document).on("onChromeData",function(event){
// 	// console.log(event);
// 	// self.server.result(event.obj.msg);
// });

