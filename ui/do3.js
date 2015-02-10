$(document).ready(function() {
    $('.addi').click(function(){
		var val='sash';var num='bash';
        $('.msglist').append('<div class="vpRowHoriz vpRow DragElt" id="VProw_2" style=""></div>');
		
		var $good=$(".vpRowHoriz.vpRow.DragElt").last();
		
		$good.append('<div class="msgStatus"><div class="iconImg msCheck"></div></div>');
		$good.append('<div class="msgFrom sep" title="' + num + '">' + val + '</div>');
		$good.append('<div class="msgSubject sep" title="Tested">Tested</div>');
		$good.append('<div class="msgDate sep">03/09/14</div>');
		$good.append('<div class="msgSize sep">1 KB</div>');
    });
});
