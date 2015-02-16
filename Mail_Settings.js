var username="";
var userID="";
var password="";
var imaphost="";
var imapport="";
var imapsecurity="";
var smtphost="";
var smtpport="";
var smtpsecurity="";

var result={};
var selectFolder;
var dbSelectFolder;
var Unhosted_version=2.0;
var dbVersion=10;
var pid=0;

var refresh_interval=getRefresh_interval();
var autoSync=getAutoSync();
var msgPP=getMsgPP();
var maxMsg=getMaxMsg();

function loadSettings(){
	refresh_interval=localStorage.getItem("refresh_interval");
	autoSync=localStorage.getItem("autoSync");
	msgPP=localStorage.getItem("msgPP");	;
	maxMsg=localStorage.getItem("maxMsg");
	console.log("Settings loaded");
}

function getRefresh_interval(){
	var val=localStorage.getItem("refresh_interval");
	if(val==null) localStorage.setItem("refresh_interval",10000);
	return parseInt(val) ? parseInt(val) :100000;
}

function getAutoSync(){
	var val=localStorage.getItem("autoSync");
	if(val==null) localStorage.setItem("autoSync",false);
	return val=="true" ? true :false;
}

function getMsgPP(){
	var val=localStorage.getItem("msgPP");
	if(val==null) localStorage.setItem("msgPP",10);
	return parseInt(val) ? parseInt(val) :10;
}

function getMaxMsg(){
	var val=localStorage.getItem("maxMsg");
	if(val==null) localStorage.setItem("maxMsg",30);
	return parseInt(val) ? parseInt(val) :30;
}