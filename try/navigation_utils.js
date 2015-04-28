function redirectToAddContact(){
     var redirectUrl = './NewContact.html?uid='+userID;
     window.location = redirectUrl;
}

function redirectToBrowseContact(){
     var redirectUrl = './BrowseContact.html?uid='+userID;
     window.location = redirectUrl;
}

function redirectToLoadCSV(){
     var redirectUrl = './LoadCSV.html?uid='+userID;
     window.location = redirectUrl;
}


function showInbox(){
     var redirectUrl = './index.html?uid='+getParameterByName('uid')+'&pid=0';
     console.log(redirectUrl);
     window.location = redirectUrl;
}

function getParameterByName(name) {
      name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
      var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),results = regex.exec(location.href);
      return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}


function moveToAddContact(){
     var redirectUrl = './NewContact.html?uid='+getParameterByName('uid');
     window.location = redirectUrl;
}

function moveToBrowseContact(){
     var redirectUrl = './BrowseContact.html?uid='+getParameterByName('uid');
     window.location = redirectUrl;
}

function moveToLoadCSV(){
     var redirectUrl = './LoadCSV.html?uid='+getParameterByName('uid');
     window.location = redirectUrl;
}


function navigateThrghAddrMod(page){
  var redirectUrl;
  switch (page){
    case 1:
      redirectUrl = './NewContact.html?uid='+getParameterByName('uid');
      break;
    case 2:
      redirectUrl = './LoadCSV.html?uid='+getParameterByName('uid');      
      break;  
    case 3:
      redirectUrl = './BrowseContact.html?uid='+getParameterByName('uid');
      break;

  }
  window.location = redirectUrl;
}