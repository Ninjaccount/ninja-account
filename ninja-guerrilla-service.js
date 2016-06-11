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

function getNewEmail( ninja ){
  return fetchAction(`get_email_list&seq=0&offset=0&sid_token=${ninja.sidToken}`, ninja)
  .then(json => {
    if( ninja.lastEmail && json.list[0].mail_id == ninja.lastEmail.mail_id )  {
      return Promise.reject("No new email");
    }
    var lastEmailId = json.list[0].mail_id;
    return fetchAction(`fetch_email&sid_token=${ninja.sidToken}&email_id=${lastEmailId}`, ninja)
    .then( result => {
      ninja.lastEmail = result;
      ninjaStorageService.updateNinja(ninja);
      return result.mail_body;
    });
  });
}

return {
  getNewAddress: getNewAddress,
  getNewEmail : getNewEmail
};

})();
