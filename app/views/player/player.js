'use strict'
 angular.module('Player.player',['ngRoute'])
 .config(['$routeProvider',function($routeProvider){
     $routeProvider
     .when('/player',{
         templateUrl:'./views/player/player.html',controller:'PlayerCtrl'
     })
 }])

 .controller('PlayerCtrl',['$scope','$location',function($scope,$location){
     $scope.musicSelected = false;
     const ipc = require('electron').ipcRenderer;
     ipc.on('modal-file-content',function(event,arg){
         console.log(arg);
         $scope.song = new Howl({
             src:[arg]
         });
         $scope.musicSelected = true;
         $scope.$apply();
     })
     $scope.playMusic = function(){
        $scope.song.play();
     }
 }])