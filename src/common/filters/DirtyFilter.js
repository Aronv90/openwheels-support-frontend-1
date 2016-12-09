'use strict';

angular.module('filters.dirty', [])

.filter('returnDirtyItems', function () {
  return function (modelToFilter, form, treatAsDirty, removeTheseCharacters) {
    //removes pristine items
    //note: treatAsDirty must be an array containing the names of items that should not be removed
    for (var key in modelToFilter) {
      //delete the item if:
      //    * it exists on the form and is pristine, or...
      //    * does not exist on the form
      try{
      }
      catch(err){
      }
      if (removeTheseCharacters !== undefined && removeTheseCharacters.length > 0) {
        for (var CA = 0, len = removeTheseCharacters.length; CA < len; CA++ ) {
          try{
            if (modelToFilter[key].indexOf(removeTheseCharacters[CA]) >= 0) {
              modelToFilter[key] = modelToFilter[key].replace(removeTheseCharacters[CA], '', 'g');
            }
          }
          catch(err){
          }
        }
      }
      if ((form[key] && form[key].$pristine) || !form[key]) {
        //delete the item if the treatAsDirty argument is not present
        if(treatAsDirty){
          //delete the item if it is not in the treatAsDirty array
          if(treatAsDirty.indexOf(key) === -1){
            //remove the pristine item from the parent object
            delete modelToFilter[key];
          } else {
          }
        } else {
          //remove the pristine item from the parent object
          delete modelToFilter[key];
        }
      }
    }
    return modelToFilter;
  };
})
;
