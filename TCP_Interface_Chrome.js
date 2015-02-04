// Interface for Chrome
function TCP_Interface_Chrome(server){
	this.server=server;
}

var self;

TCP_Interface_Chrome.prototype.connect = function(act,cmd,settings){
	self=this;
	var element = document.createElement("MyExtensionDataElement");		
	element.setAttribute("action",act);		
	element.setAttribute("command",cmd);		
	element.setAttribute("server",this.server.type);
	element.setAttribute("conID",this.server.imaps);
	printReq('request '+this.server.imaps+' '+act +'< '+JSON.parse(cmd).request+' \>');
	element.setAttribute("settings",settings);		
	document.documentElement.appendChild(element);
	// var evt = document.createEvent("Events");
	// evt.initEvent("MyExtensionEvent", true, false);
	// element.dispatchEvent(evt);


	var editorExtensionId = 'leeieiodahmceefccpkdcdnhfeapimcd';
	try{
		chrome.runtime.sendMessage(editorExtensionId, {actionEvt: act, command: cmd, settings:settings, conID:this.server.imaps},
  		function(response) {
			if(response){

				if(self.server){
					// var msg=response.message;
					// console.log(msg);
					// var obj={
					// 	msg:msg
					// };
					// $.event.trigger({type:"onChromeData",obj:obj}); 
					self.server.result(response.message);
				}
					
				else
					console.log('no server');	
				//console.log(response.message);
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

