var imaps=1;
var offNo=0;

var mboxCount=0;
function Sync_Module(clearBody){
	clearBody();
}

Sync_Module.prototype.init = function(addMsg,folder,setMailBoxBar,loadaccCllback){
	Sync_Module.setMailBoxBar=setMailBoxBar;
	Sync_Module.addMsg=addMsg;
	Sync_Module.folder=folder;

	Sync_Module.db=new DBController();
	Sync_Module.db.create_openDB(username,folder,Sync_Module.prototype.DBReady);
	Sync_Module.db.create_open_account_DB(loadaccCllback);

	console.log('username '+username);

	self=this;
	setInterval(function () {
		//console.log("refreshing.....");
		// Sync_Module.prototype.getMailBoxesScenario();  // uncomment
	}, refresh_interval);

	Sync_Module.initPing();
	Sync_Module.ping();
	setInterval(function () {
		//console.log("ping.....");
		Sync_Module.ping();
	}, 10000);

	// setInterval(function () {		
	// 	Sync_Module.offline=new Offline_Interface(pingSuccess,offNo);
	// }, 90000);
}

Sync_Module.prototype.initSMTP = function(){
	// Sync_Module.setMailBoxBar=setMailBoxBar;
	// Sync_Module.addMsg=addMsg;
	// Sync_Module.folder=folder;

	this.db=new DBController();
	this.db.create_openDB(username);
	console.log('username '+username);
}

Sync_Module.prototype.DBReady = function(addMsg,folder,setMailBoxBar){
	console.log('DB READY ');	
	// Sync_Module.db.getMailBoxes(Sync_Module.setMailBoxBar);
	Sync_Module.db.getMailBoxes(
		function(boxs){
			// console.log(boxs[0]);
			Sync_Module.setMailBoxBar(boxs);
			if(boxs && boxs.length>0){
				Sync_Module.db.getMessages(Sync_Module.addMsg,Sync_Module.folder); 
			}else{
				console.log('Empty Mbox list');
			}
		}
	);
	
}

//start get mailBoxes
Sync_Module.prototype.getMailBoxesScenario = function(){
	var imap=new IMAP_Fetch(++imaps);
	imap.getMailBoxesScenario(this.getMailBoxesReady);
	console.log('created imap mailboxs service');
	$("#foldersLoading").show();
}

Sync_Module.prototype.getMailBoxesReady = function(mailBoxes){

	console.log('getMailBoxesReady');
	console.log("id= "+this.imaps+" result ListFolder= ");
	var val=result.ListFolder;
	var i=0;

	if(val.length>0){
		Sync_Module.db.addMailBoxes(val[i].type,val[i].folder);
		i++;
	}else{
		console.log('Empty mail Boxes');
	}

  	$(document).on("mailBoxesCreated", 
		function(e){
			console.log('mailBoxesCreated '+e.folder);
			
			if(i==val.length){
				$("#foldersLoading").hide();
				if(autoSync){
					$.event.trigger({type:"mailBoxesDownloaded"});				
				}else{
					$.event.trigger({type:"mailBoxesDownloaded-false"});				
					return;
				}				
			}else{
				Sync_Module.db.addMailBoxes(val[i].type,val[i].folder);
				i++;
			}		
		}
	);
	
}

Sync_Module.prototype.refresh = function(){
	selectFolder=result.ListFolder ? result.ListFolder[0]: selectFolder;
	dbSelectFolder=selectFolder;
	console.log('getMailBoxesReady choose '+selectFolder);
	Sync_Module.prototype.getUids();
}

//start IMAP service
Sync_Module.prototype.getUids = function(){
	var imap=new IMAP_Fetch(++imaps);
	imap.getUids(this.getUidsReady);
	console.log('created imap service');
}

//Finished IMAP service
Sync_Module.prototype.getUidsReady = function(){
	console.log('finished getUids');
	console.log("final result select= "+result.select);
	console.log("final result fetchList= "+result.fetchList);
	console.log("final result fetchListFlags= "+result.fetchListFlags);
	// console.log("final result fetchBody= "+result.fetchBody);
	// Sync_Module.prototype.getBody();
	// try{
	// Sync_Module.db.create_openDB(username,dbSelectFolder,
	// 	function(){
	// 		console.log('starting gettting headers');
	// Sync_Module.db=new DBController();
	Sync_Module.db.getKeys(Sync_Module.prototype.getHeaders,dbSelectFolder);
	// 	}
	// );
// }catch(e){
// 	console.log(e);
// }
}

//start to fetch headers
Sync_Module.prototype.getHeaders = function(){
	var imap=new IMAP_Fetch(++imaps);
	imap.getHeaderScenario(Sync_Module.prototype.getHeadersReady);
	console.log('crated imap body service');
}

//call after fetch haders
Sync_Module.prototype.getHeadersReady = function(){
	
	console.log('finished getbodyheader');
	console.log("final result select= "+result.select);
	console.log("final result fetchList= "+result.fetchList);
	console.log("final result fetchListFlags= "+result.fetchListFlags);
	//console.log("final result fetchBody= "+ (result.fetchBody || 'empty'));

	if(result.fetchMIME){
		for (var i = 0; result.fetchMIME && i < result.fetchMIME.length; i++) {

			var record=result.fetchMIME[i];
			if(record){
				// Sync_Module.db.addContain(record,i,dbSelectFolder);
			}
		};

		// Sync_Module.prototype.getBody(); // removed to optimised

		initUnhosted();
		$.event.trigger({type:"mailBoxesReadNext"});

	}else{
		console.log("DB is upto date");
		$.event.trigger({type:"mailBoxesReadNext"});
	}

	result.fetchMIME=new Array();
	$('#progress_row').css('height', '0px');
	$('#progress_bar').css('display', 'none');
	console.log("finished adding DB");
	
}

//Directly save downloaded Mail
$(document).on("mailheaderDownloaded", 
	function(e){
			Sync_Module.db.addContain(e.record,e.id,dbSelectFolder);
			// Sync_Module.db.create_openDB(username,folder,Sync_Module.prototype.DBReady);
			// console.log(e.id);
			//initUnhosted();
	}
);

//save and show downloaded body
$(document).on("mailbodyDownloaded", 
	function(e){
		var msg=e.record;
		var body=msg.body;
		// document.getElementById('bodyDisplay').innerHTML=e.record.body;
		var file;
		var links='';
		if(msg.attachments && msg.attachments.length>0){
			for(var j=0;file=msg.attachments[j],j<msg.attachments.length;j++){
				links+=createAttachmentLink(file);
			}
			links+='</br></br>';
		}

		var css='<link href="ui/style.css" rel="stylesheet">';
		body=css+links+body;
		// document.getElementById('bodyDisplay').innerHTML=body;
		
		var dis=document.getElementById('bodyDisplay');
		dis.srcdoc=body;

		Sync_Module.db.update(e.id,e.record.body,e.record.attachments,dbSelectFolder);
			
	}
);

//start to fetch Mail body
Sync_Module.prototype.getBody = function(id){
	$("#bodyloading").show();
	// alert('came');
	var imap=new IMAP_Fetch(++imaps);
	imap.getBodyScenario(Sync_Module.prototype.getBodyFinished,id);
	console.log('crated imap body only service');
}

Sync_Module.prototype.getBodyFinished = function(){
	$("#bodyloading").hide();
	// if(result.fetchOnlyBody){
	// 	for (var i = 0; result.fetchOnlyBody && i < result.fetchOnlyBody.length; i++) {
	// 		var record=result.fetchOnlyBody[i];
	// 		if(record){
	// 			Sync_Module.db.update(i,record,dbSelectFolder);
	// 		}
	// 	}
	// }else{
	// 	console.log("DB is upto date");
	// }

	// result.fetchOnlyBody=new Array();
	console.log('finished imap body service');
	// initUnhosted();
	// if(mboxCount< result.ListFolder.length){
	// 	selectFolder=result.ListFolder[++mboxCount];
	// 	dbSelectFolder=selectFolder;
	// 	console.log('getMailBoxesReady choose '+selectFolder);
	// 	Sync_Module.prototype.getUids();
	// }

	// $.event.trigger({type:"mailBoxesReadNext"});
}

Sync_Module.prototype.SendMailReady = function(){
	// alert('Mail Sent!');
	console.log('finished SendMailReady');	

	setTimeout(function(){
		window.close();
	},500);
	
  	$.notifier({"type": 'success',
	                "title": 'Mail Sent',
	                "text": 'Mail Sent Succesfully',
	                "positionY": "bottom",
	                "positionX": "left",
	                "animationIn" : 'bounce',
                	"animationOut" : 'drop'
	});	

	
}

Sync_Module.prototype.SendMail = function(){
	console.log('SMTP command starting');
	var smtp=new SMTP_Sendmail(++imaps);
	smtp.sendmail(this.SendMailReady);
}

Sync_Module.prototype.StartDB = function(){
	this.db=new DBController();
	this.db.create_openDB('nilushan');
}

 Sync_Module.prototype.add = function(){
 	this.db.add();
 }

Sync_Module.prototype.viewDB = function(){
	// Sync_Module.db=new DBController();
	// console.log(username);
	// Sync_Module.db.create_openDB(username);
 	Sync_Module.db.view();
 }

Sync_Module.prototype.test = function(){
 	Sync_Module.db.getKeys();
 }

Sync_Module.prototype.delete = function(ids,folder,completeDelete,cllBack){
 	Sync_Module.db.deleteMessages(ids,folder,completeDelete,cllBack);
}

Sync_Module.CheckNewMail = function(fetchList,keys){
	var re=new Array();
 	var currentCnt=keys.length;
 	var newMailCnt=0;
 	var id;
 	for(var i=fetchList.length-1;i>=0;i--){ // iterate over backword     
 	  id=parseInt(fetchList[i]);
      if(keys.indexOf(id)<0){
      	re.push(id);
      	newMailCnt++;
      }else{
      	console.log('no more new mail');
      	break;      	
      }
      if(newMailCnt==maxMsg){
      	break;
      }
  	}

  	console.log('new mail '+newMailCnt);
  	var obj={
  		"type": 'info',
		"title": 'New Mail',
		"text": newMailCnt+' New Mails'
  	};

  	$.event.trigger({type:"notifier",obj:obj});

  	if(maxMsg<currentCnt+newMailCnt){
  		var mailDelete=(currentCnt+newMailCnt)-maxMsg;
  		for (var i = 0; i < mailDelete; i++) {
  			var id=keys[0];
  			console.log(id);
  			Sync_Module.db.deleteMessages([id],selectFolder,false);
  			console.log('deleteing mail '+id+' of '+selectFolder);
  		};
  		
  	}
  	return re;
}

Sync_Module.initPing= function(){
	Sync_Module.offline=new Offline_Interface();
}

Sync_Module.ping = function(){	
	Sync_Module.offline.ping();
}


