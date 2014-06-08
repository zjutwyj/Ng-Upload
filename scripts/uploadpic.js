/**
 * Created by wjin on 14-2-20.
 */
'use strict';

function uploadPicCtrl($scope, $rootScope, API_END_POINT) {
    //图片上传
    $scope.openFileDialog = function(n, src){
        $rootScope.openFileDialog(function(select_list){
            $("."+n).val(select_list[0].server_path);
            if(src!=undefined){
                $("." +src).attr("src",API_END_POINT+select_list[0].server_path);
            }
        })
    };
}