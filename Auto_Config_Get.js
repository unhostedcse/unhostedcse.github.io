function Auto_Config_Get(i){
 Auto_Config_Get.imaps=i;
  Auto_Config_Get.imap= new Auto_Config_Interface(this.func,i);
  Auto_Config_Get.cmds=new Array();
  Auto_Config_Get.nextFuncIndex=0;  
}

Auto_Config_Get.prototype.func=function(response,id){
    //console.log(response);
    printRes('config '+id+'> '+response);      
    if(Auto_Config_Get.imap.onTheResponse){
    	var result=Auto_Config_Get.imap.onTheResponse(response);    	
    }

    if(Auto_Config_Get.cmds.length > Auto_Config_Get.nextFuncIndex+1){
    	var f1=Auto_Config_Get.cmds[++Auto_Config_Get.nextFuncIndex];
		f1(result);
    }
    
}

Auto_Config_Get.prototype.start = function(){
	Auto_Config_Get.imap.start();
}

Auto_Config_Get.prototype.HTTPGet = function(){

	var cmd=Auto_Config_Get.imap.HTTPGet(domain);
	Auto_Config_Get.imap.onTheResponse=cmd.onResponse;
}

Auto_Config_Get.prototype.getConfigs = function(func){
  this.getConfigScenario(func);                // passs the last function
}

Auto_Config_Get.prototype.getConfigScenario = function(func){
	Auto_Config_Get.cmds.push(this.start);
	Auto_Config_Get.cmds.push(this.HTTPGet);

	Auto_Config_Get.cmds.push(func);                 // called when all command executed
	Auto_Config_Get.cmds.push(this.clearCmds);

	Auto_Config_Get.nextFuncIndex=0;
	var f=Auto_Config_Get.cmds[Auto_Config_Get.nextFuncIndex];
	f();
	Auto_Config_Get.nextFuncIndex++;
	var f1=Auto_Config_Get.cmds[Auto_Config_Get.nextFuncIndex];
	f1();
}

Auto_Config_Get.prototype.clearCmds=function (){
  console.log('clearing');
  Auto_Config_Get.cmds=[];
  Auto_Config_Get.imap.onTheResponse=null;
}
