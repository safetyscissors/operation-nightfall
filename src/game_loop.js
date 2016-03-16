function llog(from,msg,lvl){
	console.debug(from+' '+msg+' '+lvl);
}
function startGame(){
	llog('startGame','',0);
	$('#main').html('<canvas id="game"></canvas>');
	$('#game')[0].width=window.innerWidth;
	$('#game')[0].height=window.innerHeight;

	GLOBAL['state']='game';
	GLOBAL['ctx']=$('#game')[0].getContext('2d');
	GLOBAL['gamevars']={turn:'p1',fps:5,actionqueue:[]};
	GLOBAL['input']={};
	gameloop();
}startGame();


function gameloop(){
	if(listenerInput()){
		setupActions();
		listenerReset();
	}
	var actions=gamevar('actionqueue');
llog('gameloop',actions.length,0);
	while(actions.length>0){
		var action=actions[0];
		if(action()){
			actions.shift();
		}else{
			break;
		}
	}

	drawBoard();
	drawBoardHighlights();
	drawEntities();
	drawMenu();
	drawTileHighlights();

	setTimeout(function(){gameloop()},(1000/gamevar('fps')));
}
function setupActions(){
	llog('setupActions','',0);
}


function gamevar(key){
	llog('gamevar','',0);
	if(GLOBAL['gamevars'][key]){
		return GLOBAL['gamevars'][key];
	}else{
		llog('gamevar','couldnt find key',1);
	}
}

