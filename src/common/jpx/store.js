//=================JPStore===================================
angular.module('jpw').factory('JPStore',['JPX',function(jpx){
    console.log("11111111111111");
    var state = jpx.store({
        state:{
            backMsg:"123",
            sendData:""
        },
        mutations:{
            doHttp:function(state,refresh,data){
                console.log("In doHttpHandler(),get back data===>",data);
                state.backMsg = data.res;
                state.sendData = data.message;
                refresh('doHttp');
            }
        }
    });
    return state;
}]);
