function DBController(){
	this.database;
	this.id=0;
	this.mailBoxTableName='mailBoxes';
	this.offlineMboxName='unhostedOfflineMbox';
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
    };   	

}

DBController.prototype.add=function(record,id,folder){	
    this.addContain(record,id,folder);	
}

// save msg for offline send
DBController.prototype.saveSendMail=function(text,to,cc,bcc){	
    // this.addContain(record,id,folder);	

    var transaction = this.database.transaction([this.offlineMboxName], "readwrite");    
    var objectStore = transaction.objectStore(this.offlineMboxName);		

	var record={
		text: text,
		to: to,
		cc: cc,
		bcc: bcc,
		status: 'tosend'
	};

	var request=objectStore.add(record);
    request.onsuccess = function(event) {
    	console.log('Msg added to database' );
    	// $.event.trigger({type:"newSendMail"});
   	};
   	request.onerror = function (event) {
   		console.log(event);
   	}	
}

DBController.prototype.getSaveSendMail=function(){	
	self=this;
	console.log('getSaveSendMail');
	var objectStore = this.database.transaction(this.offlineMboxName).objectStore(this.offlineMboxName);
	    objectStore.openCursor().onsuccess = function(event) {
	    	var cursor = event.target.result;    	
	    	if (cursor) {	    	
	    		if(cursor.value){
	    			var status=cursor.value.status;
	    			// console.log('send mail: '+status);
	    			if(status=='tosend'){
		    			var body=cursor.value.text;
						var to=cursor.value.to;
						var cc=cursor.value.cc;
						var bcc=cursor.value.bcc;

						//send
						console.log('send mail: '+body+' id: '+cursor.key);
						self.updateSaveSendMail(cursor.key);
			    	}
			    }	
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
	  var requestUpdate = objectStore.put(data,id);
	   requestUpdate.onerror = function(event) {
	     console.log(event);
	   };
	   requestUpdate.onsuccess = function(event) {
	   	console.log("id " +id +" update to sent");
	   };
	};
}

var dbt;
DBController.prototype.view=function(db){
	var objectStore = this.database.transaction("notes").objectStore("notes");
    objectStore.openCursor().onsuccess = function(event) {
    	var cursor = event.target.result;    	
    	if (cursor) {	    	
    		if(cursor.value){
		    	console.log("DB "+cursor.source.transaction.db.name);//+" "+cursor.value.mid
		    	console.log("MID "+cursor.key);		    	
		    	console.log("TO "+cursor.value.To);		    	
		    	console.log("FROM "+cursor.value.From);
		    	console.log("Subject "+cursor.value.Subject);		    	
		    	console.log("DATE "+cursor.value.Date);
		    	console.log("Received "+cursor.value.Received);	
				console.log("Body "+cursor.value.body);			    		    	
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

    objectStore.openCursor().onsuccess = function(event) {
    	var obj=function(id,from,sub,date,body){
			this.id=id;
			this.from=from;
			this.subject=sub;
			this.date=date;
			this.body=body;
		}

    	var cursor = event.target.result;    	
    	if(cursor==null){
    		console.log(UIresult.length);
    		cllBack(UIresult);
    	}		
		
    	if (cursor) {	    	
    		if(cursor.value){		    		
				var msg=new obj(cursor.key,cursor.value.From,cursor.value.Subject,cursor.value.Date,cursor.value.body);
				UIresult.push(msg);
				// console.log(msg);
				console.log("DB "+cursor.source.transaction.db.name);
		    }	

		    cursor.continue();
	    }
		
    }
}

DBController.prototype.addContain=function(record,id,folder){
	var self=this;

   	this.database.transaction(folder).objectStore(folder).get(parseInt(id)).onsuccess = function(event) {
   		//dbt=event;   		
	  	var transaction = self.database.transaction([folder], "readwrite");
	    var objectStore = transaction.objectStore(folder);
   		
   		if(event.target.result){
   			console.log('id '+id + ' already in database' );
   		}else{
   			var request=objectStore.add(record,id);
		    request.onsuccess = function(event) {
		    	//console.log(id+' '+event);
		    	console.log('id '+id + ' added to database' );
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
	    }

	    request.onupgradeneeded = function(event) {
	    	console.log('created mailBox '+folder);    
	        var db = event.target.result;
        	var objectStore = db.createObjectStore(folder, {autoIncrement:false});
	    }; 
	}

    this.getMailBoxes(fun);
    // createMailBox(path);

}

DBController.prototype.getMailBoxes=function(func){
	var boxes=new Array();
	result.ListFolder=new Array();
	self=this;

	if(!this.database){
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
    		if(cursor.value){
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

DBController.prototype.update=function(id,val,folder){

    var objectStore = this.database.transaction([folder], "readwrite").objectStore(folder);
	var request = objectStore.get(id);

	request.onerror = function(event) {
	  // Handle errors!
	};

	request.onsuccess = function(event) {
	  // Get the old value that we want to update
	  var data = request.result;

	  // update the value(s) in the object that you want to change
	  data.body = val;

	  // Put this updated object back into the database.
	  var requestUpdate = objectStore.put(data,id);
	   requestUpdate.onerror = function(event) {
	     console.log(event);
	   };
	   requestUpdate.onsuccess = function(event) {
	   	console.log("id " +id +" update "+event.type);
	   };
	};

}

