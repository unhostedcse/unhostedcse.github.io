$(document).ready(function() {
    $('.addo').click(function() {
		var val='sash';var num='bash';
        $("#imp-specialmboxes").append('<div class="horde-subnavi imp-sidebar-mbox DropElt DragElt" title="' + val + '"></div>');
		
		var $good=$(".horde-subnavi.imp-sidebar-mbox.DropElt.DragElt").last();
		
		$good.append('<div class="horde-subnavi-point"><a><strong>' + num + '<span class="count" dir="ltr">(2)</span></strong></a></div>');

    });
});

