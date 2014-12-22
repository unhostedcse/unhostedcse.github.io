// username='unhostedcse@gmail.com';
// imaphost='imap.gmail.com';
// imapport='993';	
// imapsecurity='ssl';
	
document.addEventListener("testEvent",
	function(e) {  
		console.log(e);
	}
,false);

var sync=new Sync_Module(clearBody);
selectFolder='INBOX';
dbSelectFolder=selectFolder;
sync.init(addMsg,dbSelectFolder,setMailBoxBar);

// var adb=new DBController();
// adb.create_open_account_DB(
// 	function(){
// 		adb.loadAccount('unhostedcse@gmail.com'); 	
// 	};
// );

function initUnhosted(){
	dbSelectFolder=selectFolder;
	sync=new Sync_Module(clearBody);
	sync.init(addMsg,dbSelectFolder,setMailBoxBar);

	var a=document.getElementsByClassName('horde-icon');


	a[1].removeAttribute("idval");
	a[2].removeAttribute("idval");
	a[5].removeAttribute("idval");

	a[1].setAttribute("style","display: none");
	a[2].setAttribute("style","display: none");
	a[5].setAttribute("style","display: none");
}

function startSMTP(){ 

  sync.SendMail();
}

//checkmaillink
$(document).on("click",'#checkmaillink',
	function(e) {
		console.log('refresh mail boxes');

		sync.getMailBoxesScenario();  // uncomment

		// sync.refresh();
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

$(document).on("composeMail", 
	function(e){
		alert(e.type);
		console.log(e.type);		
	}
);


function view(){
	try{
		// var db=new DBController();
		// db.create_openDB(username);
		Sync_Module.db.getMessages(addMsg);

	}catch(e){
		console.log(e);
	}
}
var i=100;

function addMailBox(){
	try{
		Sync_Module.db.addMailBoxes('test','test'+(i++));
	}catch(e){
		console.log(e);
	}
}

function clearBody(){
	$(".vpRowHoriz.vpRow.DragElt").replaceWith('<div></div>');

	// $("#imp-specialmboxes").replaceWith('<div id="imp-specialmboxes"></div>');
	$("#imp-specialmboxes").empty();

	$(".from").html('');
	$(".subject").html('');
	$("#previewMsg .date").html('');
	$(".from_allowTextSelection").html('');
	document.getElementById('bodyDisplay').innerHTML='';

	$("#setting").empty();
	// $("#msgHeadersColl").css("display","none");

	// $("#msgHeadersColl").css("display");
}

function addMsg(mails){

	console.log('mail cnt: '+mails.length);
	for(var i=0;i<mails.length;i++){
		var msg=mails[i];

		//chrome not support contain
		if(msg.seen.indexOf('\\Seen') >= 0 ) {
		//if(msg.seen.contains('\\Seen')){
			var seen=true;
		}else{
			var seen=false;
		}
		
		var date=DateUtil.toShortString(msg.date);
		var size=Math.ceil(msg.size/1024);

        $('.msglist').append('<div class="vpRowHoriz vpRow DragElt ' + (seen ? "" : 'flagUnseen') +'" id="'+msg.id+'" style="-moz-user-select: none;"></div>');
		
		var $good=$(".vpRowHoriz.vpRow.DragElt").last();
		
		$good.append('<div class="msgStatus">'+
			'<div class="iconImg msCheck"></div>'+
			(seen ? "" : '<div class="iconImg msgflags flagUnseen" title="Unseen"></div>')+
			'</div>');
		$good.append('<div class="msgFrom sep" title="' + msg.from + '">' + msg.from + '</div>');
		$good.append('<div class="msgSubject sep" title="Tested">'+msg.subject+'</div>');
		$good.append('<div class="msgDate sep">'+date+'</div>');
		$good.append('<div class="msgSize sep">'+size+' KB</div>');
		//$good.append('<a id="body" class="body" href="'+msg.body+'" style="display: none;"></a>');
		// alert(msg.body);
		$good.append('<textarea style="display: none;" class="body">'+msg.body+'</textarea>');
		

	}
	$( "div[title='"+selectFolder+"']").addClass('horde-subnavi-active');
	UIresult="";
}

$(document).on("click",'.vpRowHoriz.vpRow.DragElt',function() {

	var a=document.getElementsByClassName('horde-icon');
	a[1].removeAttribute("style");
	a[2].removeAttribute("style");
	a[5].removeAttribute("style");


	$('.vpRowHoriz.vpRow.DragElt.vpRowSelected').removeClass('vpRowSelected');
	var val=$(this).attr('id');

	a[1].setAttribute("idval",val);
	a[2].setAttribute("idval",val);
	a[5].setAttribute("idval",val);

	// alert(val);

    $(this).addClass('vpRowSelected');

	var text=$(this).find(".msgFrom").text();
	var sub=$(this).find(".msgSubject").text();
	var date=$(this).find(".msgDate").text();

	$(".from").html(text);
	$(".subject").html(sub);
	$("#previewMsg .date").html(date);
	$(".from_allowTextSelection").html('from');
	
	var body=$(this).find(".body").text();

	//document.getElementById('bodyDisplay').innerHTML=QPDec(body);
	document.getElementById('bodyDisplay').innerHTML=body;

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

		selectFolder=mailBox;
		dbSelectFolder=selectFolder;
		initUnhosted();
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
	  			'<a>'+name+'</a>'+
			'</div>'+
	  	'</div>';

		var $good=$("#imp-specialmboxes").last();
		
		$good.append(div);
	};
	
}

function startMe1(){
	sync.getUids();
}

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
	var mid=a[1].getAttribute('idval');

	var mbox=selectFolder;
	var action='reply';
	var uid=userID;

	var url='./write.html?action='+action+'&id='+uid+'&mbox='+mbox+'&mid='+mid;
	javascript:void window.open(url,'1417505292623',
      'width=750,height=500,toolbar=0,menubar=0,location=0,status=1,scrollbars=1,resizable=1,left=0,top=0');
}

function openForwardWindow(){
	var a=document.getElementsByClassName('horde-icon');	
	var mid=a[1].getAttribute('idval');

	var mbox=selectFolder;
	var action='forward';
	var uid=userID;

	var url='./write.html?action='+action+'&id='+uid+'&mbox='+mbox+'&mid='+mid;
	javascript:void window.open(url,'1417505292623',
      'width=750,height=500,toolbar=0,menubar=0,location=0,status=1,scrollbars=1,resizable=1,left=0,top=0');
}