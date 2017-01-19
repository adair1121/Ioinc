angular.module('jpw').factory('JPNativeImageService',
    [
        'jpwBase',
        'JPFileService',
        'JPFrameManager',
        function(base,FileService,fm){

            var sys = base.sys,
                dir = base.dir,
                downloadList,
                frameId,
                working = false,
                RIGHT_PROTOCAL = /^http|https/;
            /**
             * @public
             * 检查该地址的图片是否留有缓存，有则返回本地地址，没有则原样返回,并记录下来等待后台下载。
             * @param path {String} [necessary] 图片文件的地址
             * @return {String}
             */
            function checkPath(path){
                var imgPath;
                if(!path || !RIGHT_PROTOCAL.test(path)){
                    return path;
                }
                if(sys.imgBase){
                    imgPath = sys.imgBase[path];
                    if(!imgPath){
                        imgPath = path;
                        downloadList = downloadList || [];
                        downloadList[downloadList.length] = path;
                        if(!frameId && !working){
                            frameId = fm.addFrameListener(onFrameHanlder);
                        }
                    }
                }
                return imgPath;
            }
            /**
             * @public
             * 清空全部图片
             *
             */
            function clearAssets(){

            }

            //==================private=============================
            function onFrameHanlder(e){
                if(downloadList.length>0 && !working){
                    working = true;
                    fm.removeFrameListener(onFrameHanlder);
                    loadImgs(downloadList);
                }
            }

            function loadImgs(){

            }

            function writeToConfig(){

            }

            function saveConfig(){

            }

            return {
                getCDVPath:getCDVPath
            };
        }
    ]
);
