// or see http://cors.io/
const PROXY_THIS_API = 'http://crossorigin.me';
const GUERRILLA_API = `${PROXY_THIS_API}/http://api.guerrillamail.com/ajax.php`;


var ninjaGuerrillaService = (function(){

  var sidToken;
  var lastEmailId = 0;

  function fetchAction(a){
    return fetch(`${GUERRILLA_API}?f=${a}`, {mode: 'cors'})
    .then(rep => {
      return rep.json();
    })
    .then(json => {
      sidToken = json.sid_token;
      return json;
    })
    .catch(err => console.log('Error getting email adress ', err));
  }

  function getNewAddress(){
    return fetchAction("get_email_address");
  }

  function getNewEmail(){
    return fetchAction(`check_email&seq=0&sid_token=${sidToken}`)
    .then(json => {
      if( json.count == 0 || json.list[0].mail_id == lastEmailId )  {
        return Promise.reject("No new email");
      }
      lastEmailId = json.list[0].mail_id;
      return fetchAction(`fetch_email&sid_token=${sidToken}&email_id=${lastEmailId}`)
        .then( result => result.mail_body);
    });
  }

  return {
    getNewAddress: getNewAddress,
    getNewEmail : getNewEmail
  };

})();
