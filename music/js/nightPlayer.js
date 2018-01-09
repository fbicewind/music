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
			playIndex = Math.floor(Math.random()*nightPlayer.sysParam.list.length);
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
		ntAudio.addEventListener('error', function(){
			alert('歌曲资源加载失败！');
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
					var count = nightPlayer.sysParam.list.length;
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
				
				//如果有歌词，指定歌词位置
				if(nightPlayer.sysParam.jsonLyric.length > 0){
					for (var i = nightPlayer.sysParam.jsonLyric.length - 1; i >= 0; i--) {
						if (nightPlayer.sysParam.jsonLyric[i].time <= setTime) {
							if (i > 5) {
								$('#musicLrc').scrollTop(25*(i-5));
							}else{
								$('#musicLrc').scrollTop(0);
							}
							$('.music-lrc').removeClass('active');
							$('.music-lrc').eq(i).addClass('active');
							break;
						}
					}
				}

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
		random : false //是否随机播放
	},
	system : {
		initMusicList : function(){
			var str = '';
			$(nightPlayer.sysParam.list).each(function(index, item){
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
			$('#musicLrc').scrollTop(0);
			nightPlayer.system.listScroll(index);
			$('#musicTitle').text(nightPlayer.sysParam.list[index].title + ' - ' + nightPlayer.sysParam.list[index].singer);
			var bgImage = 'url('+nightPlayer.sysParam.list[index].cover+')';
			$('#ntCover').css('background-image', bgImage);
			nightPlayer.system.getLyric(index);
			ntAudio.src = nightPlayer.sysParam.list[index].url;
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
				var count = nightPlayer.sysParam.list.length;
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
			//如果有歌词，歌词滚动
			nightPlayer.system.scrollLrc(setTime);
		},
		listPlaying : function(index){
			$('.music-list-li').removeClass('active');
			$('.music-list-li').eq(index).addClass('active');
		},
		getNextRandom : function(){
			var next = Math.floor(Math.random()*nightPlayer.sysParam.list.length);
			while(next == nightPlayer.sysParam.playIndex){
				next = Math.floor(Math.random()*nightPlayer.sysParam.list.length);
			}
			return next;
		},
		listScroll : function(index){
			$('#musicListUl').scrollTop(25*index);
		},
		parseLyric : function(lrc){
			if (lrc == null || lrc == '') {
				$('#musicLrc').html('找不到歌词...');
				return;
			}
			nightPlayer.sysParam.jsonLyric = [];
		    str = lrc.replace(/\]\[/g,'] [');//"]["没有空格会影响匹配结果
		    var arr = str.match(/(\[\d{2}:\d{2}\.\d{2}\])(.[^\[\]]*)?/g);
		    var time = [], txt = [];
		    for(var i=0; i<arr.length; i++){
				/^(\[\d{2}:\d{2}\.\d{2}\])(.[^\[\]]*)?$/.exec(arr[i]);
				time.push(RegExp.$1);
				txt.push(RegExp.$2);
		    }
		    for(var i=0, j=time.length; i<j; i++) {  
				var obj = {};  
				obj.lyric = txt[i];  
				obj.time = nightPlayer.system.fmtLyricTime(time[i]);  
				nightPlayer.sysParam.jsonLyric.push(obj);  
		    }
	    	var lrcStr = '';
	    	lrcStr += '<div class="music-lrc active" data-num="0">' + nightPlayer.sysParam.jsonLyric[0].lyric + '</div>';
	    	for(var i=1; i<nightPlayer.sysParam.jsonLyric.length;i++){
	    		lrcStr += '<div class="music-lrc" data-num="'
	    			+ i + '">' + nightPlayer.sysParam.jsonLyric[i].lyric + '</div>';
	    	}
	    	$('#musicLrc').html(lrcStr);
		},
		getLyric : function(index){
			var lrc = '';
			if (index == 3) {
				lrc = str4;
			}
			// var lrcurl = nightPlayer.sysParam.list[index].lrcurl;
			// if (url != null && url != '') {
			// 	 $.ajax({
			//         url : lrcurl,
			//         headers : {
			//             contentType:"application/x-www-form-urlencoded"
			//         },
			//         async : false,
			//         success:function(data){
			//             lrc = data;
			//         },
			//         error:function(e){
			//             alert('歌词加载失败！');
			//         }
			//     });
			// }
			nightPlayer.system.parseLyric(lrc);
		},
		fmtLyricTime : function(time){
			var str = time;   
		    // 删除 '['  
		    str = str.substr(1);  
		    // 删除 ']'  
		    str = str.substr(0, str.length-1);    
		    var minutes = parseInt(str.slice(0, str.indexOf(':')));  
		    var seconds = parseFloat(str.substr(str.indexOf(':')+1));  
		    var newTime = (minutes*60 + seconds).toFixed(2);  
		    return newTime;
		},
		scrollLrc : function(currentTime){
			if(nightPlayer.sysParam.jsonLyric.length > 0){
				var index = $('.music-lrc.active').attr('data-num');
				if (index < nightPlayer.sysParam.jsonLyric.length - 2) {
					var nextTime = nightPlayer.sysParam.jsonLyric[parseInt(index) + 1].time;
					if (nextTime <= currentTime) {
						$('.music-lrc').removeClass('active');
						$('.music-lrc').eq(parseInt(index) + 1).addClass('active');
						if (index > 5) {
							$('#musicLrc').scrollTop(25*(index-5));
						}
					}
				}
			}
		}
	},
	sysParam : {
		duration : 0,	//时长
		playIndex : 0,	//当前播放
		prevIndex : 0,	//上一首
		nextIndex : 0,	//下一首
		randomPrev : [],//随机播放的上一首
		jsonLyric : [],	//歌词json
		dynamicProgress : null,	//定时器对象
		list : []	//歌曲列表
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

var str4 = '[ti:北京东路的日子]'
		+ ''
		+ '[ar:冯飞(等)]'
		+ ''
		+ '[by:冯飞]'
		+ ''
		+ 
		'[00:00.00]开始的开始 我们都是孩子'
		+ ''
		+ '[00:05.65]最后的最后 渴望变成天使'
		+ ''
		+ '[00:10.75]歌谣的歌谣 藏着童话的影子'
		+ ''
		+ '[00:15.45]孩子的孩子 该要飞往哪去'
		+ ''
		+ '[00:21.80]阳城狂人  冯飞  制作'
		+ ''
		+ '[00:23.20]开始的开始 我们都是孩子'
		+ ''
		+ '[00:28.10]最后的最后 渴望变成天使'
		+ ''
		+ '[00:33.15]歌谣的歌谣 藏着童话的影子'
		+ ''
		+ '[00:38.10]孩子的孩子 该要飞往哪去'
		+ ''
		+ '[00:44.33] 阳城狂人  冯飞  制作'
		+ ''
		+ '[01:09.70]当某天 你若听见 有人在说 那些奇怪的语言'
		+ ''
		+ '[01:20.00]当某天 你若看见 满街的本子还是学乐先'
		+ ''
		+ '[01:30.50]当某天 再唱着 这首歌会是在哪一个角落'
		+ ''
		+ '[01:41.10]当某天 再踏进 这校园会是哪片落叶 掉进回忆的流年'
		+ ''
		+ '[01:54.50]表示从一楼到四楼的距离 原来只有三年'
		+ ''
		+ '[02:00.00]表示门卫叔叔食堂阿姨 很有夫妻脸'
		+ ''
		+ '[02:05.50]各种季风洋流都搞不懂 还有新视野'
		+ ''
		+ '[02:10.50]各种曾经狂热的海报照片 卖几块几毛钱'
		+ ''
		+ '[02:16.00]我们穿上西装假装成长'
		+ ''
		+ '[02:20.00]胶片挥霍习惯的笑脸'
		+ ''
		+ '[02:22.40]悲伤一发 寂寞唏嘘'
		+ ''
		+ '[02:25.00]痛的初体验'
		+ ''
		+ '[02:26.00]毕业和成年的字眼'
		+ ''
		+ '[02:30.00]格外扣人心弦'
		+ ''
		+ '[02:32.00]各种莫名的感伤'
		+ ''
		+ '[02:35.00]只说句 嘻嘻一些'
		+ ''
		+ '[02:40.00] 阳城狂人  冯飞  制作'
		+ ''
		+ '[03:04.00]十年后 你若听见 有人在说 这些奇怪的语言'
		+ ''
		+ '[03:14.00]十年后 你若看见 满街的本子还是学乐先'
		+ ''
		+ '[03:26.00]表示从一楼到四楼的距离 原来只有三年'
		+ ''
		+ '[03:33.00]表示门卫叔叔食堂阿姨 很有夫妻脸'
		+ ''
		+ '[03:39.00]各种季风洋流都搞不懂 还有新视野'
		+ ''
		+ '[03:44.00]各种曾经狂热的海报照片 卖几块几毛钱'
		+ ''
		+ '[03:49.00]我们即将分别 独自浪在 中国外国不同地点'
		+ ''
		+ '[03:54.80]瞥见白色的校服 还会以为是我认识的谁'
		+ ''
		+ '[04:00.00]顾萍凡哥乌龟大师 方丈我爱你'
		+ ''
		+ '[04:05.00]也或许谁都忘记谁的名字 但记得'
		+ ''
		+ '[04:10.00]北京东路的日子'
		+ ''
		+ '[04:14.00]开始的开始 我们都是孩子'
		+ ''
		+ '[04:19.00]最后的最后 渴望变成天使'
		+ ''
		+ '[04:23.00]歌谣的歌谣 藏着童话的影子'
		+ ''
		+ '[04:29.00]孩子的孩子 该要飞往哪去 ';