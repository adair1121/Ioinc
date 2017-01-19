//===========================JPX===============================
angular.module('jpw').factory('JPX',[function(){

    var actionPrototype,
        actionObj,
        slice = Array.prototype.slice,
        dispatchers = {},
        oStateObj,
        tState = {},
        getDispatcher = {},
        JPX = {
            /**
             * 创建一个action对象
             * @param ap {Object} [necessary] 所有action操作的方法
             * @return {Object} action对象，可用来发起操作
             */
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
                                setTimeout(function(){
                                    actionPrototype[key].apply(JPX,args);
                                },0);
                            };
                        })(key);
                    }
                }
                return actionObj;
            },
            /**
             * 派发一个动作类型
             * @param type {String} [necessary] 动作类型
             */
            dispatch:function(type){
                if(!type){
                    return;
                }
                var args = slice.call(arguments,1),
                    fn = dispatchers[type];
                if(!fn || typeof fn !== 'function'){
                    return;
                }
                fn.apply(JPX,[oStateObj,JPX.refresh].concat(args));
            },
            /**
             * 刷新生效
             */
            refresh:function(type){
                var list;
                if(type && (list=getDispatcher[type])!=null){
                    for(var i=0,item;(item=list[i])!=null;i++){
                        item.call(JPX,tState);
                    }
                }
            },
            /**
             * 创建数据模型
             * @param obj {Object} [necessary] 模型对象，分为2个部分
             * obj.state是存储数据的模型
             * obj.mutations是处理action操作返回的数据的方法，可以在此把加工过的数据存入state
             */
            store:function(obj){
                if(!obj || !obj.state || !obj.mutations){
                    return;
                }
                var mutations = obj.mutations,
                    state = obj.state;
                oStateObj = state;
                for(var attr in state){
                    (function(key){
                        Object.defineProperty(tState,key,{
                            get:function(){
                                return oStateObj[key];
                            }
                        });
                    })(attr);
                }
                for(var key in mutations){
                    if(mutations.hasOwnProperty(key)){
                        dispatchers[key] = mutations[key];
                    }
                }
                return tState;
            },
            getter:tState,
            register:function(type,handler){
                if(!type || typeof handler !== 'function'){
                    return;
                }
                getDispatcher[type] = getDispatcher[type] || [];
                var list = getDispatcher[type];
                list[list.length] = handler;
            }
        };
    return JPX
}]);
