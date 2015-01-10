responseLog=false;
commandLog=true;	
requestLog=true;
var i=0;

function printCmd(msg){
	if(commandLog){
		console.log(msg);
	}
}

function printReq(msg){
	if(requestLog){
		console.log(msg);		
	}
}

function printRes(msg){
	if(responseLog){
		console.log(msg);
	}
}