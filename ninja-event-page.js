function onInit() {

}


var registeredNinjas = [];
function registerNinjaListener(ninja) {
  registeredNinjas.push(ninja);

}

chrome.runtime.onMessage.addListener(function messageListener(messageJson, sender, sendResponse) {
  var message = JSON.parse(messageJson);

});

function ninjaTick() {
  registeredNinjas.forEach(function (ninja) {

  });
}
