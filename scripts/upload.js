/**
 图片上传

 @author wyj <zjut_wyj@163.com>
 @modified  wyj <2014-03-11>
 @date 2014-02-25
 **/
app.config(function ($routeProvider) {
    $routeProvider.when('/gallery_list', {
        templateUrl: 'bower_components/jhw-ng-upload/views/gallery.html'
    });
});
app.config([
    '$httpProvider', 'fileUploadProvider','API_END_POINT',
    function ($httpProvider, fileUploadProvider, API_END_POINT) {
        angular.extend(fileUploadProvider.defaults, {
            disableImageResize: /Android(?!.*Chrome)|Opera/
                .test(window.navigator.userAgent),
            maxFileSize: 5000000,
            acceptFileTypes: /(\.|\/)(gif|jpe?g|png|swf|flv)$/i,
            xhrFields: {withCredentials: true},
            url: API_END_POINT + "upload"
        });
        if (typeof(window.UEDITOR_CONFIG) != 'undefined'){
            window.UEDITOR_CONFIG.imageUrl = API_END_POINT + 'upload';
            window.UEDITOR_CONFIG.imageManagerUrl = API_END_POINT + 'album/Album_00000000000000000000000830/att';
        }
    }
]);
var pic_resize = function(src, size){
    var src = src ? src : 'upload/system/nopic.jpg',
        dx = src.lastIndexOf(".");
        format = src.substring(dx,src.length);
    return src.substring(0,dx) + "_" + size + format;
}
var pic_resize_list = function(list){
    for(var i = 0,len = list.length; i < len ; i++){
        var pic_item = list[i];
        pic_item['path_min'] = pic_select(pic_item['server_path'],8);
    }
    return list;
}
var FileUploadModelInit = function ($scope, $modalInstance) {
    $scope.select_list = [];
    $scope.ok = function () {
        $modalInstance.close($scope.select_list);
    };
    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
}
var FlashUploadModelInit = function ($scope, $modalInstance) {
    $scope.select_list = [];
    $scope.ok = function () {
        $modalInstance.close($scope.select_list);
    };
    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
}
/**
 * @description 图片上传
 * @method FileUploadCtrl
 * @param $scope
 * @param $rootScope
 * @param $http
 * @param API_END_POINT
 * @constructor
 * @author wyj on 14/5/24
 * @eample
 *
 */
function FileUploadCtrl($scope, $rootScope, $http, API_END_POINT){
    $scope.API_END_POINT = API_END_POINT;
    $scope.cateName = "";
    $scope.searchText = '';
    $scope.loadingFiles = true;
    $scope.albumId = "";
    var formDataOpt = [{
        name : 'album_id',
        value: $scope.albumId
    }];
    $scope.thumb_size  = {
        width : 80,
        height : 80
    }
    $scope.upload_opts = {
        autoUpload: true,
        formData :formDataOpt,
        done: function (e, data) {
            data.result[0].thumbnail_path = data.result[0].server_path;
            $scope.pic_list.unshift(data.result[0]);
        },
        fileuploaddone : function(){
            alert("ss");
        }
    }
    // 获取图片
    $scope.get_pic = function(id){
        $scope.albumId = id;
        formDataOpt[0]['value'] = id;
        $http.get(API_END_POINT + 'album/'+id+'/att')
            .success(function(list){
                $scope.pic_list = list;
            });
    }
    // 选择图片
    $scope.select_pic = function(pic){
        $scope.select_list.push(pic);
        $scope.ok();
    }
    // 图片删除
    $scope.pic_delete = function(pic,index,$event){
        $rootScope.open("是否删除该图片？",function(){
            $http.delete(API_END_POINT + 'album/' +$scope.albumId+'/att/' + pic.att_id)
                .success(function () {
                    $scope.pic_list.splice(index, 1);
                })
                .error(function (data) {
                });
        },{
            ok:"确定",
            cancel : "取消"
        });
        $event.stopPropagation();
        return false;
    }
    // 获取相册分类
    $http.get(API_END_POINT + 'album')
        .success(function ( result ) {
            $scope.cate_list = result.data;
            $scope.get_pic($scope.cate_list[0].album_id);
            if ($scope.cate_list.length === 0){
                var deferred = $q.defer();
                add_cate('默认分类');
                $socpe.get_pic($scope.cate_list[0].album_id);
                return deferred.promise;
            }
        }).error(function () {
        });
    var add_cate = function(name){
        $http.post(API_END_POINT + 'album',{
            name : name
        }).success(function (result) {
            $scope.cate_list.push(result);
        }).error(function () {
        });
    }
    // 添加相册分类
    $scope.add_cate = function(){
        if(!$scope.cateName || $scope.cateName.length == 0){
            return;
        }
        add_cate($scope.cateName);
    }
    // 分类修改
    $scope.cate_edit = function(cate){
        return cate.edit_show = true;
    }
    $scope.cate_edit_save = function(cate){
        $http.put(API_END_POINT + 'album/' + cate.album_id, cate)
            .success(function () {
            })
            .error(function (data) {
            });
        return cate.edit_show = false;
    }
    // 分类删除
    $scope.cate_delete = function(cate,index) {
        $rootScope.open("删除该分类会将这个分类下所有的文件全部删除，是否继续？",function(){
            $http.delete(API_END_POINT + 'album/' + cate.album_id)
                .success(function () {
                    $scope.cate_list.splice(index, 1);
                })
                .error(function (data) {
                });
        },{
            ok:"确定",
            cancel : "取消"
        });
    };
    // 分类显示隐藏
    $scope.cate_hover = function(cate, index) {
        return index == '0' ? cate.show_tool = false :cate.show_tool = ! cate.show_tool;
    };
    $scope.pic_hover = function(pic){
        return pic.show_tool = ! pic.show_tool;
    }
    $scope.checkbox_checked = function(pic,$event){
        $event.stopPropagation();
        return pic.checked = ! pic.checked;
    }
}
/**
 * @description Flash上传
 * @method FlashUploadCtrl
 * @param $scope
 * @param $rootScope
 * @param $http
 * @param API_END_POINT
 * @constructor
 * @author wyj on 14/5/24
 * @eample
 *
 */
function FlashUploadCtrl($scope, $rootScope, $http, API_END_POINT){
    $scope.API_END_POINT = API_END_POINT;
    $scope.cateName = "";
    $scope.searchText = '';
    $scope.loadingFiles = true;
    $scope.albumId = "";
    var formDataOpt = [{
        name : 'album_id',
        value: $scope.albumId
    }];
    $scope.thumb_size  = {
        width : 80,
        height : 80
    }
    $scope.upload_opts = {
        autoUpload: true,
        formData :formDataOpt,
        done: function (e, data) {
            data.result[0].thumbnail_path = data.result[0].server_path;
            $scope.pic_list.unshift(data.result[0]);
        },
        fileuploaddone : function(){
            alert("ss");
        }
    }
    // 获取flash
    $scope.get_pic = function(id){
        $scope.albumId = id;
        formDataOpt[0]['value'] = id;
        $http.get(API_END_POINT + 'album/'+id+'/att?flash=1')
            .success(function(list){
                $scope.pic_list = list;
            });
    }
    // 选择flash
    $scope.select_pic = function(pic){
        $scope.select_list.push(pic);
        $scope.ok();
    }
    // flash删除
    $scope.pic_delete = function(pic,index,$event){
        $rootScope.open("是否删除该flash？",function(){
            $http.delete(API_END_POINT + 'album/' +$scope.albumId+'/att/' + pic.att_id)
                .success(function () {
                    $scope.pic_list.splice(index, 1);
                })
                .error(function (data) {
                });
        },{
            ok:"确定",
            cancel : "取消"
        });
        $event.stopPropagation();
        return false;
    }
    // 获取flash分类
    $http.get(API_END_POINT + 'album')
        .success(function ( result ) {
            $scope.cate_list = result.data;
            $scope.get_pic($scope.cate_list[0].album_id);
        }).error(function () {
    });
    $scope.checkbox_checked = function(pic,$event){
        $event.stopPropagation();
        return pic.checked = ! pic.checked;
    }
}
function FileUploadController($scope, $http, $filter, $window) {
    $scope.loadingFiles = true;
}

app.run(function ($rootScope, $modal) {
// 提供外部调用接口
    $rootScope.openFileDialog = function(callback){
        var modalInstance = $modal.open({
            templateUrl: 'bower_components/jhw-ng-upload/views/file_upload.html',
            controller: FileUploadModelInit,
            windowClass : 'pic-upload-dialog',
            resolve: {
                obj: function () {
                    return "";
                }
            }
        });
        modalInstance.result.then(function (select_list) {
            if(typeof callback !== 'undefined'){
                callback.call(null, select_list);
            }
        }, function () {
        });
        return false;
    };
    $rootScope.openFlashDialog = function(callback){
        var modalInstance = $modal.open({
            templateUrl: 'bower_components/jhw-ng-upload/views/flash_upload.html',
            controller: FlashUploadModelInit,
            windowClass : 'pic-upload-dialog',
            resolve: {
                obj: function () {
                    return "";
                }
            }
        });
        modalInstance.result.then(function (select_list) {
            if(typeof callback !== 'undefined'){
                callback.call(null, select_list);
            }
        }, function () {
        });
        return false;
    }
});