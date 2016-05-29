/**
* Get the current URL.
*
* @param {function(string)} callback - called when the URL of the current tab
*   is found.
*/
function doCurrentTab(callback)
{
  // Query filter to be passed to chrome.tabs.query - see
  // https://developer.chrome.com/extensions/tabs#method-query
  var queryInfo = {
    active: true,
    currentWindow: true
  };

  chrome.tabs.query(queryInfo, function(tabs) {
    // chrome.tabs.query invokes the callback with a list of tabs that match the
    // query. When the popup is opened, there is certainly a window and at least
    // one tab, so we can safely assume that |tabs| is a non-empty array.
    // A window can only have one active tab at a time, so the array consists of
    // exactly one tab.
    var tab = tabs[0];
    callback(tab);
  });
}

/**
* Injects resources provided as paths into active tab in chrome
* @param files {string[]}
* @returns {Promise}
*/
function injectResources(files) {
  var getFileExtension = /(?:\.([^.]+))?$/;

  //helper function that returns appropriate chrome.tabs function to load resource
  var loadFunctionForExtension = (ext) => {
    switch(ext) {
      case 'js' : return chrome.tabs.executeScript;
      case 'css' : return chrome.tabs.insertCSS;
      default: throw new Error('Unsupported resource type')
    }
  };

  return Promise.all(files.map(resource => new Promise((resolve, reject) => {
    var ext = getFileExtension.exec(resource)[1];
    var loadFunction = loadFunctionForExtension(ext);

    loadFunction(null, {file: resource}, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve();
      }
    });
  })));
}

function ninjaCreateAccount(){
  doCurrentTab(function doInject(tab)
  {
    var toInject =
    {
      'email' : 'me@you.lol',
      'password' : 'panpan',
      'name': 'coucou',
      'firstname': 'le lapin'
    }

    injectResources(['node_modules/jquery/dist/jquery.js', 'node_modules/lodash/lodash.js'])
    .then(() => {
      chrome.tabs.executeScript(
        tab.id,
        {
          'file' : 'inject-credentials.js'
        },
        function callback(results)
        {
          ninjaGuerrillaService.getNewAddress()
          .then(rep => {
            console.log('We got a ninja mail', rep);
            toInject.email = rep.email_addr;
            chrome.tabs.sendMessage(tab.id, JSON.stringify(toInject), {}, injectCallback)
          });
        }
      );
    })
    .catch(err => {
      console.error('Error occurred: ', err);
    });
  })
}

document.addEventListener('DOMContentLoaded', function()
{
  initializeView();
});

function initializeView(){
  $('#ninja-create-account').click(ninjaCreateAccount);
  replaceLinks($("#email-response"));
}

function injectCallback(resultJson)
{
  console.log("Ninja bananas : " , resultJson);
  var results = JSON.parse(resultJson);
  results.forEach(function( result )
  {
    var $el = $(`*[name="${result.key}-input"]`)
    if( $el.length == 0 ) return;
    $el.val( result.value );
    if( !result.injected ) return;
    $el.css('background-color', '#80FFD9');
    $el.css('color', '#222222');
  });

  $("#email-response").html("Waiting for email");

  setInterval(checkAndDisplayEmail, 5000);
}

function checkAndDisplayEmail(){
  ninjaGuerrillaService.getNewEmail()
  .then(email =>
  {
    replaceLinks( $("#email-response").html(email) );
  })
  .catch(err => console.log("still waiting"));
}

function replaceLinks( $el ){
  $el.find("a").each((i,a) => {
   var $a = $(a);
    $a.click(() => chrome.tabs.update(null, {url : a.href}));
  });
}
