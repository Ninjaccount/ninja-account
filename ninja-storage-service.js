const STORAGE_CONFIG = {
  ninjaTimeBeforeSepuku: 600000, // time after wich we won't check emails anymore
  storagePrefix: "ninja."
}


/**
ninja = {
  _id : auto generated,
  sepukuTime : date,//time to sepuku
  siteUrl : string,
  name : string,
  email : string,
  password : string,
  sidToken : guerrilla token,
  //lastEmail: last
  mailbox : [email (id, body, etc...)] // most recent mail is first (add with unshift)
}
*/
var ninjaStorageService = (function () {

  function getSiteStorage(siteUrl) {
    var storageString = window.localStorage[STORAGE_CONFIG.storagePrefix + siteUrl];
    if (storageString) {
      return JSON.parse(storageString);
    }
    return { ninjas: {} };
  }

  function saveSiteStorage(siteUrl, storage) {
    var storageString = JSON.stringify(storage);
    window.localStorage["ninja." + siteUrl] = storageString;
  }

  function createNinja(ninja) {
    var storage = getSiteStorage(ninja.siteUrl);
    ninja._id = ninja.siteUrl + "_" + Date.now();
    ninja.sepukuTime = Date.now() + STORAGE_CONFIG.ninjaTimeBeforeSepuku;
    ninja.mailbox = [];
    storage.current = ninja._id;
    storage.ninjas[ninja._id] = ninja;
    console.log('Create ', ninja);
    saveSiteStorage(ninja.siteUrl, storage);
  }

  function updateNinja(ninja) {
    console.log('Update ', ninja);
    var storage = getSiteStorage(ninja.siteUrl);
    storage.ninjas[ninja._id] = ninja;
    saveSiteStorage(ninja.siteUrl, storage);
  }

  function getCurrentNinja(siteUrl) {
    console.log('Get for site', siteUrl);
    var storage = getSiteStorage(siteUrl);
    if (!storage.current) return null;
    var current = storage.ninjas[storage.current]
    console.log('Current ', current);
    return current;
  }

  function getNinjaList() {
    var ninjas =
      _(_.keys(window.localStorage))
        .filter(key => key.startsWith(STORAGE_CONFIG.storagePrefix))
        .map(key => JSON.parse(window.localStorage[key]))
        .flatMap(dbo => _.values(dbo.ninjas))
        .value();

    return ninjas;
  }

  return {
    createNinja,
    updateNinja,
    getCurrentNinja,
    getNinjaList
  };

})();
