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

		var playIndex = 0;
		if(nightPlayer.option.random){
			$('#randomMode').addClass('active').attr('title','当前随机播放');
			playIndex = Math.floor(Math.random()*nightPlayer.option.list.length);
		}
		ntAudio.addEventListener('canplaythrough', function(){
			nightPlayer.system.initEndTime();
			$('#loading').hide();
			$('#ntCover').addClass('spin');
		}, false);
		ntAudio.addEventListener('ended', function(){
			$('#loading').show().css({'display':'inline-block'});
			$('#ntNext').click();
		});
		nightPlayer.system.loadMusic(playIndex, nightPlayer.option.random);
		if (nightPlayer.option.autoplay) {
			$('#play').click();
			nightPlayer.system.listPlaying(playIndex);
		}
	},
	operation : {
		//上一首
		prev : function(){
			$('#ntPrev').click(function(){
				if(nightPlayer.option.random){
					nightPlayer.sysParam.randomPrev.splice(nightPlayer.sysParam.randomPrev.length - 1, 1);
				}
				nightPlayer.system.listPlaying(nightPlayer.sysParam.prevIndex);
				nightPlayer.system.loadMusic(nightPlayer.sysParam.prevIndex, false);
				$('#ntCover').removeClass('spin');
				$('#play').click();
			});
		},
		//下一首
		next : function(){
			$('#ntNext').click(function(){
				nightPlayer.system.listPlaying(nightPlayer.sysParam.nextIndex);
				nightPlayer.system.loadMusic(nightPlayer.sysParam.nextIndex, true);
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
			$('#toggleList').click(function(){
				$('#ntMusicList').toggle(100);
				nightPlayer.system.listScroll(nightPlayer.sysParam.playIndex);
			});
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
			$('#randomMode').click(function(){
				if($(this).hasClass('active')){
					$(this).removeClass('active').attr('title', '当前列表循环');
					nightPlayer.option.random = false;
					nightPlayer.sysParam.randomPrev = [];
					var count = nightPlayer.option.list.length;
					if(nightPlayer.sysParam.playIndex == 0){
						nightPlayer.sysParam.prevIndex = count - 1;
					} else {
						nightPlayer.sysParam.prevIndex = nightPlayer.sysParam.playIndex - 1;
					}
				}else{
					$(this).addClass('active').attr('title','当前随机播放');
					nightPlayer.option.random = true;
				}
			});
		},
		//指定音乐
		switchMusic : function(index){
			nightPlayer.system.loadMusic(index, true);
			$('#ntCover').removeClass('spin');
			$('#play').click();
			nightPlayer.system.listPlaying(index);
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
				if (nightPlayer.option.volume == 0) {
					$('#volume').removeClass('fa-volume-up').addClass('fa-volume-off');
					ntAudio.muted = true;
				}
			}else{
				nightPlayer.option.volume = 1;
			}
			ntAudio.volume = nightPlayer.option.volume;
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
		initMusicList : function(){
			var str = '';
			$(nightPlayer.option.list).each(function(index, item){
				str += '<li class="music-list-li" onclick="nightPlayer.operation.switchMusic('
					+ index + ')"><div class="col-sm-7">'
					+ item.title + '</div><div class="col-sm-5">'
					+ item.singer + '</div></li>';
			});
			$('#musicListUl').html(str);
		},
		initEndTime : function(){
			nightPlayer.sysParam.duration = ntAudio.duration;
			$('#endTime').text(fmtMinute(nightPlayer.sysParam.duration));
		},
		loadMusic : function(index, flag){
			nightPlayer.system.listScroll(index);
			$('#musicTitle').text(nightPlayer.option.list[index].title + ' - ' + nightPlayer.option.list[index].singer);
			var bgImage = 'url('+nightPlayer.option.list[index].cover+')';
			$('#ntCover').css('background-image', bgImage);
			ntAudio.src = nightPlayer.option.list[index].url;
			ntAudio.load();
			nightPlayer.sysParam.playIndex = index;
			if(nightPlayer.option.random){
				nightPlayer.sysParam.nextIndex = nightPlayer.system.getNextRandom();
				if(flag){ //随机播放才记录随机播放的上一首
					nightPlayer.sysParam.randomPrev.push(index);
				}
				if(nightPlayer.sysParam.randomPrev != null && nightPlayer.sysParam.randomPrev.length > 1){
					var pIndex = nightPlayer.sysParam.randomPrev.length - 2;
					nightPlayer.sysParam.prevIndex = nightPlayer.sysParam.randomPrev[pIndex];
				}else{
					nightPlayer.sysParam.prevIndex = nightPlayer.system.getNextRandom();
				}
			}else{
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
			}
		},
		dynamicProgress : function(){
			var setTime = ntAudio.currentTime;
			$('#startTime').text(fmtMinute(setTime));
			$('#musicNowProgress').css({'width': ((setTime*100/nightPlayer.sysParam.duration) +'%')});
		},
		listPlaying : function(index){
			$('.music-list-li').removeClass('active');
			$('.music-list-li').eq(index).addClass('active');
		},
		getNextRandom : function(){
			var next = Math.floor(Math.random()*nightPlayer.option.list.length);
			while(next == nightPlayer.sysParam.playIndex){
				next = Math.floor(Math.random()*nightPlayer.option.list.length);
			}
			return next;
		},
		listScroll : function(index){
			$('#musicListUl').scrollTop(25*index);
		}
	},
	sysParam : {
		duration : 0,	//时长
		playIndex : 0,	//当前播放
		prevIndex : 0,	//上一首
		nextIndex : 0,	//下一首
		randomPrev : [],
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