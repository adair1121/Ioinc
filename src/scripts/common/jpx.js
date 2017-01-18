//===========================JPX===============================
angular.module('jpw').factory('JPX',[function(){
    var actionPrototype,
        actionObj,
        slice = Array.prototype.slice,
        dispatchers,
        stateObj,
        JPX = {
            action:function(ap){
                if(!ap){
                    return;
                }
                actionPrototype = ap || {};
                actionObj = {};

                for(var key in ap){
                    if(ap.hasOwnProperty(key)){
                        actionObj[key] = (function(key){
                            return function(){
                                var args = slice.call(arguments,0);
                                args.unshift(JPX.dispatch);
                                return actionPrototype[key].apply(JPX,args);
                            };
                        })(key);
                    }
                }
                return actionObj;
            },
            dispatch:function(type){
                if(!type){
                    return;
                }
                var args = slice.call(arguments,1),
                    fn = dispatchers[type];
                if(!fn || typeof fn !== 'function'){
                    return;
                }
                fn.apply(JPX,[stateObj].concat(args));
            },
            store:function(obj){
                if(!obj || !obj.state || !obj.mutations){
                    return;
                }
                var mutations = obj.mutations,
                    state = obj.state;
                stateObj = state;
                dispatchers = dispatchers || {};
                for(var key in mutations){
                    if(mutations.hasOwnProperty(key)){
                        dispatchers[key] = mutations[key];
                    }
                }
            },
            getter:function(fnList){
                if(!fnList){
                    return;
                }
                var fn,obj = {};
                for(var key in fnList){
                    if(fnList.hasOwnProperty(key)){
                        fn = (function(key){
                            return function(){
                                return fnList[key].call(JPX,stateObj);
                            };
                        })(key);
                        Object.defineProperty(obj,key,{
                            get:fn
                        });
                    }
                }
                return obj;
            }
        };
    return JPX
}]);
