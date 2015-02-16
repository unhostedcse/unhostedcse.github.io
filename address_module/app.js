/*window.onload = function() {
  todoDB.open(refreshTodos);

//var newTodoForm = document.getElementById('new-todo-form');
//var newTodoInput = document.getElementById('new-todo');


newTodoForm.onsubmit = function() {
  // return;
  // Get the todo text.
  var text = newTodoInput.value;

  // Check to make sure the text is not blank (or just spaces).
  if (text.replace(/ /g,'') != '') {
    // Create the todo item.
    todoDB.createTodo(text, function(todo) {
      refreshTodos();
    });
  }

  // Reset the input field.
  newTodoInput.value = '';

  // Don't send the form.
  return false;
};

// Update the list of todo items.
function refreshTodos() {  
  todoDB.fetchTodos(function(todos) {
    var todoList = document.getElementById('todo-items');
    todoList.innerHTML = '';

    for(var i = 0; i < todos.length; i++) {
      // Read the todo items backwards (most recent first).
      var todo = todos[(todos.length - 1 - i)];

      var li = document.createElement('li');
      li.id = 'todo-' + todo.name;
      var checkbox = document.createElement('input');
      checkbox.type = "checkbox";
      checkbox.className = "todo-checkbox";
      checkbox.setAttribute("data-id", todo.email);

      li.appendChild(checkbox);

      var span = document.createElement('span');
      span.innerHTML = todo.email;

      li.appendChild(span);

      todoList.appendChild(li);

      // Setup an event listener for the checkbox.
      checkbox.addEventListener('click', function(e) {
        var id = e.target.getAttribute('data-id');

        todoDB.deleteTodo(id, refreshTodos);
      });
    }

  });
}

};





function myFunction() {
  var newTake = document.getElementById('query1');
  var text = newTake.value;
  todoDB.fetchMy(text);
  
}

function readSingleFile(e) {
// alert('ok');
  var file = e.target.files[0];
  if (!file) {
    return;
  }
 
  var reader = new FileReader();
  reader.onload = function(e) {
    var contents = e.target.result;
    displayContents(contents);
  };
  reader.readAsText(file);
}

function displayContents(contents) {
  var element = document.getElementById('file-content');
  //element.innerHTML = contents;
  var data = $.csv.toArrays(contents);
  element.innerHTML =data[0];

    
  var start = document.getElementById('start').value;
  var end = document.getElementById('end').value;
  var x,y;
  var d=String(data[0]);
  var res = d.split(',');
  
  for(var a = 0; a < res.length; a++) {	
	if(start==res[a]){
		x=a;
	}
	if(end==res[a]){
		y=a;
	}
  }
  alert(x);
  alert(y);
  var set=[];
  for(var a = 1; a < data.length; a++) {	
	var d=String(data[a]);
	var res = d.split(',');
	set[a-1]=res[x]+"---"+res[y];
  }
  for(var a = 1; a < set.length; a++) {
		console.log(set[a]);
  }
  // call tbd with data[]
  var element = document.getElementById('test');
  element.innerHTML =res[0];
  
  todoDB.createFromCSV(data,x,y, function(todo) {
      refreshTodos();
    });
 // alert(data.length);
}

*/

todoDB.open(function(){
  console.log('DB opened')
  }
);

function Address_Module(){};

Address_Module.prototype.suggestMails=function(email,currentparent_id){
	var d=$("#"+currentparent_id+" div.hordeACBox.impACBox");
	var pos=d.position();

	todoDB.fetchMy(email,function(output){
	document.getElementById("bath").innerHTML= '';
	$('body').append('<div class="KeyNavList" data-belongs="'+currentparent_id+'" style="left:'+pos.left+' ; top: '+(pos.top+24)+';"><ul></ul></div>');	
	for(var i = 0; i < output.length; i++) {	
		var st=output[i].name.concat(' <').concat(' ' +output[i].email+ ' ').concat('>');
		var $good=$(".KeyNavList ul").last();		
		$good.append('<li> ' + st + '  </li>');
		
	}
  }); 
}