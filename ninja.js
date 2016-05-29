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

document.addEventListener('DOMContentLoaded', function()
{
  doCurrentTab(function doInject(tab)
  {
    var toInject =
    {
      'email' : 'me@you.lol',
      'password' : 'panpan'
    }

    chrome.tabs.executeScript(
      tab.id,
      {
        'file' : 'inject-credentials.js'
      },
      function callback(results)
      {
        chrome.tabs.sendMessage(tab.id, JSON.stringify(toInject), {}, injectCallback)
      }
    );
  })

});

function injectCallback(result)
{
  console.log("Ninja bananas : " + result);
}
