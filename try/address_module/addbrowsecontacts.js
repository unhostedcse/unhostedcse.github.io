todoDB.open(function(){
  console.log('DB opened');
  }
);



$( document ).ready(function() {	
	$( "#searach-contact-form" ).submit(function( event ) {
		var valsearchcontacts = document.getElementById('val-search-contacts');
		var searchEntry = valsearchcontacts.value; 
		if(searchEntry==''){
			$( "#horde-content table" ).remove();
			document.getElementById("horde-content").innerHTML = "";
			event.preventDefault();
			return false;
		}
		// Check to make sure the text is not blank (or just spaces).
		if (searchEntry.replace(/ /g,'') != '') {
			todoDB.fetchMy(searchEntry,function(result){
				if(result.length != 0){
					$( "#horde-content table" ).remove();
					document.getElementById("horde-content").innerHTML = "";
					$( "#horde-content" ).append('<table cellspacing="0" width="100%" class="linedRow"><thead><tr><th class="item leftAlign" width="90%" nowrap="nowrap">Name</th><th class="item leftAlign" width="90%" nowrap="nowrap">Surname</th><th class="item leftAlign" width="90%" nowrap="nowrap">Email</th></tr></thead><tbody id="QuickFinderContacts"></tbody></table>');		
					for(var i = 0; i < result.length; i++) {	
					//var st=output[i].name.concat(' <').concat(' ' +output[i].email+ ' ').concat('>');
					$( "#QuickFinderContacts" ).append('<tr class=""><td><a>'+result[i].name+'</a></td><td><a>'+result[i].surname+'</a></td><td><a>'+result[i].email+'</a></td></tr>');
		
					}
				}else{
					document.getElementById("horde-content").innerHTML = "";
					$( "#horde-content table" ).remove();
					$( "#horde-content" ).append('<div><span class="light_red">No matching contacts!</span></div>');
				}				
			});
		}
		// Reset the input field.
		searchEntry.value = '';
		event.preventDefault();
		
		
		
	});
	$( "#turba_form_addcontact" ).submit(function( event ) {
		var object_firstname_ = document.getElementById('object_firstname_');
		var object_lastname_ = document.getElementById('object_lastname_');
		var object_surname_ = document.getElementById('object_surname_');
		var fname = object_firstname_.value;
		var surname = object_surname_.value;
		var usermail = object_lastname_.value;
		
		var filter = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;        
        if (!filter.test(usermail)) {
          alert('Please provide a valid email address'); 
		  event.preventDefault();
          return;
        }
		// Check to make sure the text is not blank (or just spaces).
		if (fname.replace(/ /g,'') != '') {
			//alert(fname);
		}
		if (usermail.replace(/ /g,'') != '') {
			//alert(usermail);
		}
		if (surname.replace(/ /g,'') != '') {
			//alert(usermail);
		}
		todoDB.createfromuiTodo(fname,surname,usermail,function(){
			alert('enrty created '+fname+" "+usermail+" "+usermail);
		});
		// Reset the input field.
		object_firstname_.value = '';
		object_lastname_.value = '';
		event.preventDefault();
	});
	
});

