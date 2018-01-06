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

		ntAudio.addEventListener('canplaythrough', function(){
			nightPlayer.system.initEndTime();
			$('#loading').hide();
			$('#ntCover').addClass('spin');
		}, false);
		ntAudio.addEventListener('ended', function(){
			$('#loading').show().css({'display':'inline-block'});
			$('#ntNext').click();
		});
		nightPlayer.system.loadMusic(0);
	},
	operation : {
		//上一首
		prev : function(){
			$('#ntPrev').click(function(){
				nightPlayer.system.loadMusic(nightPlayer.sysParam.prevIndex);
				$('#ntCover').removeClass('spin');
				$('#play').click();
			});
		},
		//下一首
		next : function(){
			$('#ntNext').click(function(){
				nightPlayer.system.loadMusic(nightPlayer.sysParam.nextIndex);
				$('#ntCover').removeClass('spin');
				$('#play').click();
			});
		},
		//播放
		play : function(){
			$('#play').click(function(){
				$('#ntCover').css({'animation-play-state':'running'});
				$('#play').hide();
				$('#pause').show();
				ntAudio.play();
				nightPlayer.sysParam.dynamicProgress = setInterval('nightPlayer.system.dynamicProgress()', 200);
			});
		},
		//暂停
		pause : function(){
			$('#pause').click(function(){
				$('#ntCover').css({'animation-play-state':'paused'});
				$('#pause').hide();
				$('#play').show();
				ntAudio.pause();
				window.clearInterval(nightPlayer.sysParam.dynamicProgress)
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
					ntAudio.muted = false;
					ntAudio.volume = nightPlayer.option.volume;
				}else{
					$(this).removeClass('fa-volume-up').addClass('fa-volume-off');
					$('#volumeNowProgress').css({'width':'0%'});
					ntAudio.muted = true;
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
				if(relativeX < 5){
					relativeX = 0;
				}
				ntAudio.volume = relativeX / pWidth;
				$('#volumeNowProgress').css({'width':(relativeX*100/pWidth)+'%'});
				if(relativeX < 5){
					$('#volume').removeClass('fa-volume-up').addClass('fa-volume-off');
					ntAudio.muted = true;
				}else if($('#volume').hasClass('fa-volume-off')){
					$('#volume').removeClass('fa-volume-off').addClass('fa-volume-up');
					ntAudio.muted = false;
				}
			});
		}
	},
	option : {
		autoplay : false, //是否自动播放
		volume : 1,	//音量大小
		random : false, //是否随机播放
		list : []
	},
	system : {
		initEndTime : function(){
			nightPlayer.sysParam.duration = ntAudio.duration;
			$('#endTime').text(fmtMinute(nightPlayer.sysParam.duration));
		},
		loadMusic : function(index){
			$('#musicTitle').text(nightPlayer.option.list[index].title + ' - ' + nightPlayer.option.list[index].singer);
			ntAudio.src = nightPlayer.option.list[index].url;
			ntAudio.load();
			var count = nightPlayer.option.list.length;
			if(index == 0){
				nightPlayer.sysParam.prevIndex = count - 1;
			} else {
				nightPlayer.sysParam.prevIndex = index - 1;
			}
			if (index == (count - 1)) {
				nightPlayer.sysParam.nextIndex = 0;
			} else {
				nightPlayer.sysParam.nextIndex = parseInt(index) + 1;
			}
		},
		dynamicProgress : function(){
			var setTime = ntAudio.currentTime;
			$('#startTime').text(fmtMinute(setTime));
			$('#musicNowProgress').css({'width': ((setTime*100/nightPlayer.sysParam.duration) +'%')});
		}
	},
	sysParam : {
		duration : 0,	//时长
		playIndex : 0,	//当前播放
		prevIndex : 0,	//上一首
		nextIndex : 0,	//下一首
		dynamicProgress : null
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