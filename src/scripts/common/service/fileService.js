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
                        if(error === 12){
                            filePath = parentEntry.nativeURL + dirName;
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
                    srcError:error
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
                        reject({
                            message:error === 12 || error.code && error.code === 12?"This file is already exsite.":"In createFile(),call native getFile() has an error.",
                            srcError:error
                        });
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
                            resolve({
                                fileEntry:fileEntry,
                                length:writer.length,
                                position:writer.position
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
                        fileWriter.write(obj);
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
                        method.call(reader);
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
