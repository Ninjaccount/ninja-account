const STORAGE_CONFIG = {

}


/**
ninja = {
  _id : auto generated,
  siteUrl : string,
  name : string,
  email : string,
  password : string,
  sid_token : guerrilla token
}
*/
var ninjaStorageService = (function(){

   function getSiteStorage( siteUrl ){
     var storageString = window.localStorage["ninja."+siteUrl];
     if( storageString ){
       return JSON.parse(storageString);
     }
     return { ninjas : { } };
   }

   function saveSiteStorage( siteUrl, storage ){
    var storageString = JSON.stringify(storage);
    window.localStorage["ninja."+siteUrl] = storageString;
   }

   function createNinja( ninja ){
    var storage = getSiteStorage(ninja.siteUrl);
    ninja._id = ninja.siteUrl + "_" + Date.now();
    storage.current = ninja._id;
    storage.ninjas[ ninja._id ] = ninja;
    saveSiteStorage(ninja.siteUrl, storage);
   }

   function updateNinja( ninja ) {
     var storage = getSiteStorage(ninja.siteUrl);
     storage.ninjas[ ninja._id ] = ninja;
     saveSiteStorage(ninja.siteUrl, storage);
   }

   function getCurrentNinja( siteUrl ){
    var storage = getSiteStorage(siteUrl);
    if( !storage.current ) return null;
    return storage.ninjas[storage.current];
   }

   return {
     createNinja: createNinja,
     updateNinja: updateNinja,
     getCurrentNinja: getCurrentNinja
   };

});
