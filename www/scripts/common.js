//==================================base.js jpw base=================================================
(function(){
    "use strict";
    var JPW = angular.module('jpw',['ngCordova']);
//==============================================================================
    JPW.provider('JPBase',function(){
        return {
            $get:['JPFileService',function(FileService){
                "use strict";
                //=================目录=========================================
                var dir = {
                        PERSISTENT_PATH:null,       //需要存储持久化的文件目录,例如界面，功能等
                        ACTIVE_PATH:null,           //用完可被删除的文件目录，例如活动落地页等。
                        CACHE_PATH:null,            //缓存目录
                        DOWNLOAD_ROOT_PATH:null,    //文件下载根目录
                        DOWNLOAD_APK_PATH:null,     //apk下载目录
                        OTHER_ASSETS_PATH:null,     //
                        ASSETS_PATH:null,           //资源文件存储根目录
                        VIEWS_PATH:null,            //模板文件存储目录
                        SCRIPTS_PATH:null,          //脚本文件存储目录
                        STYLES_PATH:null,           //样式文件存储目录
                        CONFIG_PATH:null,
                        //以下是dirEntry
                        persistentDE:null,
                        cacheDE:null,
                        downloadRootDE:null,
                        downloadDE:null,
                        otherAssetsDE:null,
                        assetsDE:null,
                        viewsDE:null,
                        scriptsDE:null,
                        stylesDE:null,
                        configDE:null,
                        imgConfigFE:null
                },
                //==================mime类型==================================
                mime = {
                    //apk
                    APK_MIME:'application/vnd.android.package-archive',
                    TEXT_PLAIN:"text/plain",
                    JS_MIME:"text/javascript",
                    CSS_MIME:"text/css",
                    HTML_MIME:"text/html",
                    XML_MIME:"text/xml",
                    //图形通用
                    IMG_MIME:'image/*',
                    //GIF图形
                    IMG_GIF_MIME: "image/gif",
                    //jpeg图形
                    IMG_JPEG_MIME: "image/jpeg",
                    //jpg图形
                    IMG_JPG_MIME: "image/jpg",
                    //png图形
                    IMG_PNG_MIME: "image/png",
                    //SVG
                    SVG_MIME:"image/svg+xml",
                    //JSON
                    JSON_MIME:"application/json",
                    'application/vnd.android.package-archive':'.apk',
                    "text/plain":'.txt',
                    "text/javascript":'.js',
                    "text/css":'.css',
                    "text/html":'.html',
                    "text/xml":'.xml',
                    'image/*':'.png',
                    "image/gif":'.gif',
                    "image/jpeg":'.jpeg',
                    "image/jpg":'.jpg',
                    "image/png":'.png',
                    "image/svg+xml":'.svg',
                    "application/json":'.json'
                },
                //=============文件相关===============================================
                file = {
                    DOWNLOAD_DIR_NAME:"JPWDownload",    //apk下载目录和文件资源下载目录
                    ASSETS_DIR_NAME:"assets",           //资源目录
                    OTHER_ASSETS_DIR_NAME:"jpwOther",   //可删除资源目录
                    ACTIVITY_DIR_NAME:"activity",       //活动文件目录
                    VIEWS_DIR_NAME:"views",             //动态模板文件目录
                    SCRIPTS_DIR_NAME:"scripts",         //动态脚本目录
                    STYLES_DIR_NAME:"styles",           //动态样式目录
                    CONFIG_DIR_NAME:"jpConfig",
                    IMG_CONFIG:"imgConfig.json"
                },
                //=============系统信息==============================================
                sys = {
                    deviceReady:false,
                    dirReady:false,
                    imgBase:null
                },
                //===================================================================
                checkList,fs;
                //=============method public==============================
                function initialize(cordova, handler){
                    if(!cordova || !cordova.file){
                        console.warn("cordova:",cordova,"file:",cordova.file);
                        return;
                    }
                    sys.deviceReady = true;
                    var files = cordova.file;
                    dir.PERSISTENT_PATH = files.dataDirectory;
                    dir.DOWNLOAD_ROOT_PATH = files.externalRootDirectory;
                    dir.CACHE_PATH = files.cacheDirectory;

                    dir.DOWNLOAD_APK_PATH = dir.DOWNLOAD_ROOT_PATH + file.DOWNLOAD_DIR_NAME;
                    dir.ASSETS_PATH = dir.PERSISTENT_PATH + file.ASSETS_DIR_NAME;
                    dir.VIEWS_PATH = dir.PERSISTENT_PATH + file.VIEWS_DIR_NAME;
                    dir.SCRIPTS_PATH = dir.PERSISTENT_PATH + file.SCRIPTS_DIR_NAME;
                    dir.STYLES_PATH = dir.PERSISTENT_PATH + file.STYLES_DIR_NAME;
                    dir.OTHER_ASSETS_PATH = dir.DOWNLOAD_ROOT_PATH + file.OTHER_ASSETS_DIR_NAME;
                    console.log("dir=====>",dir);
                    fs = new FileService();
                    prepareFile();
                };
                //=============method private=============================
                /**
                 *
                 */
                function prepareFile(){
                    fs.isExsited(dir.PERSISTENT_PATH).then(function(dirEntry){
                        dir.persistentDE = dirEntry;
                        return fs.isExsited(dir.DOWNLOAD_ROOT_PATH);
                    }).then(function(dirEntry){
                        dir.downloadRootDE = dirEntry;
                        return fs.isExsited(dir.CACHE_PATH);
                    }).then(function(dirEntry){
                        dir.cacheDE = dirEntry;
                        return fs.createDir(dir.persistentDE,file.ASSETS_DIR_NAME);
                    }).then(function(dirEntry){
                        dir.assetsDE = dirEntry;
                        return fs.createDir(dir.persistentDE,file.VIEWS_DIR_NAME);
                    }).then(function(dirEntry){
                        dir.viewsDE = dirEntry;
                        return fs.createDir(dir.persistentDE,file.SCRIPTS_DIR_NAME);
                    }).then(function(dirEntry){
                        dir.scriptsDE = dirEntry;
                        return fs.createDir(dir.persistentDE,file.STYLES_DIR_NAME);
                    }).then(function(dirEntry){
                        dir.stylesDE = dirEntry;
                        return fs.createDir(dir.downloadRootDE,file.DOWNLOAD_DIR_NAME);
                    }).then(function(dirEntry){
                        dir.downloadDE = dirEntry;
                        return fs.createDir(dir.persistentDE,file.OTHER_ASSETS_DIR_NAME);
                    }).then(function(dirEntry){
                        dir.otherAssetsDE = dirEntry;
                        return fs.createDir(dir.persistentDE,file.CONFIG_DIR_NAME);
                    }).then(function(dirEntry){
                        dir.configDE = dirEntry;
                        return fs.createFile(dirEntry,file.IMG_CONFIG);
                    }).then(function(fileEntry){
                        dir.imgConfigFE = fileEntry;
                        sys.dirReady = true;    //文件夹准备完毕
                        readImgConfig(fileEntry);
                    }).catch(function(error){
                        console.warn("In prepareFile(),prepare dir error.",error);
                    });
                }
                /**
                 *
                 */
                function readImgConfig(fileEntry){
                    fs.readFile(fileEntry,FileService.TXT).then(function(data){
                        console.log("read imgConfig====>",data);
                        if(data){
                            if(data.size == 0){
                                sys.imgBase = {};
                                return fs.writeFile(fileEntry,sys.imgBase);
                            }else{
                                sys.imgBase = JSON.parse(data.result);
                                console.log("data.result===>",data.result);
                                console.log("pase data====>",sys.imgBase);
                            }
                        }
                    }).then(function(data){
                        if(data){
                            console.log("write img config success===>",data);
                        }
                    }).catch(function(error){
                        console.warn("In readImgConfig(),read img config error.",error);
                    });
                }
                //=============jpw.base===================================
                return {
                    sys:sys,
                    file:file,
                    mime:mime,
                    dir:dir,
                    deviceReady:false,   //设备准备完毕标识
                    initialize:initialize,
                    extendsByMIME:function(mimeStr){
                        return mime[mimeStr];
                    }
                }
            }]
        }
    });
//==============================================================================
})();

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

//======================JPDownloadService============================
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



//=============================JPFileService==========================
angular.module('jpw').factory('JPFileService',['$window','$cordovaFileOpener2',function($w,$cordovaFileOpener2){
    "use strict";
    var RESOLVE_PATH = /[a-zA-Z0-9]+[\.a-z]+/g,     //解析路径正则
        CHECK_EX = /\.[a-z]+$/g,                    //解析扩展名正则
        FILE_PTL = /^file:\/\/\//,
        CDV_PTL = /^cdvfile:\/\//,
        DEFAULT_MIME = "text/plain",                //默认文件MIME类型
        Q = $w.Q;
        function FileService(){
        }
//===========================================================
    FileService.OPEN_DIR_SUCCESS = "openDirSuccess";
    FileService.OPEN_DIR_FAILED = "openDirFailed";

    FileService.CREATE_DIR_SUCCESS = "createDirSuccess";
    FileService.CREATE_DIR_FAILED = "createDirFailed";

    FileService.OPEN_FILE_SUCCESS = "openFileSuccess";
    FileService.OPEN_FILE_FAILED = "openFileFailed";

    FileService.BUFFER = "buffer";
    FileService.BASE64 = "base64";
    FileService.TXT = "txt";
//========================================================
    var fp = FileService.prototype;
    //========common=======================================
    /**
     * 目录或文件是否存在，检测过程是异步的
     * @param path {String} [necessary] 需要被验证的目录
     *
     * @return {Promise}
     */
    fp.isExsited = function(path){
        if(path && typeof path === "object" && path.filesystem){
            return Q.promise(function(resolve,reject){
                resolve(path);
            });
        }
        return Q.promise(function(resolve,reject){
            window.resolveLocalFileSystemURL(path,function(dirEntry){
                resolve(dirEntry);
            },function(error){
                reject(error);
            });
        });
    }

    //========about dir====================================
    /**
     * 打开指定目录
     *
     * @param path {String} [necessary] 目录路径
     * @return {Promise}
     */
    fp.openDir = function(path){
        var that = this;
        return Q.promise(function(resolve,reject){
            that.isExsited(path).then(function(dirEntry){
                if(!dirEntry.isDirectory){
                    reject({
                        message:"The path is not direct at a directory,but a file or error."
                    });
                }else{
                    // console.log(FileService.OPEN_DIR_SUCCESS,"In fs.openDir,path is right====>");
                    resolve(dirEntry);
                }
            },function(error){
                reject({
                    message:error === 1?"This directory is not exist.":"Open directory happened an error.",
                    srcError:error
                });
            });
        });
    }
    /**
     * 在指定目录中创建指定目录名的目录
     * 路径如果存在，会被返回
     * @param path {DirectoryEntry/String} [necessary] 目录路径或者是一个DirectoryEntry对象
     * @param dirName {String} [necessary] 目录名称
     * @return {Promise}
     */
    fp.createDir = function(path,dirName){
        var that = this;
        return Q.promise(function(resolve,reject){
            that.isExsited(path).then(function(parentEntry){
                if(!parentEntry.isDirectory){
                    reject({
                        message:"In createDir(),the param of path is error."
                    });
                }else{
                    parentEntry.getDirectory(dirName,{
                        create:true,
                        exclusive:true
                    },function(dirEntry){
                        resolve(dirEntry);
                    },function(error){
                        if(error === 12 || error.code && error.code === 12){
                            var filePath = parentEntry.nativeURL + dirName;
                            window.resolveLocalFileSystemURL(filePath,function(dirEntry){
                                resolve(dirEntry);
                            },function(error){
                                reject({
                                    message:"In createDir(),open exist native directory has an error.",
                                    srcError:error
                                });
                            });
                        }else{
                            reject({
                                message:"In createDir(),call native getDirectory() has an error.",
                                srcError:error
                            });
                        }
                    });
                }
            }).catch(function(error){
                reject({
                    message:"In createDir(),catch an error.",
                    srcError:error,
                    currentParams:{
                        path:path,
                        dirName:dirName
                    }
                });
            });
        });
    }
    /**
     * 删除目录
     * @param path {DirectoryEntry/String} [necessary] 要删除的目录，如果目录非空，会返回失败
     * @param ruthlessly {Boolean} [optional] 删除目录，并且删除目录下所有文件，默认false
     */
    fp.deleteDir = function(path,ruthlessly){
        var remove,that = this;
        return Q.promise(function(resolve,reject){
            that.isExsited(path).then(function(dirEntry){
                if(!dirEntry.isDirectory){
                    reject({
                        message:"In deleteDir(),the param of path is error."
                    });
                }else{
                    remove = ruthlessly?dirEntry.removeRecursively:dirEntry.remove;
                    remove.apply(dirEntry,[
                        function(data){
                            resolve();
                        },
                        function(error){
                            reject({
                                message:"In deleteDir(),call native removeRecursively() or remove() has an error.",
                                srcError:error
                            });
                        }
                    ]);
                }
            }).catch(function(error){
                reject({
                    message:"In deleteDir(),catch an error.",
                    srcError:error
                });
            });
        });
    };
    /**
     * 读取目录中的内容，以数组的形式返回
     * @param path {DirectoryEntry/String} 要读取的目录
     * @param useStringList {Boolean} 返回有系统文件路径字符串组成的数组,默认为false,返回由Entry类的子类组成的数组(FileEntry/DirectoryEntry)
     * @param outputCDV {Boolean} 只在useStringList为true时生效，输出转换成 cdvfile 协议的路径集合，默认为false，输出系统文件的路径
     */
    fp.readDir = function(path,useStringList,outputCDV){
        var reader,that = this;
        return Q.promise(function(resolve,reject){
            that.isExsited(path).then(function(dirEntry){
                if(!dirEntry.isDirectory){
                    reject({
                        message:"In readDir(),the param of dirPath is error."
                    });
                }else{
                    reader = dirEntry.createReader();
                    reader.readEntries(function(list){
                        if(!useStringList){
                            resolve(list);
                        }else{
                            var toURL,pathList = [];
                            for(var i=0,item;(item=list[i])!=null;i++){
                                toURL = outputCDV?item.toInternalURL:item.toURL;
                                pathList[i] = toURL.call(item);
                            }
                            resolve(pathList);
                        }
                    },function(error){
                        reject({
                            message:"In readDir(),call native readEntries() has an error.",
                            srcError:error
                        });
                    });
                }
            }).catch(function(error){
                reject({
                    message:"In readDir(),catch an error.",
                    srcError:error
                });
            });
        });
    };
    /**
     * 文件目录是否为空
     * @param path {DirectoryEntry/String} [necessary]
     */
    fp.isDirEmpty = function(path){
        var that = this;
        return Q.promise(function(resolve,reject){
            that.isExsited(path).then(function(dirEntry){
                if(!dirEntry.isDirectory){
                    reject({
                        message:"In isDirEmpty(),the param of dirPath is error."
                    });
                }else{
                    var reader = dirEntry.createReader();
                    reader.readEntries(function(list){
                        resolve(list.length>0);
                    },function(error){
                        reject({
                            message:"In isDirEmpty(),call native readEntries has an error.",
                            srcError:error
                        });
                    });
                }
            }).catch(function(error){
                reject({
                    message:"In isDirEmpty(),catch an error.",
                    srcError:error
                });
            });
        });
    };
    /**
     * 复制一个文件夹到另一个文件夹中，源文件夹中的文件也会被复制过去
     * @param src {DirectoryEntry/String} 源文件夹
     * @param dest {DirectoryEntry/String} 目标文件夹
     * @param newName {String} [optional] 如果提供，会在复制文件夹的同时，更改新文件的名字
     * @return {Promise}
     */
    fp.copyDirTo = function(src,dest,newName){
        var that = this;
        return Q.promise(function(resolve,reject){
            var srcEntry,destEntry;
            that.isExsited(src).then(function(dirEntry){
                if(!dirEntry.isDirectory){
                    reject({
                        message:"In copyDirTo(),the param of src is error."
                    });
                }else{
                    srcEntry = dirEntry;
                    return that.isExsited(dest);
                }
            }).then(function(dirEntry){
                if(!dirEntry.isDirectory){
                    reject({
                        message:"In copyDirTo(),the param of dest is error."
                    });
                }else{
                    destEntry = dirEntry;
                    srcEntry.copyTo(destEntry,newName,function(dirEntry){
                        resolve(dirEntry);
                    },function(error){
                        reject({
                            message:"In copyDirTo(),call native copyTo has an error.",
                            srcError:error
                        });
                    });
                }
            }).catch(function(error){
                reject({
                    message:"In copyDirTo(),catch an error.",
                    srcError:error
                });
            });
        });
    };
    /**
     * 将一个文件夹移动到另一个文件夹中
     * @param src {DirectoryEntry/String} 源文件夹
     * @param dest {DirectoryEntry/String} 目标文件夹
     * @return {Promise}
     */
    fp.moveDirTo = function(src,dest){
        var srcEntry,destEntry,that = this;
        return Q.promise(function(resolve,reject){
            that.isExsited(src).then(function(dirEntry){
                if(!dirEntry.isDirectory){
                    reject({
                        message:"In moveDirTo(),the param of src is error."
                    });
                }else{
                    srcEntry = dirEntry;
                    return that.isExsited(dest);
                }
            }).then(function(dirEntry){
                if(!dirEntry.isDirectory){
                    reject({
                        message:"In moveDirTo(),the param of dest is error."
                    });
                }else{
                    destEntry = dirEntry;
                    srcEntry.moveTo(destEntry,null,function(dirEntry){
                        resolve(dirEntry);
                    },function(error){
                        reject({
                            message:"In moveDirTo(),the param of dest is error.",
                            srcError:error
                        });
                    });
                }
            }).catch(function(error){
                reject({
                    message:"In moveDirTo(),there is an error.",
                    srcError:error
                });
            });
        });
    };
    /**
     * 更改一个文件夹的名字
     * @param dirPath {DirectoryEntry/String} 需要被改名的文件夹
     * @param newName {String} 新的名字
     * @return {Promise}
     */
    fp.renameDir = function(dirPath,newName){
        var that = this,
            srcEntry,destEntry;
        return Q.promise(function(resolve,reject){
            that.isExsited(dirPath).then(function(dirEntry){
                if(!dirEntry.isDirectory){
                    reject({
                        message:"In renameDir(),the param of dirPath is error."
                    });
                }else{
                    srcEntry = dirEntry;
                    var dirName = dirEntry.name,
                        nativePath = dirEntry.nativeURL,
                        parentPath = nativePath.slice(0,nativePath.indexOf(dirName));
                    return that.isExsited(parentPath);
                }
            }).then(function(dirEntry){
                destEntry = dirEntry;
                srcEntry.moveTo(destEntry,newName,function(dirEntry){
                    resolve(dirEntry);
                },function(error){
                    reject({
                        message:"In renameDir(),call native moveTo() has an error.",
                        srcError:error
                    });
                });
            }).catch(function(error){
                reject({
                    message:"In renameDir(),catch an error.",
                    srcError:error
                });
            });
        });
    };

    //===============about file==================================
    /**
     * 打开文件
     * @param path {DirectoryEntry/String} [necessary] 文件路径或者是一个DirectoryEntry对象
     * @param mime {String} [optional] 文件的MIME类型，默认是'application/vnd.android.package-archive'
     * @return {Promise}
     */
    fp.startupFile = function(path,mime,needCDV){
        var filePath,that = this;
        path = path || "";
        mime = mime || DEFAULT_MIME;
        filePath = typeof path === 'object' && path.toURL?path.toURL():typeof path === "string" && !!path?path:"";
        return Q.promise(function(resolve,reject){
            $cordovaFileOpener2.open(filePath,mime,{
                error:function(error){
                    reject({
                        message:"In openFile(),use cordova.plugins.fileOpener2.open() has an error.",
                        srcError:error
                    });
                },
                success:function(){
                    if(needCDV){
                        that.nativeToCDV(filePath).then(function(url){
                            resolve(url);
                        }).catch(function(error){
                            reject({
                                message:"The path--->"+filePath+"<---,can not transfrom to cdv protocal.",
                                srcError:error
                            });
                        });
                    }else{
                        resolve(filePath);
                    }
                }
            });
        });
    };
    /**
     * 删除文件
     * @param path 文件地址
     * @return {Promise}
     */
    fp.deleteFile = function(path){
        var that = this;
        return Q.promise(function(resolve,reject){
            that.isExsited(path).then(function(fileEntry){
                if(!fileEntry.isFile){
                    reject({
                        message:"In deleteFile(),this path is not file,but a directory or an error."
                    });
                }else{
                    fileEntry.remove(function(){
                        resolve();
                    },function(error){
                        reject({
                            message:"In deleteFile(),call native remove() has an error.",
                            srcError:error
                        });
                    });
                }
            }).catch(function(error){
                reject({
                    message:"In deleteFile(),catch an error.",
                    srcError:error
                });
            });
        });
    };
    /**
     * 拷贝一个文件至另一个文件夹或当前文件夹
     * @param src {FileEntry/String} [necessary] 文件路径
     * @param dest {DirectoryEntry/String} [necessary] 文件夹路径
     * @param newName {String} 文件新名称，如果还需要改名，可以提供。
     * @return {Promise}
     */
    fp.copyFileTo = function(src,dest,newName){
        var that = this,srcEntry,destEntry;

        return Q.promise(function(resolve,reject){
            that.isExsited(src).then(function(fileEntry){
                if(!fileEntry.isFile){
                    reject({
                        message:"This path is not file,but a directory."
                    });
                }else{
                    srcEntry = fileEntry;
                    return that.isExsited(dest);
                }
            }).then(function(dirEntry){
                destEntry = dirEntry;
                if(!destEntry || !destEntry.isDirectory){
                    reject({
                        message:"The param of dest is error,please check it."
                    });
                }else{
                    srcEntry.copyTo(destEntry,newName,function(fileEntry){
                        resolve(fileEntry);
                    },function(error){
                        reject({
                            message:"In copyFileTo(),call native coptTo back an error.",
                            srcError:error
                        });
                    });
                }
            }).catch(function(error){
                reject({
                    message:"In copyFileTo(),catch an error.",
                    srcError:error
                });
            });
        });
    };
    /**
     * 将一个文件移动至另一个文件夹或当前文件夹
     * @param filePath {FileEntry/String} [necessary] 文件路径
     * @param dest {DirectoryEntry/String} [necessary] 文件夹路径
     * @return {Promise}
     */
    fp.moveFileTo = function(filePath,dest){
        var that = this,srcEntry,destEntry;
        return Q.promise(function(resolve,reject){
            that.isExsited(filePath).then(function(fileEntry){
                if(!fileEntry.isFile){
                    reject({
                        message:"In moveFileTo(),the param of filePath is error."
                    });
                }else{
                    srcEntry = fileEntry;
                    return that.isExsited(dest);
                }
            }).then(function(dirEntry){
                if(!dirEntry || !dirEntry.isDirectory){
                    reject({
                        message:"In moveFileTo(),the param of dest is error."
                    });
                }else{
                    destEntry = dirEntry;
                    srcEntry.moveTo(destEntry,null,function(fileEntry){
                        resolve(fileEntry);
                    },function(error){
                        reject({
                            message:"In moveFileTo(),call native moveTo() has an error.",
                            srcError:error
                        });
                    });
                }
            }).catch(function(error){
                reject({
                    message:"In moveFileTo(),catch an error.",
                    srcError:error
                });
            });
        });
    };
    /**
     * 更改一个文件的名字
     * @param src {FileEntry/String} [necessary] 文件路径
     * @param newName {String} [necessary] 文件新名字
     * @return {Promise}
     */
    fp.renameFile = function(filePath,newName){
        var that = this,srcEntry,destEntry;
        return Q.promise(function(resolve,reject){
            that.isExsited(filePath).then(function(fileEntry){
                if(!fileEntry.isFile){
                    reject({
                        message:"In renameFile(),the param of filePath is error."
                    });
                }else{
                    var fileName = fileEntry.name,
                        nativePath = fileEntry.nativeURL,
                        parentPath = nativePath.slice(0,nativePath.indexOf(fileName));
                    srcEntry = fileEntry;
                    return that.isExsited(parentPath);
                }
            }).then(function(dirEntry){
                destEntry = dirEntry;
                srcEntry.moveTo(destEntry,newName,function(fileEntry){
                    resolve(fileEntry);
                },function(error){
                    reject({
                        message:"In renameFile(),call native moveTo() has an error",
                        srcError:error
                    });
                });
            }).catch(function(error){
                reject({
                        message:"In renameFile(),catch an error",
                        srcError:error
                    });
            });
        });
    };
    /**
     * 创建一个文件
     * @param targetDir {DirectoryEntry/String} 存放文件的目录地址
     * @param fileName {String} 文件名
     * @return {Promise} 在成功时会返回创建好的FileEntry对象，失败时会返回错误
     */
    fp.createFile = function(targetDir,fileName){
        var that = this;
        return Q.promise(function(resolve,reject){
            that.isExsited(targetDir).then(function(dirEntry){
                if(!dirEntry.isDirectory){
                    reject({
                        message:"In createFile(),the param of targetDir is error."
                    });
                }else{
                    dirEntry.getFile(fileName,{create:true,exclusive:true},function(fileEntry){
                        resolve(fileEntry);
                    },function(error){
                        if(error === 12 || error.code && error.code === 12){
                            var filePath = dirEntry.nativeURL + fileName;
                            resolveLocalFileSystemURL(filePath,function(fileEntry){
                                resolve(fileEntry);
                            },function(error){
                                reject({
                                    message:"In createFile(),open the exist file has an error.",
                                    srcError:error
                                });
                            });
                        }else{
                            reject({
                                message:"In createFile(),call native getFile() has an error.",
                                srcError:error
                            });
                        }
                    });
                }
            }).catch(function(error){
                reject({
                    message:"In createFile(),catch an error.",
                    srcError:error
                });
            });
        });
    };
    /**
     * 向文件中写入数据
     * @param filePath {FileEntry/String} 文件地址
     * @param data {any} 文件数据
     * @return {Promise}
     */
    fp.writeFile = function(filePath,data){
        var that = this,writer;
        if(!data){
            return Q.promise.reject({
                message:"In writeFile(),the param of data is error."
            });
        }

        return Q.promise(function(resolve,reject){
            that.isExsited(filePath).then(function(fileEntry){
                if(!fileEntry.isFile){
                    reject({
                        message:"In writeFile(),the param of filePath is error."
                    });
                }else{
                    writer = fileEntry.createWriter(function(fileWriter){
                        //写入操作完成
                        fileWriter.onwriteend = function(e){
                            console.log(writer,fileWriter);
                            resolve({
                                fileEntry:fileEntry,
                                length:fileWriter.length,
                                position:fileWriter.position
                            });
                        };
                        //写入操作报错
                        fileWriter.onerror = function(e){
                            reject({
                                message:"In writeFile(),write data happened an error.",
                                srcError:e
                            });
                        };
                        //写入操作被打断
                        fileWriter.onabort = function(e){
                            reject({
                                message:"In writeFile(),write data has been aborted.",
                                srcError:e
                            })
                        };
                        fileWriter.write(data);
                    },function(error){
                        reject({
                            message:"In writeFile(),create a file writer happened an error.",
                            srcError:error
                        });
                    });
                }
            }).catch(function(error){
                reject({
                    message:"In writeFile(),catch an error.",
                    srcError:error
                });
            });
        });
    };
    /**
     * 读取文件全部数据
     * @param filePath {FileEntry/String} 文件地址
     * @param type {String} 返回值类型。FileService.BUFFER/FileService.BASE64/FileService.TXT，默认是FileService.TXT
     */
    fp.readFile = function(filePath,type){
        var that = this,reader;
        return Q.promise(function(resolve,reject){
            that.isExsited(filePath).then(function(fileEntry){
                if(!fileEntry.isFile){
                    reject({
                        message:"In readFile(),the param of filePath is error."
                    });
                }else{
                    fileEntry.file(function(file){
                        reader = new FileReader();
                        reader.onload = function(e){
                            var result = this.result;
                            console.log("file===>",file);
                            resolve({
                                fileEntry:fileEntry,
                                result:result,
                                start:file.start,
                                end:file.end,
                                localURL:file.localURL,
                                size:file.size,
                                name:file.name
                            });
                        };
                        reader.onerror = function(e){
                            reject({
                                message:"In readFile(),fileReader read file happened an error.",
                                srcError:e
                            });
                        };
                        reader.onabort = function(e){
                            reject({
                                message:"In readFile(),fileReader's progress has been aborted.",
                                srcError:e
                            });
                        };
                        var method = type === FileService.BUFFER?reader.readAsArrayBuffer:
                            type === FileService.BASE64?reader.readAsDataURL:
                            reader.readAsText;
                        if(file){
                            method.call(reader,file);
                        }else{
                            reject({
                                message:"In readFile(),call fileEntry.file() success,but the file is error.",
                                srcError:"the file===>"+file
                            });
                        }

                    },function(error){
                        reject({
                            message:"In readFile(),call fileEntry.file() happened an error.",
                            srcError:error
                        });
                    });
                }
            }).catch(function(error){
                reject({
                    message:"In readFile(),catch an error.",
                    srcError:error
                });
            });
        });
    };

    //==============about path transfrom====================
    /**
     * @static
     * 获取父级目录地址
     * 支持file:///协议，不支持cdvfile://协议，如果希望使用cdvfile,可以使用parentDirCDV()
     * @param path {String}
     * @return {String}
     */
    FileService.parentDirPath = function(path){
        if(!path || CDV_PTL.test(path)){
            return;
        }
        var list = path.match(RESOLVE_PATH),
            dirName = list[list.length-1];
        return path.slice(0,path.indexOf(dirName));
    };
    /**
     * @static
     * 获取父级目录地址
     * 支持file:///协议和cdvfile://协议。返回的协议和输入的协议格式一致
     * @param path {String} 路径地址
     * @return {Promise}
     */
    FileService.parentDirCDV = function(path){
        if(!path){
            return Q.promise.reject();
        }
        if(FILE_PTL.test(path)){
            return Q.promise.resolve(this.parentDirPath(path));
        }
        if(CDV_PTL.test(path)){
            return Q.promise(function(resolve,reject){
                FileService.cdvToNative(path).then(function(filePath){
                    var parentPath = that.parentDirPath(filePath);
                    return FileService.nativeToCDV(parentPath);
                }).then(function(cdvPath){
                    resolve(cdvPath);
                }).catch(function(error){
                    reject({
                        message:"In parentDirCDV(),catch an error.",
                        srcError:error
                    });
                });
            });
        }
    };
    /**
     * @static
     * cdvfile路径转成系统文件途径
     * @param cdvPath {String} [necessary]
     * @return {Promise}
     */
    FileService.cdvToNative = function(cdvPath){
        return Q.promise(function(resolve,reject){
            window.resolveLocalFileSystemURL(cdvPath,function(entry){
                var nativeURL = entry.toURL();
                resolve(nativeURL);
            },function(error){
                reject({
                    message:"In cdvToNative(),happened an error.",
                    srcError:error
                });
            });
        });
    };
    /**
     * @static
     * 系统文件路径转成cdvfile路径
     * @param nativePath {String} [necessary]
     * @return {Promise}
     */
    FileService.nativeToCDV = function(nativePath){
        return Q.promise(function(resolve,reject){
            window.resolveLocalFileSystemURL(nativePath,function(entry){
                var cdvURL = entry.toInternalURL();
                resolve(cdvURL);
            },function(error){
                reject({
                    message:"In nativeToCDV(),happened an error.",
                    srcError:error
                });
            });
        });
    };
    //======================================================

    return FileService;
}]);

//===================JPFrameManager=============================
angular.module('jpw').factory('JPFrameManager',['$window',function(window){
    "use strict";

    var PrivateClass = {
        handlerList:{length:0}
    },
    initialized = false,
    frameRate = 60,
    animateRequest,
    vendors = ['ms', 'moz', 'webkit', 'o'];
    /**
     * IFrameFrom{
     *  id:String,
     *  handler:Function,
     *  data:Object,
     *  isPlaying:Boolean
     * }
     *
     **/

    /**
     * @private
     * 初始化
     */
    function initialize(){

        for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
            window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
            window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
        }
        if(!window.requestAnimationFrame){
            window.requestAnimationFrame = function (callBack) {
                return setTimeout(callBack, 1000 / frameRate);
            };
        }
        if (!window.cancelAnimationFrame) {
            window.cancelAnimationFrame = function(id) {
                clearTimeout(id);
            };
        }
        FM.removeFrameListener = removeFrameListener;
        FM.pauseFrameListener = pauseFrameListener;
        FM.continueFrameListener = continueFrameListener;
        FM.isListenerPause = isListenerPause;

        initialized = true;
    }
    //============================public=======================================
    /**
     * 添加帧更新监听
     * @param handler {Function} [necessary] 处理器回调
     * @param scope {Object} [optional] 处理器的this指向
     * @param data {Object} [optional] 需要发送到针处理器中的数据集合
     */
    function addFrameListener(handler,scope,data){
        if (!handler || typeof handler !== "function") {
            console.warn("In GNFrameManager's addFrameListener","The params are error.",handler);
            return;
        }
        if(!initialized){
            initialize();
        }
        var id,frameFrom;
        if(!handlerInList(handler)){
            frameFrom = {};
            frameFrom.id = (new Date().getTime())+Math.floor(Math.random()*1000)/100;
            frameFrom.handler = handler;
            frameFrom.scope = scope;
            frameFrom.data = data;
            PrivateClass.handlerList[frameFrom.id] = frameFrom;
            PrivateClass.handlerList.length++;
            frameFrom.isPlaying = true;
        }else{
            return;
        }

        if(!animateRequest){
            animateRequest = window.requestAnimationFrame(drawFrame);
            isPlay = true;
        }

        return frameFrom.id;
    }
    /**
     * 移除帧更新监听
     * @param handler {Function} [necessary] 被注册过的处理器
     */
    function removeFrameListener(handler){
        var list = PrivateClass.handlerList,
            key = handlerInList(handler),
            frameFrom;
        if(!!key){
            frameFrom = list[key];
            frameFrom.id = null;
            frameFrom.handler = null;
            frameFrom.data = null;
            frameFrom.isPlaying = null;
            delete PrivateClass.handlerList[key];
            PrivateClass.handlerList.length--;
        }
        if(list.length<=0 && !!animateRequest){
            window.cancelAnimationFrame(animateRequest);
            animateRequest = null;
            isPlay = false;
        }
    }

    /**
     * 暂停对一个处理器的帧监听
     * @param handlerId {String} [optional] 处理器id。
     * 如果不传入任何参数，会暂停所有订阅者的响应
     */
    function pauseFrameListener(handlerId){
        if(arguments.length===0){
            isPlay = false;
            return;
        }

        if(inListById(handlerId)){
            var frameFrom = PrivateClass.handlerList[handlerId];
            frameFrom.isPlaying = false;
        }
    }

    /**
     * 继续对一个处理器的帧监听
     * @param handlerId {String} [optional] 处理器id。
     * 如果不传入任何参数，会恢复所有订阅者的响应。但是那些单独设置了暂停的处理除外。
     */
    function continueFrameListener(handlerId){
        if(arguments.length===0){
            isPlay = true;
            return;
        }
        var frameFrom;
        if(inListById(handlerId) && !(frameFrom=PrivateClass.handlerList[handlerId]).isPlaying){
            frameFrom.isPlaying = true;
        }
    }

    /**
     * 侦听器是否已被暂停监听
     * @param handlerId {String} [necessary] 处理器id。
     */
    function isListenerPause(handlerId){
        var frameFrom = PrivateClass.handlerList[handlerId];
        return frameFrom && !frameFrom.isPlaying;
    }

    //============================================================
    /**
     * @private
     * 帧更新
     * @param timestamp
     * **/
    function drawFrame(timestamp) {
        if(!isPlay){
            return;
        }
        animateRequest = window.requestAnimationFrame(drawFrame);

        var list = PrivateClass.handlerList;
        var item,scope;
        for(var key in list){
            if(list.hasOwnProperty(key) && (item=PrivateClass.handlerList[key]).isPlaying){
                scope = item.scope;
                if(scope){
                    item.handler.call(scope,timestamp,item.data?item.data:null);
                }else{
                    item.handler(timestamp,item.data?item.data:null);
                }
            }
        }
    }

    /**
     * 处理器是否已被注册在列表中
     * @param handler
     * @returns {boolean}
     */
    function handlerInList(handler){
        var list = PrivateClass.handlerList;
        for(var key in list){
            if(list.hasOwnProperty(key) && list[key].handler === handler){
                return key;
            }
        }
        return false;
    }

    /**
     * 以id的方式查询处理器是否在列表中
     * @param handlerId
     * @returns {boolean}
     */
    function inListById(handlerId){
        return !!PrivateClass.handlerList[handlerId];
    }

    //=========================================
    var FM = {
        frameRate:frameRate,
        addFrameListener:addFrameListener
    };

    return FM;
}]);

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
