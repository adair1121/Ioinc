//======================JPImageManager============================
angular.module('jpw').factory('JPImageManager',['$window','JPFrameManager',function($w,fm){
        "use strict";
        var imgList,            //图片数据集合
            keyList,            //地址和元素映射表
            loadingList,        //执行某次加载队列
            _loading = false,    //是否正在执行加载标识
            _perNum = 5,        //单次加载图片的数量，默认为5
            noop = function(){},
            frameId;
        /**
         * @public
         * 添加图片进入加载队列
         * @param url 图片加载地址
         * @param img 图片元素
         * @param onload 成功加载时回调
         * @param onerror 加载失败时回调
         */
        function add(url,img,onload,onerror){
            var keyList = keyList || {},imgOpt;
            if(!url || !img || img.nodeName !== 'IMG' || keyList[url] && keyList[url].img === img){
                return;
            }
            imgOpt = {
                url:url,
                img:img,
                onload:typeof onload === 'function'?onload:noop,
                onerror:typeof onerror === "function"?onerror:noop,
            };
            push(imgOpt);
        }
        //==================================================
        /**
         * @private
         * 推入队列中
         * @param imgOpt {Object} [necessary] 图片数据对象
         */
        function push(imgOpt){
            var url = imgOpt.url,
                img = imgOpt.img;
            imgList = imgList || [];
            imgList[imgList.length] = imgOpt;
            keyList[url] = img;
            if(!frameId){
                frameId = fm.addFrameListener(frameHandler);
            }
        }
        /**
         * @private
         * 从队列中取出若干个对象
         * @param num {Number} [necessary] 取出的数量
         * @return {Array} 由取出的元素组成的数组
         */
        function shift(num){
            if(_loading){
                return;
            }
            var len = num>=imgList.length?imgList.length:num,
                list = imgList.splice(0,len);
            return list;
        }
        /**
         * @private
         * 帧处理器
         */
        function frameHandler(e){
            if(imgList.length<=0){
                removeFrame();
                return;
            }
            var list = shift(_perNum);
            doLoad(list);
        }
        /**
         * @private
         * 移除帧监听
         */
        function removeFrame(){
            fm.removeFrameListener(frameHandler);
            frameId = null;
        }

        /**
         * @private
         * 执行加载
         * @param list {Array} [necessary] 执行加载的队列
         */
        function doLoad(list){
            if(_loading || !list){
                return;
            }
            _loading = true;
            var img,url;
            loadingList = {length:0};
            for(var i=0,item;(item=list[i])!=null;i++){
                img = item.img;
                url = item.url;
                loadingList[i] = item;
                loadingList.length++;
                img.setAttribute('data-imindex',i);
                img.addEventListener('load',onPicLoad);
                img.addEventListener('error',onPicError);
                img.src = url;
            }
        }
        /**
         * 图片加载完毕
         */
        function onPicLoad(e){
            tidyImg(this,true).call(img,e);
        }
        /**
         * 图片加载失败
         */
        function onPicError(e){
            tidyImg(this,false).call(img,e);
        }

        function tidyImg(img,isCompleted){
            var index = img.getAttribute('data-imindex'),
                opt = loadingList[index],
                fn = isCompleted?opt.onload:opt.onerror;
            img.removeEventListener('load',onPicLoad);
            img.removeEventListener('error',onPicError);
            img.removeAttribute('data-imindex');
            loadingList[index] = null;
            loadingList.length--;
            if(keyList[opt.url]){
                delete keyList[opt.url];
            }
            if(loadingList.length<=0){
                _loading = false;
            }
            return fn;
        }

        //===============================

        var ImageManager = {
            add:add
        };

        Object.defineProperties(ImageManager,{
            loading:{
                get:function(){
                    return _loading;
                }
            },
            perNum:{
                set:function(value){
                    if(_perNum === value || typeof value !== 'number' || value <= 0){
                        return;
                    }
                    _perNum = value;
                },
                get:function(){
                    return _perNum;
                }
            }
        });

        return ImageManager;
}]);
