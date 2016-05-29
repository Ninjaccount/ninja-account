const STORAGE_CONFIG = {

}


/**
ninja = {
  _id : auto generated,
  siteUrl : string,
  name : string,
  email : string,
  password : string,
  sidToken : guerrilla token
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
    console.log('Create ', ninja);
    saveSiteStorage(ninja.siteUrl, storage);
   }

   function updateNinja( ninja ) {
     console.log('Update ', ninja);
     var storage = getSiteStorage(ninja.siteUrl);
     storage.ninjas[ ninja._id ] = ninja;
     saveSiteStorage(ninja.siteUrl, storage);
   }

   function getCurrentNinja( siteUrl ){
     console.log('Get for site', siteUrl);
    var storage = getSiteStorage(siteUrl);
    if( !storage.current ) return null;
    var current = storage.ninjas[storage.current]
    console.log('Current ', current);
    return current;
   }

   return {
     createNinja: createNinja,
     updateNinja: updateNinja,
     getCurrentNinja: getCurrentNinja
   };

})();
