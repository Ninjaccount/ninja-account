/**
* VARS
*/
/**The current Ninja loaded on popup display*/
var currentNinja;
var checkMailIntervalId;

/**
* Get the current URL.
*
* @param {function(string)} callback - called when the URL of the current tab
*   is found.
*/
var _currentTab;
function getCurrentTab()
{
  var promise = new Promise( (resolve, reject) => {
    if( _currentTab ){
      resolve(_currentTab);
      return;
    }
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
      _currentTab = tab;
      resolve(tab);
    });
  } );
  return promise;
}

function getCurrentDomain(){
  return getCurrentTab().then(tab => new URL(tab.url).hostname);
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

function prepareNinjaInjection(){
  return new Promise( (resolve, reject) =>
    getCurrentTab().then( tab =>
      injectResources(['node_modules/jquery/dist/jquery.js', 'node_modules/lodash/lodash.js'])
      .then(() => {
        chrome.tabs.executeScript(
          tab.id,
          {
            'file' : 'inject-credentials.js'
          }, function(results) {
            resolve(results);
          })
        }
      )
      .catch(err => console.error('Error occurred: ', err))
    )
  );
}

function ninjaCreateAccount(){
  clearEmailList();
  
  var newNinja =
  {
    'email' : 'me@you.lol',
    'password' : 'Str0ngP@ssw0rD',
    'name': 'GreatName',
    'firstname': 'BestFirstname',
    'address': '705 Pike Street',
    'city': 'Seattle',
    'zipcode': 'WA 98101',
    'state': 'washington',
    'country': 'USA',
    'phone': '206-694-5000'
  }

  prepareNinjaInjection().then(results => {
    ninjaGuerrillaService.getNewAddress(newNinja)
    .then(rep => {
      getCurrentTab().then(tab => {
        console.log('We got a ninja mail', rep);
        newNinja.email = rep.email_addr;
        newNinja.siteUrl = new URL(tab.url).hostname;
        console.log('Site url is ', newNinja.siteUrl);
        ninjaStorageService.createNinja(newNinja);
        sendNinjaToInjectScript(tab, newNinja);
        addNinjaToOptionList(newNinja);
      })
    });
  });
}

function addNinjaToOptionList(ninja){
  var $ninjaSelect = $("#ninja-display-list");
  var $ninjaOption = $(`<option>${ninja.siteUrl} - ${ninja.email.replace(/@.*/, '')}</option>`);
  $ninjaOption.data('ninja', ninja);
  $ninjaSelect.prepend($ninjaOption);
}

function ninjaLoginAccount(){
  prepareNinjaInjection().then(() =>
    getCurrentTab().then(tab => {
      sendNinjaToInjectScript(tab, currentNinja);
      console.log("Ninja logged");
    })
  );
}

function sendNinjaToInjectScript(tab, ninja){
  chrome.tabs.sendMessage(tab.id, JSON.stringify(ninja), {}, injectCallback)
}

document.addEventListener('DOMContentLoaded', function()
{
  getCurrentDomain().then(domain => initializeView(domain));
});


function stopMailCheck(){
  if( checkMailIntervalId ){
    clearInterval(checkMailIntervalId);
    checkMailIntervalId = null;
  }
}

function registerMailCheckIfNotSepuku( ninja ){
  
  stopMailCheck();
  
  if( ninja.sepukuTime > Date.now() ){
    $('#email-response').html('Ninja found for this site! Your postman is checking for new emails.');
    checkMailIntervalId = setInterval(checkAndDisplayEmail, 5000);
  }else{
    $('#email-response').html('Your ninja postman is dead');
  }

}

function initializeView( siteUrl ){
  currentNinja = ninjaStorageService.getCurrentNinja(siteUrl);
  if(currentNinja){
    console.log('We have a ninja: ', currentNinja);
    activateNinja(currentNinja);
    showNinjaLogin();
  }else{
    console.log('No ninja');
    showNinjaCreate();
  }
  initializeNinjaList();
  $('#ninja-form').show();
}

/**
 * Populate extension form, populate email and launch email routine 
 * @param {*} ninja 
 */
function activateNinja( ninja ){
  clearEmailList();
  populateFormWithNinja(ninja);
  _.forEach( ninja.mailbox, email => {
    populateFormWithEmail(email);
  });
  registerMailCheckIfNotSepuku(ninja);
}

function initializeNinjaList(){
  var $ninjaSelect = $("#ninja-display-list");
  ninjaStorageService.getNinjaList()
  .forEach(addNinjaToOptionList);
  $ninjaSelect.change(function onNinjaChange(e) {
    currentNinja = $ninjaSelect.find('option:selected').data('ninja');
    activateNinja(currentNinja);
  })
}

function showNinjaCreate(){
  $( '#ninja-create-other-account').hide();
  $( '#ninja-login-account').hide();
  $( '#ninja-create-account').show().click(ninjaCreateAccount);
}

function showNinjaLogin(){
  $( '#ninja-create-other-account').show().click(ninjaCreateAccount);
  $( '#ninja-login-account').show().click(ninjaLoginAccount);
  $( '#ninja-create-account').hide();
}

function populateFormWithNinja(ninja){
  _.keys(ninja).forEach( key =>
    {
      var $el = $(`*[name='${key}-input']`)
      if( $el.length == 0 ){
        console.log('No form input found for ninja key', key);
        return;
      }
      $el.val( ninja[key] );
    });

    /*if( ninja.lastEmail ) {
      populateFormWithEmail(ninja.lastEmail.mail_body);
    }*/
  }

  function injectCallback(resultJson)
  {
    console.log('Ninja bananas : ' , resultJson);
    var results = JSON.parse(resultJson);
    results.forEach(function( result )
    {
      var $el = $(`*[name='${result.key}-input']`)
      if( $el.length == 0 ) return;
      $el.val( result.value );
      if( !result.injected ) return;
      $el.css('background-color', '#80FFD9');
      $el.css('color', '#222222');
    });
  }

  function checkAndDisplayEmail(){
    getCurrentDomain()
      .then(url => {
        return ninjaGuerrillaService.getNewEmails(currentNinja);
      })
      .then(emails => {
          _.forEachRight( emails, email => {
            populateFormWithEmail(email);
          });
        })
       .catch(err => console.log(`Error: ${err}`));
    }

    function populateFormWithEmail(email){
      if( email.mail_id == 1 ) return; //skip guerrillamail welcome email
      var $title = $(`<h3 class='accordion_title'>${email.mail_subject}</h3>`);
      var $email = $(`<div>${email.mail_body}</div>`);
      $('#email-list').prepend( $email ).prepend( $title );

      $title.click(function(e){
        $email.toggle();
      });
      replaceLinks($email);
    }

    function clearEmailList(){
      $('#email-list').html('');
    }

    function replaceLinks( $el ){
      $el.find('a').each((i,a) => {
        var $a = $(a);
        $a.click(() => chrome.tabs.update(null, {url : a.href}));
      });
    }
