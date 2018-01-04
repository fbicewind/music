var nightPlayer = {
	init : function(){
		nightPlayer.operation.changeProgress();
		nightPlayer.operation.changeVolume();
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

		},
		//暂停
		pause : function(){

		},
		//显示隐藏列表
		toggleList : function(){

		},
		//静音
		toggleMute : function(){

		},
		//随机播放
		switchMode : function(){

		},
		//指定页音乐
		switchMusic : function(index){

		},
		//指定进度播放
		changeProgress : function(){
			$('#musicProgress').click(function(e) {
			  var offset = $(this).offset();
			  var relativeX = (e.pageX - offset.left);
			  var pWidth = $(this).width();
			  $('#musicNowProgress').css({'width':(relativeX*100/pWidth)+'%'});
			});
		},
		//调整音量
		changeVolume : function(){
			$('#volumeProgress').click(function(e) {
			  var offset = $(this).offset();
			  var relativeX = (e.pageX - offset.left);
			  var pWidth = $(this).width();
			  $('#volumeNowProgress').css({'width':(relativeX*100/pWidth)+'%'});
			});
		}
	},
	option : {
		autoplay : false, //是否自动播放
		volume : 1,	//音量大小
		random : false //是否随机播放
	}
}