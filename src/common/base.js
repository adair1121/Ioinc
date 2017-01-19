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
