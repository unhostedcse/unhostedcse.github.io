// Interface for Chrome
function TCP_Interface_Chrome(server){
	this.server=server;
	console.log(server);
}

var self;

TCP_Interface_Chrome.prototype.connect = function(act,cmd,settings){
	self=this;	

	var editorExtensionId = 'leeieiodahmceefccpkdcdnhfeapimcd';//
	// var editorExtensionId = 'ikhibemopdnmbjfnhoepochhedbodhih';
	try{
		chrome.runtime.sendMessage(editorExtensionId, {actionEvt: act, command: cmd, settings:settings, conID:this.server.imaps},
  		function(response) {
			if(response){

				if(self.server){
					if(self.server.imaps==response.id)
					self.server.result(response.message,response.id);
				}					
				else
					console.log('no server');	
			}
			else
				console.log('error');

  		});
 	}catch(e){
		console.log(e);
 	}
}

// $(document).on("onChromeData",function(event){
// 	// console.log(event);
// 	// self.server.result(event.obj.msg);
// });

