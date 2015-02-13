$(document).ready(function() {	
	$("#subject").click(function(){
		$('div.hordeACBox.impACBox.impACBoxFocus').removeClass("impACBoxFocus");
		
	});
	$("#sendto").click(function(){
		$('div.hordeACBox.impACBox.impACBoxFocus').removeClass("impACBoxFocus");
		$('#sendto div').addClass("impACBoxFocus");
		$('#sendto div input').focus();
		
	});
	$("#sendcc").click(function(){
		$('div.hordeACBox.impACBox.impACBoxFocus').removeClass("impACBoxFocus");
		$('#sendcc div').addClass("impACBoxFocus");
		$('#sendcc div input').focus();
		
	});
	$("#sendbcc").click(function(){
		$('div.hordeACBox.impACBox.impACBoxFocus').removeClass("impACBoxFocus");
		$('#sendbcc div').addClass("impACBoxFocus");
		$('#sendbcc div input').focus();
		
	});
	$('body').on("click",'.KeyNavList ul li',function(e) {	
		
		var currentparent_id=$(this).parent().parent().attr('data-belongs');		
		var content=this.innerText;		

		var t=new SMTP_Sendmail();

		content=e.target.firstChild.textContent;
		var SimpleMailAddressObject=t.parse(content);		
		
		if(!SimpleMailAddressObject && SimpleMailAddressObject.name==''){
			//alert('empty name');
			SimpleMailAddressObject.name=SimpleMailAddressObject.email;
		}
		
		$('<li class="hordeACListItem" title="'+content+'"> ' + SimpleMailAddressObject.name + ' <img class="hordeACItemRemove impACItemRemove" src="./graphics/delete-small.png"></li>').insertBefore("#"+currentparent_id+" ul li:last-child");		
		var x = document.getElementById(currentparent_id);
		var y = x.getElementsByTagName("input")[0];
		y.value='';
			
		var current_id=$('#'+currentparent_id+' textarea').attr('id');
		if($("#"+current_id).val()==''){
			$("#"+current_id).val(content);
		}else{
			$("#"+current_id).val($("#"+current_id).val()+","+content);
		}
		
		
	});
	$('body').on("click",'#sendto ul li img',function() {
		var $r=$(this);
		var title=$(this).parent().attr('title');
		var current_id=$('#sendto textarea').attr('id');
		del(current_id,title,$r);
	});
	$('body').on("click",'#sendcc ul li img',function() {
		var $r=$(this);
		var title=$(this).parent().attr('title');
		var current_id=$('#sendcc textarea').attr('id');
		del(current_id,title,$r);
	});
	$('body').on("click",'#sendbcc ul li img',function() {
		var $r=$(this);
		var title=$(this).parent().attr('title');
		var current_id=$('#sendbcc textarea').attr('id');
		del(current_id,title,$r);
	});
	$('.hordeACTrigger.impACTrigger').keyup(function(event){ // when comma pressed for normal email addressses  , manually enterered
		if(event.which==188){			///// This doesn't have name. 
			var content=$(this).val(); 
			content=content.replace(',','');
			var currentparent_id=$(this).parent().parent().parent().parent().parent().attr('id');
			$('<li class="hordeACListItem" title="'+content+'"> ' + content + ' <img class="hordeACItemRemove impACItemRemove" src="./graphics/delete-small.png"></li>').insertBefore("#"+currentparent_id+" ul li:last-child");		
			var x = document.getElementById(currentparent_id);
			var y = x.getElementsByTagName("input")[0];
			y.value='';
			
			var current_id=$('#'+currentparent_id+' textarea').attr('id');
			if($("#"+current_id).val()==''){
				$("#"+current_id).val(content);
			}else{
				$("#"+current_id).val($("#"+current_id).val()+","+content);
			}
		} 
	});
	
});
function del(current_id,title,$r){
	var d=title;
	var t=$("#"+current_id).val();
	var s = d.concat(',');
	var end=','.concat(d);
	if(t.indexOf(s) > -1){
		var p=t.replace(s,'');
	}else if(t.indexOf(end) > -1){
		var p=t.replace(end,'');
	}else{
		var p=t.replace(d,'');
	}
	$("#"+current_id).val(p);
	$r.parent().remove();
}

