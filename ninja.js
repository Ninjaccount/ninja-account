document.addEventListener('DOMContentLoaded', function()
{
  chrome.tabs.executeScript(
    null,
    {
        'file' : 'inject-credentials.js'
    },
    injectCallback
  );
});

function injectCallback(results)
{
    console.log("Ninja bananas : " + results[0]);
}
