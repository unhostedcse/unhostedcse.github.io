var imaps=0;
var mboxCount=0;
function Sync_Module(clearBody){
	clearBody();
}

Sync_Module.prototype.init = function(addMsg,folder,setMailBoxBar){
	Sync_Module.setMailBoxBar=setMailBoxBar;
	Sync_Module.addMsg=addMsg;
	Sync_Module.folder=folder;

	Sync_Module.db=new DBController();
	Sync_Module.db.create_openDB(username,folder,Sync_Module.prototype.DBReady);
	Sync_Module.db.create_open_account_DB();

	console.log('username '+username);

	self=this;
	setInterval(function () {
		console.log("refreshing.....");
		// Sync_Module.prototype.getMailBoxesScenario();  // uncomment
	}, refresh_interval);
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
				$.event.trigger({type:"mailBoxesDownloaded"});
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
				Sync_Module.db.addContain(record,i,dbSelectFolder);
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
	console.log("finished adding DB");

	
	
}

//start to fetch Mail body
Sync_Module.prototype.getBody = function(){
	var imap=new IMAP_Fetch(++imaps);
	imap.getBodyScenario(Sync_Module.prototype.getBodyFinished);
	console.log('crated imap body service');
}

Sync_Module.prototype.getBodyFinished = function(){
	if(result.fetchOnlyBody){
		for (var i = 0; result.fetchOnlyBody && i < result.fetchOnlyBody.length; i++) {
			var record=result.fetchOnlyBody[i];
			if(record){
				Sync_Module.db.update(i,record,dbSelectFolder);
			}
		}
	}else{
		console.log("DB is upto date");
	}

	result.fetchOnlyBody=new Array();
	console.log('finished imap body service');
	initUnhosted();
	// if(mboxCount< result.ListFolder.length){
	// 	selectFolder=result.ListFolder[++mboxCount];
	// 	dbSelectFolder=selectFolder;
	// 	console.log('getMailBoxesReady choose '+selectFolder);
	// 	Sync_Module.prototype.getUids();
	// }

	$.event.trigger({type:"mailBoxesReadNext"});
}

Sync_Module.prototype.SendMailReady = function(){
	console.log('finished SendMailReady');
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
