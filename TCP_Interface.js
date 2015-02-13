// Interface for Firefox
function TCP_Interface(server){
	this.server=server;
	document.addEventListener("MyAnswerEvent",function(e) { TCP_Interface.prototype.ExtensionAnswer(e,server,server.imaps); },false);
}

TCP_Interface.prototype.connect = function(act,cmd,settings){
	var element = document.createElement("MyExtensionDataElement");		
	element.setAttribute("action",act);		
	element.setAttribute("command",cmd);		
	element.setAttribute("server",this.server.type);
	element.setAttribute("conID",this.server.imaps);

	var res=cmd ? JSON.parse(cmd).request : 'null';
	printReq('request '+this.server.imaps+' '+act +'< '+res+' \>');

	element.setAttribute("settings",settings);		
	document.documentElement.appendChild(element);
	var evt = document.createEvent("Events");
	evt.initEvent("MyExtensionEvent", true, false);
	element.dispatchEvent(evt);
}

TCP_Interface.prototype.ExtensionAnswer=function(EvtAnswer,server,id){
	var value=EvtAnswer.target.getAttribute("value");
	var type=EvtAnswer.target.getAttribute("server");
	var conID=EvtAnswer.target.getAttribute("conID");

	if(value=="test_connect_pass")
		server.result(value);

	if(id==conID){
		server.result(value,conID);
	}
	//IMAP_Interface.prototype.result(value);
}