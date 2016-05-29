/*
var toInject =
{
  email : string,
  password : string
}
*/

chrome.runtime.onMessage.addListener(function listen(messageJson, sender, sendResponse)
{
  var toInject = JSON.parse(messageJson);

  console.log( toInject );

  sendResponse("I'm happy");
});

"Initialized";
