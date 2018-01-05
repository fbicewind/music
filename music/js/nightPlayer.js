var nightPlayer = {
	init : function(){
		nightPlayer.operation.prev();
		nightPlayer.operation.next();
		nightPlayer.operation.play();
		nightPlayer.operation.pause();
		nightPlayer.operation.toggleList();
		nightPlayer.operation.toggleMute();
		nightPlayer.operation.switchMode();
		nightPlayer.operation.changeProgress();
		nightPlayer.operation.changeVolume();
		nightPlayer.system.initEndTime();
	},
	operation : {
		//上一首
		prev : function(){

		},
		//下一首
		next : function(){
			
		},
		//播放
		play : function(){
			$('#play').click(function(){
				$('#ntCover').css({'animation-play-state':'running'});
				$('#play').hide();
				$('#pause').show();
				ntAudio.play();
			});
		},
		//暂停
		pause : function(){
			$('#pause').click(function(){
				$('#ntCover').css({'animation-play-state':'paused'});
				$('#pause').hide();
				$('#play').show();
				ntAudio.pause();
			});
		},
		//显示隐藏列表
		toggleList : function(){

		},
		//静音
		toggleMute : function(){
			$('#volume').click(function(){
				if($(this).hasClass('fa-volume-off')){
					$(this).removeClass('fa-volume-off').addClass('fa-volume-up');
					$('#volumeNowProgress').css({'width':(nightPlayer.option.volume*100)+'%'});
				}else{
					$(this).removeClass('fa-volume-up').addClass('fa-volume-off');
					$('#volumeNowProgress').css({'width':'0%'});
				}
			});
		},
		//随机播放
		switchMode : function(){

		},
		//指定音乐
		switchMusic : function(index){

		},
		//指定进度播放
		changeProgress : function(){
			$('#musicProgress').click(function(e) {
				var offset = $(this).offset();
				var relativeX = (e.pageX - offset.left);
				var pWidth = $(this).width();
				$('#musicNowProgress').css({'width':(relativeX*100/pWidth)+'%'});
				var setTime = (relativeX/pWidth) * nightPlayer.sysParam.duration;
				$('#startTime').text(fmtMinute(setTime));
				ntAudio.currentTime = setTime;
			});
		},
		//调整音量
		changeVolume : function(){
			if(nightPlayer.option.volume >= 0 && nightPlayer.option.volume < 1){
				$('#volumeNowProgress').css({'width':(nightPlayer.option.volume*100)+'%'});
			}else{
				nightPlayer.option.volume = 1;
			}
			$('#volumeProgress').click(function(e) {
				var offset = $(this).offset();
				var relativeX = (e.pageX - offset.left);
				var pWidth = $(this).width();
				$('#volumeNowProgress').css({'width':(relativeX*100/pWidth)+'%'});
				if($('#volumeNowProgress').width() == 0){
					$('#volume').removeClass('fa-volume-up').addClass('fa-volume-off');
				}else if($('#volume').hasClass('fa-volume-off')){
					$('#volume').removeClass('fa-volume-off').addClass('fa-volume-up');
					ntAudio.volume = relativeX/pWidth;
				}
			});
		}
	},
	option : {
		autoplay : false, //是否自动播放
		volume : 1,	//音量大小
		random : false //是否随机播放
	},
	system : {
		initEndTime : function(){
			nightPlayer.sysParam.duration = ntAudio.duration;
			$('#endTime').text(fmtMinute(nightPlayer.sysParam.duration));
		}
	},
	sysParam : {
		duration : 0
	}
}

function fmtMinute(time){
	return addZero(parseInt(time/60)) + ':' + addZero(parseInt(time%60));
}

function addZero(str){
	str = str + '';
	while(str.length < 2) {
		str = '0' + str
	}
	return str;
}