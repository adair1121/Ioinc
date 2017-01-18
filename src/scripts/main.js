//========================main====================================
angular.module('market',['ionic'/*,'jpw'*/])
    .run(function($ionicPlatform/*,jpwBase*/){
        $ionicPlatform.ready(function(){
            //var sys = jpwBase.sys;
            if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                cordova.plugins.Keyboard.disableScroll(true);
                //  sys.deviceReady = true;
                //jpwBase.initialize(window.cordova);
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
