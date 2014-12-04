// $(document).ready(function() {
//     $(document).on("click",'.vpRowHoriz.vpRow.DragElt',function() {
// 		$('.vpRowHoriz.vpRow.DragElt.vpRowSelected').removeClass('vpRowSelected');
//         $(this).addClass('vpRowSelected');
// 		var text=$(this).find(".msgFrom").text();
// 		var sub=$(this).find(".msgSubject").text();
		
// 		 $(".from").html(text);
// 		  $(".subject").html(sub);
// 		  $(".fixed.leftAlign").html(sub + 'came from email address' + text );
//     });
// });


$('.vpRowHoriz.vpRow.DragElt').hover(
    function(){
      $(this).addClass('vpRowSelected2');
   },
   function(){
      $(this).removeClass('vpRowSelected2');
   }
);

