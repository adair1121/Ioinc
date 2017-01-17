angular.module('jpw').factory('JPDownloadService',['$window','JPFileService','$cordovaFileTransfer',function($w,FileService,FileTransfer){
    "use strict";
    var RESOLVE_PATH = /[a-zA-Z]+[\.a-z]+/g,    //解析路径正则
        CHECK_EX = /\.[a-z]+$/g,                //解析扩展名正则
        GET_FILE = /[\w]+\.[a-z]+$/g,           //获取文件名，包含扩展名
        DEFAULT_MIME = "text/plain",
        noop = function(){};

    function DownloadService(){
        this.useSysProgress = false;
        this.progressFn = null;
        this._fileService = null;
        this.openFileAuto = false;
        this.working = false;
        this.referer = null;
    }

    DownloadService.DOWNLOAD_SUCCESS = "downloadSuccess";
    DownloadService.DOWNLOAD_FAILED = "downloadFailed";

    var dp = DownloadService.prototype;
    /**
     * 初始化
     * @param option {Object}
     */
    dp.initialize = function(option){
        this.useSysProgress = !!option.useSysProgress;
        this.sysProgressTitle = option.sysProgressTitle || "当前下载进度:";
        this.openFileAuto = !!option.openFileAuto;
        this.progressFn = option.progressFn && typeof option.progressFn === 'function'?option.progressFn:noop;
        this.referer = option.referer;
        //init fileService
        this._fileService = new FileService()

        if(!dp.download || typeof dp.download === 'function'){
            dp.download = download;
        }
    };
    /**
     * 下载文件
     * @param uri {String} 文件地址 [necessary]
     * @param targetPath {String} 保存地址 [necessary]
     * @param mime {String} 文件的MIME类型 [optional] 默认apk
     * @param fileName {String} 保存的文件名 [optional]
     * @param referer {String} referer的设置
     * @return {Promise}
     */
    function download(option,uri,targetPath,mime,fileName,referer){
        if(this.working){
            return;
        }
        this.working = true;
        var fs = this._fileService,
            that = this,
            fileName,
            list,
            openFileAuto = this.openFileAuto,
            uriGroup,
            byMIME = jpw.extendsByMIME;
        uri = option.url || "";
        targetPath = option.dir || "";
        mime = option.mime || DEFAULT_MIME;
        fileName = option.fileName || CHECK_EX.test(uri) && uri.match(GET_FILE)[0] || (new Date().getTime())+byMIME(mime);
        referer = option.referer === this.referer?this.referer:!!option.referer?option.referer:this.referer;
        if(!targetPath || !uri){
            return Q.promise(function(resolve,reject){
                reject({
                    type:DownloadService.DOWNLOAD_FAILED,
                    message:"In download methods,some param is error====>uri:"+uri+"<===>targetPath:"+targetPath+"<===>mime:"+mime+"<==="
                });
                that.working = false;
            });
        }
        return Q.promise(function(resolve,reject){
            //先验证路径
            fs.isExsited(targetPath).then(function(dirEntry){
                return dirEntry;
            },function(error){
                //路径不存在，分解之后进行创建文件夹
                if(error === 1 || error.code === 1){
                    var pathList = targetPath.match(RESOLVE_PATH),
                        tDir = pathList[pathList.length-1],
                        tPath = targetPath.slice(0,targetPath.indexOf(tDir));
                    return fs.createDir(tPath,tDir);
                }
                that.working = false;
                reject({
                    message:"In download(),the param of targetPath is error.",
                    srcError:error
                });
            }).then(function(dirEntry){
                //开始下载
                if(dirEntry && dirEntry.nativeURL){
                    console.log("will call perpare--->",uri,dirEntry,fileName,referer);
                    var list = preparedDowload.bind(that)(uri,dirEntry,fileName,referer);
                    return doDownload.apply(null,list);
                }
            }).then(function(data){
                //下载结束，是否要打开文件
                if(openFileAuto && data.fileEntry){
                    return fs.startupFile(data.fileEntry,mime);
                }
                var url = data.fileEntry?data.fileEntry.toURL():data;
                that.working = false;
                resolve(url);
            }).then(function(data){
                //打开文件成功
                if(openFileAuto){
                    that.working = false;
                    resolve(data);
                }
            }).catch(function(error){
                //console.log(DownloadService.DOWNLOAD_FAILED,"In download,has an error happen.====>",error);
                console.error(error);
                that.working = false;
                reject({
                    type:DownloadService.DOWNLOAD_FAILED,
                    message:error.message || error.exception,
                    srcError:error
                });
            });
        });
    }
//=========================================
    /**
     * 下载前准备
     * @param uri {String} [necessary] 文件网络地址
     * @param dirEntry {String} [necessary] 目标文件夹的DirectoryEntry
     * @param fileName {String} [necessary] 保存的文件名
     * @param referer {String} referer的设置
     * @return {Array} 所用的参数集合[FileTransfer对象,文件转义后的URI,文件地址,是否使用系统进度,系统进度的标题]
     */
    function preparedDowload(uri,dirEntry,fileName,referer){
        var fileTransfer = new global.FileTransfer(),
            fileURL = dirEntry.toURL()+fileName,
            URI = encodeURI(uri),
            useSysProgress = this.useSysProgress,
            sysProgressTitle = this.sysProgressTitle;
        //progress
        fileTransfer.onprogress = showUploadingProgress.bind(this);
        return [fileTransfer,URI,fileURL,useSysProgress,sysProgressTitle,referer];
    }
    /**
     *
     * @param fst {FileTransfer} [necessary]
     * @param uri {String} 文件地址 [necessary]
     * @param targetPath {String} 保存地址 [necessary]
     * @param useSysProgress {Boolean} 是否使用系统进度提示，如果为true，则会使用进度回调
     * @param title {String} 系统进度的标题
     * @param referer {String} referer的设置
     */
    function doDownload(fst,uri,fileURL,useSysProgress,title,referer){
        if(useSysProgress){
            navigator.notification.progressStart("", title);
        }
        var option = referer?{headers:{"Referer":referer}}:{};
        return Q.promise(function(resolve,reject){
            fst.download(uri,fileURL,function(entry){
                if(useSysProgress){
                    navigator.notification.progressStop();
                }
                var url = entry.toURL();
                resolve({
                    fileURL:url,
                    fileEntry:entry
                });
            },function(error){
                if(useSysProgress){
                    navigator.notification.progressStop();
                }
                reject({
                    message:"In doDownload(),download failed.",
                    srcError:error
                });
            },false,option);
        });
    }
    /**
     * 进度事件回调
     * @param progressEvt 进度事件
     */
    function showUploadingProgress(progressEvt) {
        var pNum;
        if (progressEvt.lengthComputable) {
            pNum = Math.round((progressEvt.loaded / progressEvt.total) * 100);
            navigator.notification.progressValue(pNum);
            if(typeof this.progressFn === 'function'){
                this.progressFn(pNum);
            }
        }
    }
//=========================================
    /**
     * option {
     *  useSysProgress:false [optional],    //是否使用系统进度提示，如果为true，则会使用进度回调(progressFn)，否则，不会提示。默认为false
     *  sysProgressTitle:"当前下载进度:",    //系统进度面板标题
     *  progressFn:Function [optional],     //下载进度回调
     *  openFileAuto:false,                 //下载完成后，是否自动打开文件
     *  referer:String                      //headers中Referer
     * }
     */
    return {
        factory:function(option){
            var instance = new DownloadService();
            instance.initialize(option);
            return instance;
        },
    };
}]);


