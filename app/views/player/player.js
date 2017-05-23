'use strict'
 angular.module('Player.player',['ngRoute'])
 .config(['$routeProvider',function($routeProvider){
     $routeProvider
     .when('/player',{
         templateUrl:'./views/player/player.html',controller:'PlayerCtrl'
     })
 }])

 .controller('PlayerCtrl',['$scope','$location',function($scope,$location){
     $scope.musicSelected = false,$scope.trackName = null;
     $scope.songList = [];
     const ipc = require('electron').ipcRenderer;
     ipc.on('modal-file-content',function(event,arg){
         console.log(arg);
         $scope.songList = arg;
         var songsArrayForPlaying = [];
         for(var i =0;i<$scope.songList.length;i++){
             songsArrayForPlaying.push({
                 title:arg.path+'/'+$scope.songList[i],
                 file:arg.path+'/'+$scope.songList[i],
                 howl:null,
                 name:$scope.songList[i]
             })
         }

        //  $scope.song = new Howl({
        //      src:[arg]
        //  });
        $scope.player = new Player(songsArrayForPlaying);
         $scope.musicSelected = true;
         $scope.$apply();
     })
     $scope.playMusic = function(){
        $scope.player.play();
     }
     var Player = function(playlist){
         this.playlist = playlist;
         this.index = 0;
     }

     Player.prototype = {
         play:function(index){
             var self = this;
             var sound = null;
             index = typeof index === 'number'?index:self.index;
             var data = self.playlist[index];
             $scope.trackName = data.name;
             if(data.howl){
                 sound = data.howl;
             }
             else{
                 sound = data.howl = new Howl({
                     src:[data.file],
                     html5:true
                 })
             }
             sound.play();
             self.index = index;
         },
         pause:function(){
             var self = this;
             var sound = self.playlist[self.index].howl;
             sound.pause();
         },
         skip:function(direction){
             var self = this;
             var index = 0;
             if(direction === 'prev')
             {
                 index = self.index - 1 ;
                 if(index<0)
                 {
                     index = self.playlist.length - 1;
                 }
             }
             else{
                 index = self.index + 1;
                 if(index >= self.playlist.length)
                 {
                     index = 0;
                 }
             }
             self.skipTo(index);
         },
         skipTo:function(index){
             var self = this;
             if(self.playlist[self.index].howl){
                 self.playlist[self.index].howl.stop()
             }
             self.play(index);
         },
         seek:function(time){
             var self = this;
             var sound = self.playlist[self.index].howl;
             if(sound.playing()){
                 sound.seek(sound.duration()*time);
             }
         }
     }
 }])