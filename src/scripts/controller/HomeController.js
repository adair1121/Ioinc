//=========================HomeController===============================
angular.module('market').controller('HomeController',function($scope,JPX,JPAction){
    console.log("=============>home");
    $scope.backData = JPX.getter.backMsg;
    $scope.sendData = JPX.getter.sendData;
    JPAction.doHttp("http://www.jiaoping.com",{message:"send a message from win load."});

    JPX.register('doHttp',function(state){
        $scope.$apply(function(){
            $scope.backData = state.backMsg;
            $scope.sendData = state.sendData;
        });
    });
});

