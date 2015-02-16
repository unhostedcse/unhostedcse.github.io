function DBController() {
    this.database;
    this.id = 0;
    this.mailBoxTableName = 'mailBoxes';
    this.offlineMboxName = 'unhostedOfflineMbox';
    this.accountDBName = 'accounts';
    this.accountTableName = 'accounts';
    this.account_database;
}

DBController.prototype.create_open_account_DB=function(fun){
  window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
  window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
  window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;  
  var self=this;
  if (!window.indexedDB) {
      alert("Sorry!Your browser doesn't support IndexedDB");
  }

    var request = window.indexedDB.open(this.accountDBName);

    request.onerror = function(event) {
      console.log(event.target.errorCode);
    };

    request.onblocked=function(event){
      console.log('open onblocked '+event);     
  	}

    request.onsuccess = function(event) {
        self.account_database=request.result;        
        console.log(self.accountDBName+' DB ready');
        self.viewAccounts();

        if(fun) // only one time, when refresh
        	fun();
    };

    request.onupgradeneeded = function(event) {
        var db = event.target.result;
        var objectStore = db.createObjectStore(self.accountTableName, {keyPath: "id",autoIncrement:true});
        objectStore.createIndex("usernameIndex", "username", { multiEntry: true });
        console.log('success');
    };
}

DBController.prototype.viewAccounts=function(){
	// $("#setting").empty(); 
	// alert('open');         
  var objectStore = this.account_database.transaction(this.accountTableName).objectStore(this.accountTableName);
  self=this;
  objectStore.openCursor().onsuccess = function(event) {
    var cursor = event.target.result;   

    if (cursor && cursor.value) {       
      // console.log("DB "+cursor.source.transaction.db.name);
      var val=cursor.value.username;
      var id=cursor.key;

      // console.log("username "+val);
      // console.log("userID "+id);

      if(username=="")
      	return;

      if(val==username && $("#setting") ){
      	$("#setting").append('<option value="'+val+'" selected>'+val+'</option>');
      }else if($("#setting")){
      	$("#setting").append('<option value="'+val+'">'+val+'</option>');          
      }
      cursor.continue();
    } 
  }
}

DBController.prototype.getAccounts=function(fun){
  var objectStore = this.account_database.transaction(this.accountTableName).objectStore(this.accountTableName);
  self=this;
  var acc=new Array();
  objectStore.openCursor().onsuccess = function(event) {
    var cursor = event.target.result;       
    if (cursor && cursor.value) {
      var obj={
      	id:cursor.key,
      	username:cursor.value.username,
      	password:cursor.value.password
      };
      acc.push(obj);
      cursor.continue();
    }else{
    	if(fun)
    		fun(acc);
    }
  }
}

DBController.prototype.updateAccounts=function(id,newData){  

  var objectStore = this.account_database.transaction([this.accountTableName], "readwrite").objectStore(this.accountTableName);
	var request = objectStore.get(id);

	request.onerror = function(event) {
	  // Handle errors!
	};

	request.onsuccess = function(event) {
	  // Get the old value that we want to update
	  var data = request.result;
	  // update the value(s) in the object that you want to change
		data.username=newData.username;
		data.password=newData.password;
		data.smtphost=newData.smtphost;
		data.smtpport=newData.smtpport;
		data.imaphost=newData.imaphost;
		data.imapport=newData.imapport;  
		data.imapsecurity=newData.imapsecurity; 
		data.smtpsecurity=newData.smtpsecurity;

	  // Put this updated object back into the database.
	  var requestUpdate = objectStore.put(data);
	   requestUpdate.onerror = function(event) {
	     console.log(event);
	   };
	   requestUpdate.onsuccess = function(event) {
	   	console.log("id " +id +" update "+event.type);
	   	alert('Updated');
        location.reload();

	   };
	};

}

DBController.prototype.addAccount=function(){
  var transaction = this.account_database.transaction([this.accountTableName], "readwrite");
  var objectStore = transaction.objectStore(this.accountTableName);

  var record={
	  username:document.getElementById('user').value,
	  password:document.getElementById('pass').value,
	  imaphost:document.getElementById('imap').value,
	  imapport:document.getElementById('imapport').value,
	  imapsecurity:document.getElementById('imapsec').value,
	  smtphost:document.getElementById('smtp').value,
	  smtpport:document.getElementById('smtpport').value,
	  smtpsecurity:document.getElementById('smtpsec').value
  };

  var userName=document.getElementById('user').value;
  objectStore.index("usernameIndex").get(userName).onsuccess = function(e) {   
      if(e.target.result){
        console.log(userName+' Already Exist!');
      }else{
          var request=objectStore.add(record);
          request.onsuccess = function(event) {
              console.log(userName+' added to database');
              alert(userName+' added to database');
              location.reload();
          };
          request.onerror = function (event) {
              console.log(event);
          }
      }
  }
}

DBController.prototype.loadAccount=function(userName){
  var objectStore = this.account_database.transaction(this.accountTableName).objectStore(this.accountTableName);
  objectStore.index("usernameIndex").get(userName).onsuccess = function(e) {   
  		var cursor = e.target.result;
      username=cursor.username;
      // console.log(username);
      password=cursor.password;
      imaphost=cursor.imaphost;
      imapport=cursor.imapport;
      imapsecurity=cursor.imapsecurity;
      smtphost=cursor.smtphost;
      smtpport=cursor.smtpport;
      smtpsecurity=cursor.smtpsecurity;   
      userID=cursor.id;

      $.event.trigger({type:"loadAccount"});   
    }
}

DBController.prototype.deleteAccount=function(id,func){
  var objectStore = this.account_database.transaction([this.accountTableName],'readwrite').objectStore(this.accountTableName);
  var req=objectStore.openCursor();

   req.onsuccess = function(e) { 
   		var cursor = e.target.result;
 		if(cursor){
 			if(cursor.key==id){
	 			var request = cursor.delete();
		        request.onsuccess = function() {
		          	if(func){
	 					func();
	 				}
		        }; 			
		        return;
 			} 
 			cursor.continue();			
 		}
   }

   req.onerror = function(event) {
    	console.log(event.target.errorCode);    	
    };
}

DBController.prototype.loadAccountById=function(id,func){
  var objectStore = this.account_database.transaction(this.accountTableName).objectStore(this.accountTableName);
  var req=objectStore.get(id);

  req.onsuccess = function(e) {   
  	  var cursor = e.target.result;
  	  // console.log(e.target);

  	  if(cursor){
	      username=cursor.username;
	      password=cursor.password;
	      imaphost=cursor.imaphost;
	      imapport=cursor.imapport;
	      imapsecurity=cursor.imapsecurity;
	      smtphost=cursor.smtphost;
	      smtpport=cursor.smtpport;
	      smtpsecurity=cursor.smtpsecurity;   
	      userID=cursor.id;
	    }else{
	     	console.log('non Existing userAccount');
	    }

      if(func){
      	func(cursor);
      }
    }
   req.onerror = function(event) {
    	console.log(event.target.errorCode);
    	func(cursor);
    };

}

DBController.prototype.create_openDB=function(indexedDBName,folder,DBReady){
	// console.log('create_openDB');
	
	window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
	window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
	window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;	
	var self=this;
	if (!window.indexedDB) {
	    alert("Sorry!Your browser doesn't support IndexedDB");
	}

	// dbVersion++;
    var request = window.indexedDB.open(indexedDBName);

    // console.log(request.result.version);

    request.onerror = function(event) {
    	console.log(event.target.errorCode);
    };

    request.onblocked=function(event){
	   	console.log('open onblocked '+event);    	
	}

    request.onsuccess = function(event) {
        self.database=request.result;
        // self.getMessages(func,folder);
        // self.getMailBoxes(setMailBoxBar);
        console.log('show content');
        if(DBReady){
        	DBReady();
        }
        dbVersion=request.result.version;
        // console.log(request.result.version);
    };

    request.onupgradeneeded = function(event) {
        var db = event.target.result;
        //var objectStore = db.createObjectStore("notes", { keyPath: "id",autoIncrement:true});
        console.log('DB folder: '+folder);

        // if(folder)
        	// var objectStore = db.createObjectStore(folder, {autoIncrement:false});

        var objectStore = db.createObjectStore(self.mailBoxTableName, {keyPath: "id",autoIncrement:true});

        // for offline sendmail
        var objectStore = db.createObjectStore(self.offlineMboxName, {keyPath: "id",autoIncrement:true});

        // var objectStore = db.createObjectStore(self.accountTableName, {keyPath: "id",autoIncrement:true});
    };   	

}

DBController.prototype.add=function(record,id,folder){	
    this.addContain(record,id,folder);	
}

// save msg for offline send
DBController.prototype.saveSendMail=function(mailto,text){	
    // this.addContain(record,id,folder);	

    var transaction = this.database.transaction([this.offlineMboxName], "readwrite");    
    var objectStore = transaction.objectStore(this.offlineMboxName);		
    var self=this;
	var record={
		// id:1,
		text: text,
		mailto: mailto,
		status: 'tosend'
	};

	var request=objectStore.add(record);
    request.onsuccess = function(event) {    	
    	console.log('Msg added to database');

    setTimeout(function(){
		window.close();
	},100);
	
	$.notifier({"type": 'success',
	    "title": 'Mail Saved',
	    "text": 'Mail Queued Succesfully',
	    "positionY": "bottom",
	    "positionX": "left",
	    "animationIn" : 'bounce',
		"animationOut" : 'drop'
	});	

    	// $.event.trigger({type:"newSendMail"});
   	};
   	request.onerror = function (event) {
   		console.log(event);
   	}	
}

DBController.prototype.getSaveSendMail=function(callback){	
	self=this;
	console.log('getSaveSendMail');
	// console.log(this.database);

	var objectStore = this.database.transaction(this.offlineMboxName).objectStore(this.offlineMboxName);
	    objectStore.openCursor().onsuccess = function(event) {
	    	var cursor = event.target.result;	    	    	
	    	if (cursor) {	    	
	    		if(cursor.value){
	    			var status=cursor.value.status;
	    			// console.log('send mail: '+status);
	    			if(status=='tosend'){
	    				var msg={};
		    			msg.body=cursor.value.text;
						msg.mailto=cursor.value.mailto;
						msg.key=cursor.key;

						//send
						//console.log('send mail: '+msg.body+' id: '+cursor.key);
						self.updateSaveSendMail(cursor.key);
						if(callback){
			    			callback(msg)
			    		}
			    	}else	
			    	cursor.continue();
			    	
			    }else	
			    cursor.continue();
		    }	
	    }
}

DBController.prototype.updateSaveSendMail=function(id){	
	var objectStore = this.database.transaction([this.offlineMboxName], "readwrite").objectStore(this.offlineMboxName);
	var request = objectStore.get(id);

	request.onerror = function(event) {
	  // Handle errors!
	};

	request.onsuccess = function(event) {
	  // Get the old value that we want to update
	  var data = request.result;

	  // update the value(s) in the object that you want to change
	  data.status = 'sent';

	  // Put this updated object back into the database.
	  var requestUpdate = objectStore.put(data);
	   requestUpdate.onerror = function(event) {
	     console.log(event);
	   };
	   requestUpdate.onsuccess = function(event) {
	   	console.log("id " +id +" update to sent");
	   };
	};
}

var dbt;
DBController.prototype.view = function(db) {
    var objectStore = this.database.transaction("notes").objectStore("notes");
    objectStore.openCursor().onsuccess = function(event) {
        var cursor = event.target.result;
        if (cursor) {
            if (cursor.value) {
                console.log("DB " + cursor.source.transaction.db.name);//+" "+cursor.value.mid
                console.log("MID " + cursor.key);
                console.log("TO " + cursor.value.To);
                console.log("FROM " + cursor.value.From);
                console.log("Subject " + cursor.value.Subject);
                console.log("DATE " + cursor.value.Date);
                console.log("Received " + cursor.value.Received);
                console.log("Body " + cursor.value.body);
                console.log("");
            }
            cursor.continue();
        }
    }
}



var UIresult=new Array();		

DBController.prototype.getMessages=function(cllBack,folder){
	UIresult=new Array();		

	if(!this.database){
		console.log('empty DB');
		return;
	}

	try{
		var objectStore = this.database.transaction(folder).objectStore(folder);
	}	catch(e){		
		console.log(e);
		// this.database.createObjectStore(folder, {autoIncrement:false});
	}

	if(!objectStore){
		console.log('empty DB');
		return;
	}

    // var os=objectStore.openCursor();
    objectStore.count().onsuccess = function(event) {
    	var total = event.target.result;
		var needRandom = true;
		console.log("ok, total is "+total);

		//show mbox size in main page
		document.getElementById('mailboxName').innerHTML=folder+' ('+total+' messages)';
		

		// var pid=0; 
		var msgs=msgPP; 
		var skip=pid*msgs;
		if(skip==0)
			needRandom=false;

	    var os=objectStore.openCursor(null, "prev");
	    os.onsuccess = function(event) {	
	    	var obj=function(id,from,sub,date,body,seen,size,attachments){
				this.id=id;
				this.from=from;
				this.subject=sub;
				this.date=date;
				this.body=body;
				this.seen=seen;
				this.size=size;
				this.attachments=attachments;
			}

	    	var cursor = event.target.result; 	

	    	if(cursor==null || msgs<1 || skip<0 || skip>total){
	    		cllBack(UIresult);
	    		return;
	    	}		
	    	if (cursor) {	    	
	    			
			    if(needRandom){
			    	cursor.advance(skip);
			    	needRandom=false;
			    }else{
			    	cursor.continue();

				    if(cursor.value){	
				    	if(!cursor.value.deleted ){	    		//&& cursor.value.body!='deleted'
							var msg=new obj(cursor.key,cursor.value.From,cursor.value.Subject,cursor.value.Date,
								cursor.value.body,cursor.value.seen,cursor.value.size,cursor.value.attachments);
							UIresult.push(msg);
							msgs--;
						}
				    }

				}
		    }
			
	    }
	}
}

DBController.prototype.deleteMessages=function(ids,folder,completeDelete,cllBack){
	var self=this;
	// var objectStore = this.database.transaction(folder).objectStore(folder);
	// var tagIndex = objectStore.index("id");
	// var toDelete = tagIndex.openKeyCursor(IDBKeyRange.only(tagno));
	// toDelete.onsuccess = function() {
	// 	var cursor = toDelete.result;
	// 	if (cursor) {
	// 		console.log(cursor);
	// 	    // pstore.delete(cursor.primaryKey);
	// 	    cursor.continue;
	// 	}
	// }

	var id=ids[0];
	var objectStore = this.database.transaction([folder], "readwrite").objectStore(folder);
	var request = objectStore.get(id);

	request.onerror = function(event) {
	  // Handle errors!
	};

	request.onsuccess = function(event) {
	  // Get the old value that we want to update
	  var data = request.result;
	  var newData={};

	  // update the value(s) in the object that you want to change
	  	if(completeDelete){
		  newData.id=data.id;
		  newData.deleted=true;
		  data=newData;
		}else{
			newData.id=data.id;
			newData.From=data.From;
			newData.Subject=data.Subject;
			newData.Date=data.Date;
			newData.seen=data.seen;
			newData.size='-';
		  	data=newData;
			data.body='deleted';
		}

	  // Put this updated object back into the database.
	  var requestUpdate = objectStore.put(data,id);
	   requestUpdate.onerror = function(event) {
	     console.log(event);
	   };
	   requestUpdate.onsuccess = function(event) {
	   	console.log("id " +id +" deleted ");
	   		if(cllBack){
	   			cllBack();
	   		}
	   };
	};
}

DBController.prototype.addContain=function(record,id,folder){
	var self=this;

   	this.database.transaction(folder).objectStore(folder).get(parseInt(id)).onsuccess = function(event) {
   		//dbt=event;   		
	  	var transaction = self.database.transaction([folder], "readwrite");
	    var objectStore = transaction.objectStore(folder);
   		
   		if(event.target.result){
   			console.log('id '+id + ' atlready in database' );
   		}else{
   			var request=objectStore.add(record,id);
		    request.onsuccess = function(event) {
		    	//console.log(id+' '+event);
		    	console.log('id '+id + ' added to database' );
		    	//self.create_openDB(username,dbSelectFolder,Sync_Module.prototype.DBReady);		    	
		    	// self.getMessages(Sync_Module.addMsg,selectFolder);
		    	//initUnhosted();
		   	};
		   	request.onerror = function (event) {
		   		console.log(id+' '+event);
		   	}	
   		}
	};
}

DBController.prototype.addMailBoxes=function(name,path){

	var self=this;
	var fun=function(boxes){		

		if(boxes.indexOf(path)<0){
			var transaction = self.database.transaction([self.mailBoxTableName], "readwrite");
		    var objectStore = transaction.objectStore(self.mailBoxTableName);		
			var record={
				name: name ? name : 'noname',
				path: path
			};
			var request=objectStore.add(record);
		    request.onsuccess = function(event) {
		    	console.log(path+' added to database' );		    	
		    	createMailBox(path);
		   	};
		   	request.onerror = function (event) {
		   		console.log(event);
		   	}	
		}else{
			console.log(path+' already in database' );
			$.event.trigger({type:"mailBoxesCreated",folder:path});
		}
	}
	
	var createMailBox=function(folder){
		window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
		window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
		window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;	

		if (!window.indexedDB) {
		    alert("Sorry!Your browser doesn't support IndexedDB");
		}

		dbVersion++;
		console.log('current version '+dbVersion);

	    var request = window.indexedDB.open(username,dbVersion);

	    request.onerror = function(event) {
	    	console.log(event.target.errorCode);
	    };

	    request.onsuccess = function(event) {
	        self.database=request.result;    
	        console.log('open mailBox '+folder);    
	        $.event.trigger({type:"mailBoxesCreated",folder:folder});
	    };

	    request.onblocked=function(event){
	    	console.log('open onblocked '+event);    		    	
	    	self.database.close();	    	
	    };

	    request.onupgradeneeded = function(event) {
	    	console.log('created mailBox '+folder);    
	        var db = event.target.result;
        	var objectStore = db.createObjectStore(folder, {autoIncrement:false});
	    }; 
	}

    this.getMailBoxes(fun);
    // createMailBox(path);

}

DBController.prototype.closeDB=function(func){
	if(this.database)
		this.database.close();
}

DBController.prototype.getMailBoxes=function(func){
	var boxes=new Array();
	result.ListFolder=new Array();
	self=this;

	if(!this.database){
		if(func)
	    	func(new Array());
		return;
	}

	var objectStore = this.database.transaction(self.mailBoxTableName).objectStore(self.mailBoxTableName);
    objectStore.openCursor().onsuccess = function(event) {
    	var cursor = event.target.result;    	
    	if (cursor) {	    	
    		if(cursor.value){
		    	boxes.push(cursor.value.path);
		    	// result.ListFolder.push(cursor.value.path);
		    }	
		    cursor.continue();
	    }else{
	    	console.log('cursor.key over ');

	    	if(func)
	    		func(boxes);
	    	else{
	    		mboxCnt=0;
	    		$.event.trigger({type:"mailBoxesRead",folders: boxes});
	    	}

	    }	
    }	
}

DBController.prototype.getKeys=function(func,folder){
	result.keys=new Array();

	if(!this.database){
		func();
		return;
	}

	console.log('getKeys '+folder);

	var objectStore = this.database.transaction(folder).objectStore(folder);
	
    objectStore.openCursor().onsuccess = function(event) {
    	var cursor = event.target.result;    	
    	if (cursor) {	    	
    		if(cursor.value && cursor.value.body!='deleted' && !cursor.value.deleted){
		    	// console.log(cursor.key);
		    	result.keys.push(cursor.key);
		    }	
		    cursor.continue();
	    }else{
	    	console.log('cursor.key over '+result.keys);
	    	func();
	    }	
    }	
}

DBController.prototype.update=function(id,val,att,folder,cllback){

    var objectStore = this.database.transaction([folder], "readwrite").objectStore(folder);
	var request = objectStore.get(id);

	request.onerror = function(event) {
	  // Handle errors!
	};

	request.onsuccess = function(event) {
	  // Get the old value that we want to update
	  var data = request.result;

	  if(data.body=="deleted"){
	  	console.log('deleted msg will not save body');
	  	return;
	  }else{
	  // update the value(s) in the object that you want to change
	  data.body = val;
	  }
	  

	  data.attachments=att;

	  // Put this updated object back into the database.
	  var requestUpdate = objectStore.put(data,id);
	   requestUpdate.onerror = function(event) {
	     console.log(event);
	   };
	   requestUpdate.onsuccess = function(event) {
	   	console.log("id " +id +" update "+event.type);
		   	if(cllback){
		   		cllback();
		   	}
	   };
	};

}

DBController.prototype.getMailById=function(id,folder,func){
    var objectStore = this.database.transaction([folder], "readwrite").objectStore(folder);
	var request = objectStore.get(id);
	request.onerror = function(event) {
	  // Handle errors!
	  console.log(event);
	};
	request.onsuccess = function(event) {
	  var data = request.result;
	  
	  if(func){
	  	func(data);
	  }	  	
	};
}



DBController.prototype.setMailFlagById=function(id,folder,func){
var objectStore = this.database.transaction([folder], "readwrite").objectStore(folder);
var request = objectStore.get(id);
request.onerror = function(event) {
// Handle errors!
console.log(event);
};
request.onsuccess = function(event) {
// Get the old value that we want to update
var data = request.result;

// update the value(s) in the object that you want to change
data.seen =data.seen+"\\Seen";

// Put this updated object back into the database.
var requestUpdate = objectStore.put(data,id);
requestUpdate.onerror = function(event) {
console.log(event);
};
requestUpdate.onsuccess = function(event) {
console.log("id " +id +" update "+event.type);
if(func){
func(data);
}
};

};

}