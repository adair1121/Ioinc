//========================main====================================
angular.module('market',['ionic','jpw'])
    .run(function($ionicPlatform,JPBase){
        $ionicPlatform.ready(function(){
            var sys = JPBase.sys;
            if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                cordova.plugins.Keyboard.disableScroll(true);
                sys.deviceReady = true;
                JPBase.initialize(window.cordova);
            }
            if (window.StatusBar) {
                // org.apache.cordova.statusbar required
                StatusBar.styleDefault();
            }
        });
    }).config(function($stateProvider, $urlRouterProvider) {
        $stateProvider.state('home', {
            url: '/home',
            controller:'HomeController',
            templateUrl: 'views/home.html'
        }).state('rank',{
            url:'/rank',
            templateUrl:'views/rank.html'
        }).state('product',{
            url:'/product',
            templateUrl:'views/product.html'
        });
        $urlRouterProvider.otherwise('/home');
    });

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

