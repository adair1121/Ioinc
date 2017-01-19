//===============JPAction========================================
angular.module('jpw').factory('JPAction',['JPX','JPStore',function(jpx){
    var action = jpx.action({
        doHttp:function(dispatch,url,data){
            console.log("In action,the doHttp() called.",url,data);
            var time = setTimeout(function(){
                clearTimeout(time);
                data['res'] = "ajax done.";
                dispatch('doHttp',data);
            },3000);
        }
    });
    return action;
}]);
