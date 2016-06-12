// or see http://cors.io/
//const PROXY_CROSS_ORIGIN_ME = 'http://crossorigin.me/';
//const PROXY_CORS_IO = 'http://cors.io/?u=';
const GUERRILLA_API = 'https://api.guerrillamail.com/ajax.php';

var ninjaGuerrillaService = (function(){

  function fetchAction(a, ninja){
    var endpoint = `${GUERRILLA_API}?f=${a}`;

    console.log(`Requesting: ${endpoint}`);
    return fetch(endpoint, {mode: 'cors'})
    .then(rep => {
      return rep.json();
    })
    .then(json => {
      ninja.sidToken = json.sid_token;
      ninjaStorageService.updateNinja(ninja);
      return json;
    })
    .catch(err => {
      console.log('Error requesting guerrilla api ', err);
    }
  );
}

function getNewAddress(ninja){
  return fetchAction("get_email_address", ninja);
}

function getNewEmails( ninja ){
  var seq = 0;
  var lastEmail = ninja.mailbox[0];
  if( lastEmail ){
    seq = lastEmail.mail_id
  }
  return fetchAction(`check_email&seq=${seq}&sid_token=${ninja.sidToken}`, ninja)
  .then(json => {
    if( json.count == 0 )  {
      return Promise.reject("No new email");
    }

    var promises = _.map(json.list, mailExcerpt => fetchAndSaveFullEmail(mailExcerpt, ninja));
    return Promise.all(promises)
    .then(fullEmails => {
      ninjaStorageService.updateNinja(ninja);
      return fullEmails
    });
  });
}

function fetchAndSaveFullEmail(mailExcerpt, ninja){
  return fetchAction(`fetch_email&email_id=${mailExcerpt.mail_id}&sid_token=${ninja.sidToken}`, ninja)
  .then(email => {
    ninja.mailbox.unshift(email);
    return email;
  });
}

return {
  getNewAddress: getNewAddress,
  getNewEmails : getNewEmails
};

})();
