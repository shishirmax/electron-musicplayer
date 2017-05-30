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
     $scope.songList = [],$scope.songPlaying = false;
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
         $scope.player = new Player(songsArrayForPlaying);
         $scope.musicSelected = true;
         $scope.$apply();
     })
     $scope.playMusic = function(){
         if($scope.songPlaying){
             $scope.songPlaying = false;
             $scope.player.pause();
         }
         else{
             $scope.songPlaying = true;
             $scope.player.play();
         }
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
             console.log(data);
             $scope.trackName = data.name;
             if(data.howl){
                 sound = data.howl;
             }
             else{
                 sound = data.howl = new Howl({
                     src:[data.file],
                     html5:true,
                     onplay:function(){
                         $scope.timer = self.formatTime(Math.round(sound.duration()));
                         requestAnimationFrame(self.step.bind(self));
                         $scope.$apply();
                     },
                     onend:function(){
                         self.skip('right');
                     }
                 });
             }
             sound.play();
             self.index = index;
         },
         formatTime:function(secs){
             var minutes = Math.floor(secs/60)||0;
             var seconds = (secs-minutes * 60)||0;
             return minutes +':'+(seconds<10?'0':'')+seconds;
         },
         step:function(){
            var self = this;
            var sound = self.playlist[self.index].howl;
            var seek = sound.seek()||0;
            progress.style.width = (((seek/sound.duration())*100)||0)+'%';
            if(sound.playing()){
                requestAnimationFrame(self.step.bind(self));
            }

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
                 self.playlist[self.index].howl.stop();
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