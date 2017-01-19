//=================JPStore===================================
angular.module('jpw').factory('JPStore',['JPX',function(jpx){
    var state = jpx.store({
        state:{

        },
        mutations:{

        }
    });
    return state;
}]);
