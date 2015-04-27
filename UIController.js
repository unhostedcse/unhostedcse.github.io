document.addEventListener("testEvent",
	function(e) {  
		console.log(e);
	}
,false);

var db=new DBController();
db.create_open_account_DB(loadAcc);

function loadAcc(){
	var uid=getParameterByName('uid');
	pid=getParameterByName('pid');
	var mbox=getParameterByName('mbox');
	selectFolder=mbox;

	console.log('pid: '+pid);	
	loadOtherAcc();
	try{
		uid=parseInt(uid);
		pid=parseInt(pid);
		db.loadAccountById(uid,start);
	}catch(e){
		location.href='./select.html';
		console.log('Bad account ID');
	}	
}

function loadOtherAcc(){    
  db.getAccounts(showOtherAcc);
}

function showOtherAcc(msgs){
  var msg;
  for (var i = 0; msg=msgs[i],i < msgs.length; i++) {
    var refLink = "./index.html?uid="+msg.id+"&pid=0";
    $("#otherAcc").append( '<li role="presentation"><a role="menuitem" tabindex="1" href="'+refLink+'">' + msg.username + '</a></li>' );
  };
  var logout="Sign out";
  var configuration="Configuration";
  $("#otherAcc").append('<li role="presentation" class="divider"></li>');
  $("#otherAcc").append('<li role="presentation" class="dropdown-header">Settings</li>');  
  $("#otherAcc").append( '<li role="presentation"><a role="menuitem" tabindex="1" href="./settings.html">' + configuration+ '</a></li>' ); 
  $("#otherAcc").append( '<li role="presentation"><a role="menuitem" tabindex="2" href="./select.html">' + logout+ '</a></li>' ); 
}

var sync;
function start(status){	
	if(status){
		showAccountName();
		db.create_openDB(username,'',
			function(){
				db.getMailBoxes(function(boxs){
					if(boxs && boxs.length>0){
						selectFolder=selectFolder ? selectFolder : boxs[0];						
						// selectFolder='INBOX';						
					}
					dbSelectFolder=selectFolder;				
					sync=new Sync_Module(clearBody);
					sync.init(addMsg,dbSelectFolder,setMailBoxBar);
					db.closeDB();
				});
			});

		setTime();
	}else{
		location.href='./select.html';
	}
}

function setTime(){
	var date=new Date();
	date= date.toUTCString();
	date = date.replace(/(\w+, \d+ \w+) (\d{2}) /, "$1 20$2 ");
	date=Date.parse(date)
	date=DateUtil.toShortString(date);
	$('#horde-date').text("Today: "+date);
}


function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),results = regex.exec(location.href);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function initUnhosted(){
	dbSelectFolder=selectFolder;
	sync=new Sync_Module(clearBody);
	sync.init(addMsg,dbSelectFolder,setMailBoxBar);

	var a=document.getElementsByClassName('horde-icon');


	a[3].removeAttribute("idval");
	a[4].removeAttribute("idval");
	a[5].removeAttribute("idval");

	a[3].setAttribute("style","display: none");
	a[4].setAttribute("style","display: none");
	a[5].setAttribute("style","display: none");
	//loadSettings();
}

function startSMTP(){ 
  sync.SendMail();
}


function showAccountName(){
	document.getElementById('accountName').innerHTML=username;
}

//checkmaillink
$(document).on("click",'#checkmaillink',
	function(e) {
		$('#progress_row').css('height', '10px');
		$('#progress_bar').css('display', 'inline');
		//$('#checkmaillink').addClass('imp-loading');

		console.log('refresh mail boxes');

		if(autoSync){
			sync.getMailBoxesScenario();			
		}else{
			if(selectFolder && selectFolder!="" && selectFolder!=null){
				dbSelectFolder=selectFolder;
				sync.getUids();
			}else{
				sync.getMailBoxesScenario();
			}
		}

	}
);

//after download mboxes
$(document).on("mailBoxesDownloaded-false", 
	function(e){
		console.log('mailBoxesDownloaded');

		db.create_openDB(username,'',
			function(){
				db.getMailBoxes(function(boxs){
					if(boxs && boxs.length>0){
						selectFolder=boxs[0];						
					}
					dbSelectFolder=selectFolder;									
					db.closeDB();
					initUnhosted();
					sync.getUids();
			});
		});		
	}
);

//after download mboxes
$(document).on("mailBoxesDownloaded", 
	function(e){
		console.log('mailBoxesDownloaded');
		Sync_Module.db.getMailBoxes();
	}
);


//After read mail boxes
var mboxCnt=0;
var mboxList;
$(document).on("mailBoxesRead", 
	function(e){
		console.log(e.type);
		
		var mboxes=e.folders;
		setMailBoxBar(mboxes);
		mboxList=mboxes;

		if(mboxes && mboxes.length>0){
			console.log(mboxCnt+" "+mboxes[mboxCnt]);
			// selectFolder=mboxes[mboxCnt];
			dbSelectFolder=mboxes[mboxCnt];
			// initUnhosted();
			sync.getUids();
			mboxCnt++;
		}
	}
);

$(document).on("mailBoxesReadNext", 

	function continueRefresh(){
		var mboxes=mboxList;
		if(mboxes && mboxes.length>mboxCnt){

				if(mboxes[mboxCnt]=='[Gmail]'){
					mboxCnt++;
				}

					console.log(mboxes[mboxCnt]);
					// selectFolder=mboxes[mboxCnt];
					dbSelectFolder=mboxes[mboxCnt];
					// initUnhosted();
					sync.getUids();
			mboxCnt++;
		}
	}
);

// $(document).on("composeMail", 
// 	function(e){
// 		alert(e.type);
// 		console.log(e.type);		
// 	}
// );


// function view(){
// 	try{
// 		// var db=new DBController();
// 		// db.create_openDB(username);
// 		Sync_Module.db.getMessages(addMsg);

// 	}catch(e){
// 		console.log(e);
// 	}
// }
// var i=100;

// function addMailBox(){
// 	try{
// 		Sync_Module.db.addMailBoxes('test','test'+(i++));
// 	}catch(e){
// 		console.log(e);
// 	}
// }

function clearBody(){
	$(".vpRowHoriz.vpRow.DragElt").replaceWith('<div></div>');

	// $("#imp-specialmboxes").replaceWith('<div id="imp-specialmboxes"></div>');
	$("#imp-specialmboxes").empty();

	$(".from").html('');
	$(".subject").html('');
	$("#previewMsg .date").html('');
	$(".from_allowTextSelection").html('');
	//document.getElementById('bodyDisplay').innerHTML='';

	$("#setting").empty();
	// $("#msgHeadersColl").css("display","none");

	// $("#msgHeadersColl").css("display");
}

function addMsg(mails){
	// $('.msglist').empty();
	console.log('mail cnt: '+mails.length);
	for(var i=0;i<mails.length;i++){
		var msg=mails[i];

		//chrome not support contain
		if(msg.seen && msg.seen.indexOf('\\Seen') >= 0 ) {
		//if(msg.seen.contains('\\Seen')){
			var seen=true;
		}else{
			var seen=false;
		}
		
		var date=DateUtil.toShortString(msg.date);

		if(msg.size=='-')
			var size=msg.size;
		else
			var size=msg.size;

        $('.msglist').append('<div class="row vpRowHoriz vpRow DragElt ' + (seen ? "" : 'flagUnseen') +'" id="'+msg.id+'" style="-moz-user-select: none; margin-left:5px;"></div>');
		
		var $good=$(".vpRowHoriz.vpRow.DragElt").last();
		
		$good.append(									
														'<div class="col-md-1 msgStatus">'+
														'<div class="iconImg msCheck "></div>'+
										(seen ? ""	: 	'<div class="iconImg msgflags flagUnseen" title="Unseen"></div>')+
		(msg.attachments && msg.attachments.length>0 ?	'<div class="iconImg msgflags flagAttachmsg" title="Attachments"></div>': "")+
														'</div>');
		// $good.append('<div class="iconImg msgflags flagAnswered" title="Flagged for Followup"></div>');

		var from=SimpleMailAddress.parse(msg.from);

		// var name=from.name || from.email; // ori
		// var email=from.email; // ori

		var name=from && from.name ? from.name : ( from && from.email ? from.email : null);
		var email=from && from.email ? from.email : null;
		//var name=from ? from.name || from.email : null;

		

		$good.append('<div class="col-md-2 msgFrom sep" title="' + email + '">' + name + '</div>');
		$good.append('<div class="col-md-7 msgSubject sep" title="'+msg.subject+'">'+msg.subject+'</div>');
		$good.append('<div class="col-md-1 msgDate sep">'+date+'</div>');
		$good.append('<div class="col-md-1 msgSize sep">'+size+' KB</div>');
		$good.append('<div class="mid sep" style="display: none;">'+msg.id+'</div>');// for keep mail id
		//$good.append('<a id="body" class="body" href="'+msg.body+'" style="display: none;"></a>');

		// $good.append('<textarea style="display: none;" class="body">'+msg.body+'</textarea>');		
	}
	$( "div[title='"+selectFolder+"']").addClass('horde-subnavi-active');
	UIresult="";
}

function createAttachmentLink(file){	
	var size=Math.ceil(file.uri.length/1024);
	var msg=''+
	'<div class="att">'+
	'<img src="ui/graphics/attachment.png" alt="" width="18" height="18" class="iconU logo"/>'+
	'<span class="name">'+file.name+'</span>'+
	'<span class="size"> ('+size+' KB)</span>'+
	'<a mid="5" class="iconU downloadU" title="Download" download="'+file.name+'" href="'+file.uri+'"> </a>'+
	// '<a class="iconU closeU" title="Close"></a>'+
	'</div>';
	return msg;
}

// function createAttachmentLink(file){

// 	var link='<a class="attachment" title="'+file.name+'" download="'+file.name+'" href="'+file.uri+'">'+ file.name +'</a>';
// 	// document.getElementById('bodyDisplay').innerHTML+=link;
// 	return link;

// }

//show the body after after select a msg
$(document).on("click",'.vpRowHoriz.vpRow.DragElt',function() {
	// document.getElementById('bodyDisplay').innerHTML="";	
	document.getElementById('bodyDisplay').srcdoc="";
	// sync.getbody();

	var a=document.getElementsByClassName('horde-icon');
	a[3].removeAttribute("style");
	a[4].removeAttribute("style");
	a[5].removeAttribute("style");

	$('.vpRowHoriz.vpRow.DragElt.vpRowSelected').removeClass('vpRowSelected');
	var val=$(this).attr('id');

	a[3].setAttribute("idval",val);
	a[4].setAttribute("idval",val);
	a[5].setAttribute("idval",val);

    $(this).addClass('vpRowSelected');

	var text=$(this).find(".msgFrom").text();
	var sub=$(this).find(".msgSubject").text();
	var date=$(this).find(".msgDate").text();
	var mid=parseInt($(this).find(".mid").text());
	console.log(""+sub);
	

	$(".from").html(text);
	$(".subject").html(sub);
	$(".date").html(date);
	$(".from_allowTextSelection").html('from');
	
	var db=new DBController();
	db.create_openDB(username ,"",
            function(){

				var row=$('.vpRowHoriz.vpRow.DragElt.flagUnseen.vpRowSelected');
					if(row.length>0){
						console.log("Unseen msg Selected");
						db.setMailFlagById(mid,selectFolder,function(){
							row.removeClass("flagUnseen");							
							row.find(".iconImg.msgflags.flagUnseen").removeClass("flagUnseen");							
						});
					}

              	db.getMailById(mid,selectFolder,function(msg){
              	var body=msg.body;

              	if(!body){
              		sync.getBody(mid);
              		return;
              	}else if(body=="deleted"){
              		sync.getBody(mid);
              		return;
              	}

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
				//document.getElementById('bodyDisplay').innerHTML=body;				

				var dis=document.getElementById('bodyDisplay');
				dis.srcdoc=body;

				// dis.src = "data:text/html;charset=utf-8," + escape(body);				

              });
            }
    );	

	}
);

//Quoted printable decoding
function QPDec(s)
{
    return s.replace(/=[\r\n]+/g, "").replace(/=[0-9A-F]{2}/gi,
		function(v){ 
			return String.fromCharCode(parseInt(v.substr(1),16)); 
		}
	);
}

//Quoted printable encoding
function QPEnc(s)
{
        return s.replace(/=/g, "=3D").replace(/[^ -~\r\n\t]/g,
                function(v) { return "=" + v.charCodeAt(0).toString(16); });
}

// select mailboxs
$(document).on("click",'.horde-subnavi-point',
	function(e) {
		
		var mailBox=$(this).find("a").text();

		// $( "div[title='"+mailBox+"']").addClass('horde-subnavi-active');
		// console.log(mailBox);

		var uid=getParameterByName('uid');
		var pid=0;
		uid=parseInt(uid);

		var url='./index.html?uid='+(uid)+'&pid='+(pid)+'&mbox='+mailBox;
		location.href=url;

		// selectFolder=mailBox;
		// dbSelectFolder=selectFolder;
		// initUnhosted();

		// sync.getUids();
	}
);
//321 index.html
function setMailBoxBar(mail){
	$("#imp-specialmboxes").empty();

	for (var i = 0; i < mail.length; i++) {
		var name=mail[i];
		var div=""+
		'<div class="horde-subnavi imp-sidebar-mbox DropElt DragElt" title="'+name+'" id="'+name+'">'+
	    	'<div class="horde-subnavi-icon inboxImg"></div>'+
			'<div class="horde-subnavi-point">'+
	  			'<a><span class="green">'+name+'</span></a>'+
			'</div>'+
	  	'</div>';

		var $good=$("#imp-specialmboxes").last();
		
		$good.append(div);
	};
	
}

// function startMe1(){
// 	sync.getUids();
// }

function startMailBoxesScenario(){
	sync.getMailBoxesScenario();
}


function setSetting(){

 	var x = document.getElementById("setting").value; 	
  	console.log('select Account '+x);
	Sync_Module.db.loadAccount(x); 	
	
 }

 $(document).on("loadAccount",
 		function(){
			initUnhosted();
			console.log('loading....');
		}
); 

function openWriteWindow(){
	var action='compose';
	var uid=userID;
	var url='./write.html?action='+action+'&id='+uid;
	javascript:void window.open(url,'1417505292623',
      'width=750,height=500,toolbar=0,menubar=0,location=0,status=1,scrollbars=1,resizable=1,left=0,top=0');
}

function openReplyWindow(){

	var a=document.getElementsByClassName('horde-icon');	
	var mid=a[3].getAttribute('idval');

	var mbox=selectFolder;
	var action='reply';
	var uid=userID;

	var url='./write.html?action='+action+'&id='+uid+'&mbox='+mbox+'&mid='+mid;
	javascript:void window.open(url,'1417505292623',
      'width=750,height=500,toolbar=0,menubar=0,location=0,status=1,scrollbars=1,resizable=1,left=0,top=0');
}

function openForwardWindow(){
	var a=document.getElementsByClassName('horde-icon');	
	var mid=a[4].getAttribute('idval');

	var mbox=selectFolder;
	var action='forward';
	var uid=userID;

	var url='./write.html?action='+action+'&id='+uid+'&mbox='+mbox+'&mid='+mid;
	javascript:void window.open(url,'1417505292623',
      'width=750,height=500,toolbar=0,menubar=0,location=0,status=1,scrollbars=1,resizable=1,left=0,top=0');
}

function nextPage(){
	var uid=getParameterByName('uid');
	var pid=getParameterByName('pid');
	uid=parseInt(uid);
	pid=parseInt(pid);

	var url='./index.html?uid='+(uid)+'&pid='+(pid+1)+'&mbox='+selectFolder;
	location.href=url;
}

function previousPage(){
	var uid=getParameterByName('uid');
	var pid=getParameterByName('pid');
	uid=parseInt(uid);
	pid=parseInt(pid);

	if(pid<1)
		return;
	var url='./index.html?uid='+(uid)+'&pid='+(pid-1)+'&mbox='+selectFolder;
	location.href=url;
}

function DeleteMessages(){
	console.log('delete');
	var ids=new Array();
	var items=$('.vpRowHoriz.vpRow.DragElt.vpRowSelected');
	var id;
	for (var i = 0;i < items.length; i++) {
		id=items[i].id;
		ids.push(parseInt(id));
		console.log(id);	
	};
	console.log(ids);

	sync.delete(ids,selectFolder,true,function(){location.reload();});
}

/////notification
(function($){
	// $(document).on("notify1",function(event){console.log(event)});

	$(document).on("notifier",function(event){
		var ob=event.obj;
		$.notifier({"type": ob.type,
	                "title": ob.title,
	                "text": ob.text,
	                "positionY": "bottom",
	                "positionX": "left",
	                "animationIn" : 'bounce',
                	"animationOut" : 'drop'
	    });
		/*$('.bottom-left').notify({
    			message: { text: ob.text }
  		}).show(); */
	});    
})(jQuery);

$(document).on("test",function(event){
	console.log('test');
});

function loadSettings(){
	refresh_interval=localStorage.getItem("refresh_interval");	;
	autoSync=localStorage.getItem("autoSync");
	msgPP=localStorage.getItem("msgPP");	;
	maxMsg=localStorage.getItem("maxMsg");
	console.log("Settings loaded");
}

$(function() {
    $( "#dialog-message" ).dialog({
      modal: true,
      buttons: {
        Ok: function() {
          $( this ).dialog( "close" );
        }
      }
    });
  });
