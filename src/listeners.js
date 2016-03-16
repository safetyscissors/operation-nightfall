$(document).on('submit','#aliasform',function(){
	transitionOut('menu');
});
$(document).click(function(e){
	if(GLOBAL['state']=='lobby'){
		lobby_click(e.clientX,e.clientY);
	}else if(GLOBAL['state']=='game'){
		game_click(e.clientX,e.clientY);
	}
});
$(document).keydown(function(e) {
	if(GLOBAL['state']=='game'&&e.which>=37&&e.which<=40){
		if(!GLOBAL['transitioning']){
			game_keypress(e.which);
			e.preventDefault(); // prevent the default action (scroll / move caret)
		}
	}else if(GLOBAL['state']=='gameinit'&&e.which==32){
		if(!GLOBAL['transitioning']){
			game_initkeypress(e.which);
			e.preventDefault();
		}
	}else if(GLOBAL['state']=='game'&&e.which==32){
		if(!GLOBAL['transitioning']){
			game_keypress(e.which);
			e.preventDefault();
		}
	}else if(GLOBAL['state']=='lobby'&&e.which==32){
		if(!GLOBAL['transitioning']){
			lobby_space();
		}
	}

});
var listener_dragflag=0;
$(document).mousemove(function(e){
	if(GLOBAL['state']=='lobby'){
		lobby_mouse(e.clientX,e.clientY);
	}else if(GLOBAL['state']=='gameinit'){
		listener_dragflag++;
		game_initmouse(e.clientX,e.clientY);
	}else if(GLOBAL['state']=='gameinit'){
		listener_dragflag++;
	}else if(GLOBAL['state']=='game'){
		game_mousemove(e.clientX,e.clientY);
	}
});
$(document).mousedown(function(e){
	listener_dragflag=0;
	if(GLOBAL['state']=='gameinit'){
		game_dragmouse(e.clientX,e.clientY);
	}
});
$(document).mouseup(function(e){
	if(GLOBAL['state']=='gameinit'){
		game_dragup(e.clientX,e.clientY);
		if(listener_dragflag<5){
			game_initclick(e.clientX,e.clientY);
		}
	}
	if(GLOBAL['state']=='game'){
		if(listener_dragflag<5){
			game_click(e.clientX,e.clientY);
		}
	}
});
