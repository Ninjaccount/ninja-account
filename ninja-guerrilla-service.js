// or see http://cors.io/
const PROXY_CROSS_ORIGIN_ME = 'http://crossorigin.me/';
const PROXY_CORS_IO = 'http://cors.io/?u=';
const GUERRILLA_API = 'http://api.guerrillamail.com/ajax.php';

var ninjaGuerrillaService = (function(){

  function fetchAction(a, ninja, retrying){
    var endpoint;
    if(!retrying){
      endpoint = `${PROXY_CORS_IO}` + encodeURIComponent(`${GUERRILLA_API}?f=${a}`);
    }else{
      endpoint = `${PROXY_CROSS_ORIGIN_ME}${GUERRILLA_API}?f=${a}`
    }
    console.log(`Requesting: ${endpoint}`);
    return fetch(`${endpoint}`, {mode: 'cors'})
    .then(rep => {
      return rep.json();
    })
    .then(json => {
      ninja.sidToken = json.sid_token;
      ninjaStorageService.updateNinja(ninja);
      return json;
    })
    .catch(err => {
      if(retrying){
        console.log('Error requesting guerrilla api ', err);
      }else{
        console.log('Error requesting guerrilla api, let\'s retry! ', err);
        return fetchAction(a, ninja, true);
      }
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
