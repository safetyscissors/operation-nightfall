var game_mouse=[];
var game_inputs=[];
var game_selected;
function startGame(){
	GLOBAL['state']='game';
	$('#main').html('<canvas id="game"></canvas>');
	$('#game')[0].width=window.innerWidth;
	$('#game')[0].height=window.innerHeight;
	gamectx=$('#game')[0].getContext('2d');

	$('#main').append('<div class="action"></div>');

	GLOBAL['gamevars'].hoverlisteners=[];
	GLOBAL['gamevars'].turn='p1';
	
	game_inputs=[];
	game_mouse=[];
	game_endPiece();

	game_initTurn();
	game_loop();
}
function game_loop(){
	gamectx.clearRect(0,0,window.innerWidth,window.innerHeight);	
	game_highlight();
	game_drawBoard();
	game_drawConnections();
	game_drawMenu();
	game_mousehover();

	game_tutorial();
	game_menu();
	if(GLOBAL['gamevars'].turn=='p1'){ //if its your turn
		if(game_inputs.arrowkey){
			game_moveEntity(game_inputs.keyx,game_inputs.keyy);
			game_planAttack(game_inputs.keyx,game_inputs.keyy);
		}else if(game_mouse.click){
			if(game_entityMenu()){
			}else if(game_changeSelected()){
			}else if(game_clickMove()){
			}else if(game_clickAttack()){
			}
		}
		game_inputs.arrowkey=false;
		game_mouse.click=false;

	}else if(GLOBAL['gamevars'].turn=='ai'){
		if(aiMove()){
		}else if(aiAttack()){
		}
	}else if(GLOBAL['gamevars'].turn=='end'){
		if(GLOBAL['transitioning']){
		}else{	
			game_endstats();
			if(game_mouse.click||game_inputs.space){
				$('#transition').html('');
				$('#transition').show();
				transitionOut('game');
			}
		}
	}else if(GLOBAL['gamevars'].turn=='tutorial'){
		if(game_mouse.click||game_inputs.space){
			game_mouse.click=false;
			game_inputs.space=false;
			game_chatAnimation(4,true);
		}
	}

	game_animations();
	if(GLOBAL['state']=='game'){
		setTimeout(function(){ game_loop()},(1000/gameframerate));
	}
}
function game_animations(){
	if(!GLOBAL['gamevars'].animQueue){
		GLOBAL['gamevars'].animQueue=[];
	}
	var queuecopy=GLOBAL['gamevars'].animQueue.slice(0);
	GLOBAL['gamevars'].animQueue=[];

	while(queuecopy.length>0){
		var task=queuecopy.pop();
		task();
	}
}
function game_highlight(){
	var player=GLOBAL['gamevars'].turn;
	var selected;
	if(!game_selected&&game_selected!=0){
		if(!game_selectPiece()){
			if(game_end()){
				return;
			}else{
				GLOBAL['gamevars'].turn=(GLOBAL['gamevars'].turn=='ai')?'p1':'ai';
				game_initTurn();
				console.log('turnswap');
				game_selectPiece();
			}
		}
		selected=getEntity(game_selected);
		selected.redrawMove=true;
	}else{
		selected=getEntity(game_selected);
	}


	if(game_mouse.showEntityMenu){
		game_clearHighlights();
		GLOBAL['board'][selected.x][selected.y].highlight='selected';
	}else if((selected.forceattack||selected.movecount<=0)&&!selected.hasAttacked){
		if(!selected.initDrawAttack){
		console.log('highlight',selected.x,selected.y);
			selected.state='attack';
			var attack=game_attackData();
			game_clearHighlights();
			if(attack){
				game_drawAttackPath(selected.x,selected.y,attack.range+1,selected.globalid,0);
				GLOBAL['board'][selected.x][selected.y].highlight='selectedAtk';	
				GLOBAL['board'][selected.x][selected.y].highlightVal=game_attackData(true);	
				selected.initDrawAttack=true;
			}
		}
		
	}else if(selected.redrawMove){
		selected.state='move';
		game_clearHighlights();		
		if(selected.movecount>0){
			game_drawMovePath(selected.x,selected.y,selected.movecount,selected.globalid,0);
		}
		GLOBAL['board'][selected.x][selected.y].highlight='selected';
	}

	if(selected.redrawMove){
		selected.redrawMove=false;
	}
	if(selected.hasAttacked){
		game_clearHighlights();
		GLOBAL['board'][selected.x][selected.y].highlight='selected';
//		game_clearHighlights();
//		game_endPiece();
	}
}
	function game_clearHighlights(){
		for(var i=0;i<GLOBAL['board'].length;i++){
			for(var j=0;j<GLOBAL['board'][i].length;j++){
				GLOBAL['board'][i][j].highlight=undefined;
				GLOBAL['board'][i][j].highlightVal=undefined;
			}
		}
	}
	function game_tooltip(x,y,text,coordinate){
		if(coordinate){
			x=x*46+GLOBAL['gamevars'].xoffset;
			y=y*46+GLOBAL['gamevars'].yoffset;
		}
		var lines=text.split("\n");
		var maxlength=0;
		for(var j=0;j<lines.length;j++){
			maxlength=(lines[j].length>maxlength)?lines[j].length:maxlength;
		}
		var w=(maxlength*8)+20;
		var h=lines.length*20;
		gamectx.fillStyle='black';
		gamectx.fillRect(x,y,w,h);

		gamectx.fillStyle='white';
		for(var i=0;i<lines.length;i++){
			gamectx.fillText(lines[i], x+10, y+15+(i*15));			
		}
	}
	function game_attackData(returnAttackid){
		var selected=getEntity(game_selected);
		if(!selected){
			llog('attackdata','no entity',1);
			return false;
		}
		var attacks=data_entities[selected.id].attacks;
		if(!attacks||attacks.length==0){
			llog('attackdata','no attacks',1);
			selected.hasAttacked=true;
			game_endPiece();
			return false;
		}
		if(selected.attackChoice||selected.attackChoice==0){ //check user choice
			if(selected.attackChoice<attacks.length){
				var attack=data_attack[attacks[selected.attackChoice]];
				if(attack.req>(selected.nodes.length+1)){
				}else{
					if(returnAttackid){
						return selected.attackChoice;
					}
					return attack;
				}
			}
		}
		//set default
		if(returnAttackid){
			return 0;
		}
		return data_attack[attacks[0]];
	}
	function game_drawAttackPath(xin,yin,range,gid,n){
		if(range<=0){
			return;
		}
		if(xin>=0&&yin>=0&&xin<GLOBAL['board'].length&&yin<GLOBAL['board'][xin].length){//on board
			var tile=GLOBAL['board'][xin][yin];
			if(tile.type>0){//no obstacle. doesnt affect propogation though cause its ranged stuff
				var notVisited=(!tile.highlightVal||tile.highlightVal<range);
				if(n==1||notVisited){ //can target self.
					tile.highlight=(n==1)?'atk2':'atk1';
					tile.highlightVal=range;
				}else{
					if(n==0){
					}else{
						return;
					}
				}
			}
			range--;
			n++;
			game_drawAttackPath(xin+1,yin,range,gid,n);
			game_drawAttackPath(xin-1,yin,range,gid,n);
			game_drawAttackPath(xin,yin+1,range,gid,n);
			game_drawAttackPath(xin,yin-1,range,gid,n);
		}
	}
	function game_drawMovePath(xin,yin,count,gid,n){
		if(count<0){
			return;
		}
		if(xin>=0&&yin>=0&&xin<GLOBAL['board'].length&&yin<GLOBAL['board'][xin].length){//on board
			var tile=GLOBAL['board'][xin][yin];
			if(tile.type>0){//no obstacle
				var notVisited=(!tile.highlightVal||tile.highlightVal<count);
				var notOccupied=(!tile.entity||tile.entity.globalid==gid);
				if((n==1||notVisited)&&notOccupied){
					tile.highlight=(n==1)?'move2':'move1';
					tile.highlightVal=count;
				}else{
					if(n==0){
					}else{
						return;
					}
				}
				count--;
				n++;
				game_drawMovePath(xin+1,yin,count,gid,n);
				game_drawMovePath(xin-1,yin,count,gid,n);
				game_drawMovePath(xin,yin+1,count,gid,n);
				game_drawMovePath(xin,yin-1,count,gid,n);
			}
		}
	}
	function game_selectPiece(){
		var player=GLOBAL['gamevars'].turn;
		for(var i=0;i<GLOBAL['entities'].length;i++){
			var entity=GLOBAL['entities'][i];
			if(entity.player==player){
				if(!entity.hasAttacked){
					game_selected=entity.globalid;
					entity.state='move';
					return true;
				}
			}
		}
		game_endPiece();
		return false;
	}
	function game_end(){
		if(GLOBAL['entities'].length==0){
			return 'ai';
		}
		var playercount=0;
		var aicount=0;
		for(var i=0;i<GLOBAL['entities'].length;i++){
			if(GLOBAL['entities'][i].player=='ai'){
				aicount++;
			}else{
				playercount++;
			}
		}
		if(aicount>0&&playercount>0){
			return false;
		}else if(aicount<=0){
			GLOBAL['gamevars'].winner='player';
		}else{
			GLOBAL['gamevars'].winner='ai';
		}
		if(GLOBAL['gamevars'].turn!='end'){
			GLOBAL['gamevars'].turn='end';
			game_inputs.space=false;
		}
		return GLOBAL['gamevars'].winner;
	}
	function game_tutorial(){
		if(GLOBAL['gamevars'].turn=='tutorial'&&!GLOBAL['transitioning']){
			//listen for click
			draw_chat(1);
		}else if(GLOBAL['gid']>0){
		}else if(GLOBAL['gamevars'].tutorial.length>0&&!GLOBAL['transitioning']){
			var tutorials=GLOBAL['gamevars'].tutorial;
			var selected=false;
			if(GLOBAL['state']=='game'){
				selected=getEntity(game_selected);
			}
			if(selected||GLOBAL['state']!='game'){
				if(tutorials[0].state==GLOBAL['state']&&
				(tutorials[0].entitystate=='any'||tutorials[0].entitystate==selected.state)){
					game_mouse.click=false;
					game_inputs.space=false;
					GLOBAL['gamevars'].tutorialtext='';
					for(var i=0;i<tutorials[0].text.length;i++){
						draw_chattext(tutorials[0].text[i].n,tutorials[0].text[i].t);
					}
					game_chatAnimation(4);
					$('.action').html('press space to skip');
					GLOBAL['gamevars'].turn='tutorial';
					tutorials.shift();
				}
			}
		}
	}
	function game_chatTime(){
		var date=new Date();
		var minutes = date.getMinutes();
		var hour = date.getHours();
		return '('+hour+':'+minutes+')';
	}
	function game_chatAnimation(n,hide){
		GLOBAL['transitioning']=true;
		var scale=((10-n)/10);
		if(hide){
			scale=((n+2)/6);
		}
		draw_chat(scale);

		if(n>0){
			GLOBAL['gamevars'].animQueue.push(function(){game_chatAnimation(n-1,hide)});
		}else{
			if(hide){
				$('.action').html('');
				GLOBAL['gamevars'].turn='p1';
			}
			GLOBAL['transitioning']=false;
		}
	}
	function draw_chattext(n,newtext){
		if(n>0){
			GLOBAL['gamevars'].animQueue.push(function(){draw_chattext(n-1,newtext)});
		}else{
			GLOBAL['gamevars'].tutorialtext+='\n'+game_chatTime()+'coolname: '+newtext;
		}
	}
	function draw_chat(scale){
		var w=scale*550;
		var h=scale*500;
		var fontsize=scale*10;
		var x=(GLOBAL['gamevars'].xoffset/2)-w/2+100;
		var y=(GLOBAL['gamevars'].yoffset)-250;
		x=(x>0)?x:50;
		y=(y>0)?y:50;

		if(GLOBAL['state']=='lobby'||GLOBAL['state']=='transition'){
			x=500;
			y=50;
		}
		gamectx.fillStyle='#333';
		roundRect(gamectx,x-2,y-18,w+4,h+20,7,true,false);
		gamectx.fillStyle='#CCCCCC';
		roundRect(gamectx,x,y,w,h,5,true,false);
		gamectx.drawImage(data_irc,x+5,y+5,150*scale,100*scale);
		gamectx.fillStyle="white";
		gamectx.fillRect(x+10+150*scale,y+5,385*scale,485*scale);

		gamectx.fillStyle="black";
		gamectx.font= fontsize+"pt Source Code Pro";
		var text=GLOBAL['gamevars'].tutorialtext;
		
		var lines=text.split("\n");
		for(var i=0;i<lines.length;i++){
			gamectx.fillText(lines[i], x+165*scale, y+20+(i*15)*scale);			
		}
	}
	function game_terminalAnimation(n){
		GLOBAL['transitioning']=true;
		var scale=((10-n)/10);
		draw_terminal(scale);

		if(n>0){
			GLOBAL['gamevars'].animQueue.push(function(){game_terminalAnimation(n-1)});
		}else{
			game_endstats();
			GLOBAL['transitioning']=false;
		}
	}
	function draw_terminal(scale){
		var w=scale*500;
		var h=scale*200;
		var fontsize=scale*10;
		var x=(GLOBAL['gamevars'].xoffset/2)-w/2+100;
		var y=(GLOBAL['gamevars'].yoffset)-h/2;
		x=(x>0)?x:50;
		y=(y>0)?y:50;
//		gamectx.fillStyle='#18CAE6';
		gamectx.fillStyle='#333';
		roundRect(gamectx,x-2,y-18,w+4,h+20,7,true,false);
		gamectx.fillStyle='#2E0854';
		roundRect(gamectx,x,y,w,h,5,true,false);

		gamectx.fillStyle="white";
		gamectx.font= fontsize+"pt Source Code Pro";
		var text;
		if(GLOBAL['gamevars'].winner=='ai'){
			text='permission denied\nsession terminated by host\nactions:';
		}else{
			text='authentication accepted\npermissions:full\nscanning for adjacent nodes\nactions:';
		}
		var lines=text.split("\n");
		for(var i=0;i<lines.length;i++){
			gamectx.fillText(lines[i], x+10, y+15+(i*15));			
		}
		gamectx.fillStyle='limegreen';
	//	gamectx.fillRect(x+70,y+15*(lines.length+1),58,20);
		gamectx.fillRect(x+10,y+15*(lines.length+1),52,20);

		gamectx.fillStyle="white";
	//	gamectx.fillText('.relog',x+75,y+15*(lines.length+2));
		gamectx.fillText('.root',x+15,y+15*(lines.length+2));
	}
	function game_endstats(){
		draw_terminal(1);
	}
	function roundRect(ctx, x, y, width, height, radius, fill, stroke){
		if (typeof stroke=="undefined" ){
			stroke=true;
		}
		if (typeof radius==="undefined"){
			radius=5;
		}
		ctx.beginPath();
		ctx.moveTo(x + radius, y);
		ctx.lineTo(x + width - radius, y);
		ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
		ctx.lineTo(x + width, y + height - radius);
		ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
		ctx.lineTo(x + radius, y + height);
		ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
		ctx.lineTo(x, y + radius);
		ctx.quadraticCurveTo(x, y, x + radius, y);
		ctx.closePath();
		if (stroke){
			ctx.stroke();
		}
		if (fill){
			ctx.fill();
		}        
	}
function game_initTurn(){
	for(var i=0;i<GLOBAL['entities'].length;i++){
		var entity=GLOBAL['entities'][i];
		if(entity.player=='ai'){
			entity.aipath=undefined;
			entity.aitarget=undefined;
		}else{
			entity.undonodes=$.extend(true, [], entity.nodes);
			entity.undopos={x:entity.x,y:entity.y};
		}
		entity.hasAttacked=false;
		entity.forceattack=false;
		entity.movecount=data_entities[entity.id].move;
	}
}
function game_menu(){
	if(game_mouse.click){
		if(game_mouse.x>10&&game_mouse.x<90&&game_mouse.y<30){
			$('#transition').html('');
			$('#transition').show();
			transitionOut('game');
		}
	}
}
function game_drawMenu(){	
	gamectx.fillStyle="white";
	gamectx.font= "10pt Source Code Pro";
	gamectx.fillText('disconnect',10,15);

	if(game_selected&&game_mouse.showEntityMenu){
		var entity=getEntity(game_selected);
		var x=entity.x*46+GLOBAL['gamevars'].xoffset+3;
		var y=entity.y*46+GLOBAL['gamevars'].yoffset+3;
		game_drawMenuTile(x,y,'hide');

		var attacks=data_entities[entity.id].attacks;
		if(attacks&&attacks.length>0){
			x+=46;
			for(var i=0;i<attacks.length;i++){
				var attack=data_attack[attacks[i]];
				if(!attack){
					llog('drawmen','no attack',1);
					return;
				}
				game_drawMenuTile(x,y+(i*46),'atk',entity.hasAttacked||attack.req>(entity.nodes.length+1));
			}
		}

		game_drawMenuTile(x+46,y,'move',(entity.movecount<=0||entity.hasAttacked));
		game_drawMenuTile(x+92,y,'undo',entity.hasAttacked);
		game_drawMenuTile(x+138,y,'exit');
	}
}
function game_click(x,y){
	game_mouse.x=x;
	game_mouse.y=y
	game_mouse.click=true;
}
function game_entityMenu(){
	if(game_selected){
		var entity=getEntity(game_selected);
		var x=Math.floor((game_mouse.x-GLOBAL['gamevars'].xoffset)/46);
		var y=Math.floor((game_mouse.y-GLOBAL['gamevars'].yoffset)/46);
		if(!game_mouse.showEntityMenu){
			if(x==entity.x&&y==entity.y){
				game_mouse.showEntityMenu=true;
				game_addHoverListener('hide',x,y,function(){game_tooltip(x,y-.5,'hide menu',true)});
				//tooltips for attacks
				var attacks=data_entities[entity.id].attacks;
				if(!attacks){
					llog('entitymenu','no attacks',1);
					x--;
				}else{ 
					if(attacks.length>=1){
						var atk=data_attack[attacks[0]];
						var text1=atk.label+'-'+atk.desc+'\nrange:'+atk.range+' damage:'+atk.damage;
						text1+=' req size:'+atk.req;
						game_addHoverListener('attack1',x+1,y,function(){game_tooltip(x+1,y-1,text1,true)});
					}
					if(attacks.length>=2){
						var atk=data_attack[attacks[1]];
						var text2=atk.label+'-'+atk.desc+'\nrange:'+atk.range+' damage:'+atk.damage;
						text2+=' req size:'+atk.req;
						game_addHoverListener('attack2',x+1,y+1,function(){game_tooltip(x+1,y+2,text2,true)});
					}				
				}
/*
				var attacks=data_entities[entity.id].attacks;
				for(var i=0;i<attacks.length;i++){
					var handle='attack'+(i+1);
					var attack=data_attack[attacks[i]];
					var text=attack.label+'-'+attack.desc+'\nrange:'+attack.range+' damage:'+attack.damage;
					var offsety=y+2;
					if(i==0){
						game_addHoverListener(handle,x+1,y,function(){game_tooltip(x+1,y-1,text,true)});
					}else{
						game_addHoverListener(handle,x+1,y+1,function(){game_tooltip(x+1,y+2,text,true)});
					}

				}
*/				game_addHoverListener('move',x+2,y,function(){game_tooltip(x+2,y-.5,'move',true)});
				game_addHoverListener('undo',x+3,y,function(){game_tooltip(x+3,y-.5,'undo',true)});
				game_addHoverListener('endturn',x+4,y,function(){game_tooltip(x+4,y-.5,'end turn',true)});
				return true;
			}else{
				return false;
			}
		}else{ //menu is open
			//do actions
			var attacks=data_entities[entity.id].attacks;
			if(x==entity.x&&y==entity.y){
				game_removeMenuHovers();
				game_mouse.showEntityMenu=false;
			}
			if(attacks&&attacks.length>0){
				x-=1;
			}
			if(attacks&&attacks.length>0&&x==entity.x&&y>=entity.y&&(y-entity.y)<attacks.length){
				var choice=y-entity.y;
				var attack=data_attack[attacks[choice]];
				if(!attack||attack.req>(entity.nodes.length+1)){
				}else{
					console.log('attack '+choice);
					entity.attackChoice=choice;
					entity.forceattack=true;		
					game_removeMenuHovers();
					game_mouse.showEntityMenu=false;
				}
			}else if(x==entity.x+1&&y==entity.y){
				console.log('move');
				entity.forceattack=false;
				game_removeMenuHovers();
				game_mouse.showEntityMenu=false;
			}else if(x==entity.x+2&&y==entity.y){
				console.log('undo');
				game_undoMove();
				game_removeMenuHovers();
				game_mouse.showEntityMenu=false;
			}else if(x==entity.x+3&&y==entity.y){
				entity.hasAttacked=true;
				game_endPiece();	
				console.log('end');
				game_removeMenuHovers();
				game_mouse.showEntityMenu=false;
			}
			//flag to redraw highlights
			if((entity.forceattack||entity.movecount<=0)&&!entity.hasAttacked){
				entity.initDrawAttack=false;
			}else{
				entity.redrawMove=true;
			}
			return true;
		}
	}
	return false;
}
function game_removeMenuHovers(){
	game_removeHoverListener('attack1');
	game_removeHoverListener('attack2');
	game_removeHoverListener('hide');
	game_removeHoverListener('undo');
	game_removeHoverListener('move');
	game_removeHoverListener('endturn');
}
function game_changeSelected(){
	var x=Math.floor((game_mouse.x-GLOBAL['gamevars'].xoffset)/46);
	var y=Math.floor((game_mouse.y-GLOBAL['gamevars'].yoffset)/46);
	if(x>=0&&x<GLOBAL['board'].length&&y>=0&&y<GLOBAL['board'][0].length){
		var tile=GLOBAL['board'][x][y];
		if(tile.entity){
			var player=GLOBAL['gamevars'].turn;
			var entity=getEntity(tile.entity.globalid);
			if(entity.player==player&&entity.globalid!=game_selected){
				console.log('change selected '+game_selected);
				game_selected=entity.globalid;
				console.log('to '+game_selected);
				if(!entity.hasAttacked){
					if(!entity.forceattack||entity.movecount>0){
						entity.state='move';
						entity.redrawMove=true;
					}else{
						entity.state='attack';
						entity.initDrawAttack=false;
					}
				}
				return true;
			}
		}
	}
	return false;
}
function game_undoMove(){
	var entity=getEntity(game_selected);	
	//remove from board
	GLOBAL['board'][entity.x][entity.y].entity=undefined;
	for(var i=0;i<entity.nodes.length;i++){
		var node=entity.nodes[i];
		GLOBAL['board'][node.x][node.y].entity=undefined;
	}
	//reset info
	entity.x=entity.undopos.x;
	entity.y=entity.undopos.y;
	entity.nodes=$.extend(true, [], entity.undonodes);
	entity.forceattack=false;
	entity.movecount=data_entities[entity.id].move;
	//add back to board
	GLOBAL['board'][entity.x][entity.y].entity={globalid:entity.globalid,n:'root'};
	for(var j=0;j<entity.nodes.length;j++){
		var node=entity.nodes[j];
		GLOBAL['board'][node.x][node.y].entity={globalid:entity.globalid,n:j};
	}
}
function game_clickMove(){
	var x=Math.floor((game_mouse.x-GLOBAL['gamevars'].xoffset)/46);
	var y=Math.floor((game_mouse.y-GLOBAL['gamevars'].yoffset)/46);
	var entity=getEntity(game_selected);
	if(!entity){
		llog('clickMove','nothing selected',1);
		return false;
	}
	game_moveEntity(x-entity.x,y-entity.y);
}
function game_clickAttack(){
	var x=Math.floor((game_mouse.x-GLOBAL['gamevars'].xoffset)/46);
	var y=Math.floor((game_mouse.y-GLOBAL['gamevars'].yoffset)/46);
	game_planAttack(x,y);
}
function game_planAttack(x,y){
	var selected=getEntity(game_selected);
	if(!selected){
		llog('planAttack','nothing selected',1);
		return false;
	}
	if(selected.hasAttacked){
		llog('planAttack','has attacked',1);
		return false;
	}
	if(selected.state!='attack'){
		llog('planAttack','not attack state',1);
		return false;
	}
	if(x<0||x>=GLOBAL['board'].length||y<0||y>=GLOBAL['board'][0].length){ //x y are off the board
		llog('planAttack','outside of boundary',1);
		return false;
	}
	var attack=game_attackData();
	if(!attack){
		llog('planAttack','no attack data',1);
		return false;
	}
	var distance=Math.abs(Math.floor(x-selected.x))+Math.abs(Math.floor(y-selected.y));
	if(attack.range<distance){
		llog('planAttack','out of range',1);
		return false;
	}
	
	var tile=GLOBAL['board'][x][y];
	if(tile.type==0){ //clicked obstacle
		llog('planAttack','obstacle',1);
	}else if(tile.entity&&tile.entity.globalid!=selected.globalid){ //clicked not itself
		llog('planAttack','not itself',1);
		game_attack(attack,tile.entity);
		selected.hasAttacked=true;
		selected.forceattack=false;
	}else if(tile.entity&&tile.entity.globalid==selected.globalid){ //clicked itself
		llog('planAttack','itself',1);
		game_attack(attack,tile.entity);
		selected.hasAttacked=true;
		selected.forceattack=false;
	}else if(tile.type>0){
		llog('planAttack','clicked empty',1);
		selected.hasAttacked=true;
		selected.forceattack=false;
	}

	if(selected.hasAttacked){
		game_endPiece();
	}

}
function game_attackAnimation(x,y,n,dataid){
	GLOBAL['transitioning']=true;
	var px=GLOBAL['gamevars'].xoffset+(46*x);
	var py=GLOBAL['gamevars'].yoffset+(46*y);
	game_drawTile(px,py,dataid,0);
/*	var entity=getEntity(game_selected);
	
	gamectx.fillStyle=data_entities[entity.id].color;
	
*/	if(n>0){
		GLOBAL['gamevars'].animQueue.push(function(){game_attackAnimation(x,y,n-20,dataid)});
	}else{
		GLOBAL['board'][x][y].entity=undefined;
		GLOBAL['transitioning']=false;
	}

}
function game_attack(attack,target){
	var entity=getEntity(target.globalid);
	if(entity.nodes.length>0&&attack.damage<=entity.nodes.length){ //remove nodes
		for(var i=0;i<attack.damage;i++){
			var node=entity.nodes.pop();
			game_attackAnimation(node.x,node.y,100*i,entity.id);
			GLOBAL['board'][node.x][node.y].entity=undefined;
		}
	}else{ //remove entity
		game_attackAnimation(entity.x,entity.y,entity.nodes.length*100,entity.id);
		for(var i=0;i<entity.nodes.length;i++){
			var node=entity.nodes.pop();
			game_attackAnimation(node.x,node.y,100*(i),entity.id);	
			GLOBAL['board'][node.x][node.y].entity=undefined;	
		}
		
		GLOBAL['board'][entity.x][entity.y].entity=undefined;	
		removeEntity(entity.globalid);
		var winner=game_end();
		if(winner){
			game_terminalAnimation(4);
			$('.action').html('press space return to menu');
		}
	}
}
function game_endPiece(){
	game_selected=undefined;
	game_inputs.keyx=0;
	game_inputs.keyy=0;
	game_inputs.arrowkey=false;
}
function game_keypress(keycode){
	switch(keycode){
		case 37:	game_inputs.keyx=-1; //left
				game_inputs.keyy=0;
				break;
		case 38:	game_inputs.keyx=0; //up
				game_inputs.keyy=-1;
				break;
		case 39:	game_inputs.keyx=1; //right
				game_inputs.keyy=0;
				break;
		case 40:	game_inputs.keyx=0; //down
				game_inputs.keyy=1;
				break;
		case 32:	game_inputs.space=true;
		default:  return;
	}
	game_inputs.arrowkey=true;
}
function game_mousemove(x,y){
	if(game_inputs.mousehover!=1){
		game_inputs.mousehover=0;
	}
	game_inputs.mousex=x;
	game_inputs.mousey=y;	
}
function game_mousehover(){
	if(game_inputs.mousehover==1){
		var coordx=Math.floor((game_inputs.mousex-GLOBAL['gamevars'].xoffset)/46);
		var coordy=Math.floor((game_inputs.mousey-GLOBAL['gamevars'].yoffset)/46);
		game_inputs.mousehover=3;
		if(GLOBAL['gamevars'].hoverlisteners){ //{name,x,y,action:callback()}
			for(var i=0;i<GLOBAL['gamevars'].hoverlisteners.length;i++){
				var listener=GLOBAL['gamevars'].hoverlisteners[i];
				if(listener.x==coordx&&listener.y==coordy){
					listener.action();
					game_inputs.mousehover=1;
				}
			}
		}

	}else if(game_inputs.mousehover==0){
		game_inputs.mousehover=1;
	}
}
function game_getHoverListener(name){
	for(var i=0;i<GLOBAL['gamevars'].hoverlisteners.length;i++){
		if(GLOBAL['gamevars'].hoverlisteners[i].handle==name){
			return GLOBAL['gamevars'].hoverlisteners[i];
		}
	}
	return false;
}
function game_addHoverListener(name,x,y,callback){
	if(!game_getHoverListener(name)){
		GLOBAL['gamevars'].hoverlisteners.push({'handle':name,'x':x,'y':y,'action':callback});
	}
}
function game_removeHoverListener(name){
	var count=GLOBAL['gamevars'].hoverlisteners.length;
	var matchfound=false;
	for(var i=0;i<count;i++){
		if(GLOBAL['gamevars'].hoverlisteners[i].handle==name){
			GLOBAL['gamevars'].hoverlisteners[i]=GLOBAL['gamevars'].hoverlisteners[count-1];
			matchfound=true;
		}
	}
	if(matchfound){
		GLOBAL['gamevars'].hoverlisteners.pop();
	}
	return matchfound;
}
function game_moveEntity(xin,yin){
	var entity=getEntity(game_selected);
	if(!entity){
		llog('moveEntity','nothing selected',1);
		return false;
	}
	if(entity.state!='move'){
		llog('moveEntity','not movestate',1);
		return false;
	}
	if(Math.abs(xin)+Math.abs(yin)>1||Math.abs(xin)+Math.abs(yin)==0){
		llog('moveEntity','move is not 1 space',1);
		console.log(xin,yin);
		return false;
	}
	if(entity.movecount<=0){
		llog('moveEntity','no moves left',1);
		entity.state='attack';
		return false;
	}
	if(entity.forceattack){
		llog('moveEntity','chose attack',1);
		entity.state='attack';
		return false;
	}
	var x=entity.x+xin;
	var y=entity.y+yin;
	if(!(x<GLOBAL['board'].length&&y<GLOBAL['board'][0].length&&x>-1&&y>-1)){ 
		llog('moveEntity','off the board',1);
		return false;
	}
	var tile=GLOBAL['board'][x][y];
	if(tile.type==0){
		llog('moveEntity','obstacle',1);
		return false;
	}
	if(tile.entity&&tile.entity.globalid!=entity.globalid){ 
		llog('moveEntity','not empty',1);
		return false;
	}
	if(tile.type==3){
		llog('moveEntity','got credit',1);
		tile.type=1;
	}
	game_moveAnimation(x,y,20);
}

function game_moveAnimation(x,y,n){
	GLOBAL['transitioning']=true;
	var entity=getEntity(game_selected);
	var px=GLOBAL['gamevars'].xoffset+(46*x)-(n/2)+5;
	var py=GLOBAL['gamevars'].yoffset+(46*y)-(n/2)+5;
	gamectx.fillStyle=data_entities[entity.id].color;
	gamectx.fillRect(px,py,40+n,40+n);
	if(n>0){
		GLOBAL['gamevars'].animQueue.push(function(){game_moveAnimation(x,y,n-4)});
	}else{
		game_moveEntityBoard(x,y);
		GLOBAL['transitioning']=false;
	}
}
function game_moveEntityBoard(x,y){
	var entity=getEntity(game_selected);
	entity.redrawMove=true;
	var overlap=(GLOBAL['board'][x][y].entity&&GLOBAL['board'][x][y].entity.globalid==entity.globalid);
	if(overlap){
		var overlapid=GLOBAL['board'][x][y].entity.n;
		for(var i=overlapid;i>=0;i--){
			var newx=(i==0)?entity.x:entity.nodes[i-1].x;
			var newy=(i==0)?entity.y:entity.nodes[i-1].y;
			entity.nodes[i].x=newx;
			entity.nodes[i].y=newy;
			GLOBAL['board'][newx][newy].entity={globalid:entity.globalid,n:i};
		}
	}
	if(!overlap){
		if((entity.nodes.length+1)<data_entities[entity.id].maxsize){
			entity.nodes.push({});
		}
		for(var i=entity.nodes.length-1;i>=0;i--){
			var newx=(i==0)?entity.x:entity.nodes[i-1].x;
			var newy=(i==0)?entity.y:entity.nodes[i-1].y;
			if(i==entity.nodes.length-1&&entity.nodes.length+1>=data_entities[entity.id].maxsize){ 
				if(!$.isEmptyObject(entity.nodes[i])){
					GLOBAL['board'][entity.nodes[i].x][entity.nodes[i].y].entity=undefined;
				}
			}
			entity.nodes[i].x=newx;
			entity.nodes[i].y=newy;
			GLOBAL['board'][newx][newy].entity={globalid:entity.globalid,n:i};		

		}
	}
	if(entity.nodes.length==0){
		GLOBAL['board'][entity.x][entity.y].entity=undefined;
	}

	entity.initDrawAttack=false;
	GLOBAL['board'][x][y].entity={globalid:entity.globalid,n:'root'};
	entity.movecount--;
	entity.x=x;
	entity.y=y;
}
function aiAttack(){
	var selected=getEntity(game_selected); //has an entity
	if(!selected){ 
		llog('aiAttack','no entity',1);
		return;
	}
	if(selected.state!='attack'||GLOBAL['transitioning']){
		llog('aiAttack','not attack time',1);
		return;
	}
	if(selected.hasAttacked){
		llog('aiAttack','already attacked',1);
		game_endPiece();
		return;
	}
	var attack=game_attackData();
	if(!attack){
		llog('aiAttack','no attack data',1);
		return false;
	}
	var distance=Math.abs(selected.aitarget.x-selected.x)+Math.abs(selected.aitarget.y-selected.y);
	if(attack.range<distance){
		llog('aiAttack','out of range',1);
		selected.hasAttacked=true;
		return false;
	}
	
	game_attack(attack,GLOBAL['board'][selected.aitarget.x][selected.aitarget.y].entity);
	selected.hasAttacked=true;
	return;
}
function aiMove(){
	var selected=getEntity(game_selected); //has an entity
	if(!selected){ 
		llog('aiMove','no entity',1);
		return false;
	}
	if(selected.movecount>0&&(!selected.aipath||selected.aipath.length<=0)){  //doesnt have a path
		selected.state='move';
		aiPath();
		if(!selected.aipath||selected.aipath.length<=1){
			selected.movecount=0;
			selected.state='attack';
		}
	}

	if(selected.movecount>0&&!selected.hasAttacked&&!GLOBAL['transitioning']){ //can move
		if(selected.aipath&&selected.aipath.length>0){ 
			var nextMove=selected.aipath.pop();
			game_moveEntity(nextMove.pos.x-selected.x,nextMove.pos.y-selected.y);
			
		}
		if(selected.aipath.length==0){
			selected.movecount=0;
		}
		return true;
	}
	return false;
}
function aiPath(){
	var selected=getEntity(game_selected);
	var minDist=1000;
	var minPos;

	for(var i=0;i<GLOBAL['entities'].length;i++){
		var entity=GLOBAL['entities'][i];
		if(entity.globalId!=game_selected&&entity.player!=selected.player){//not me and not teammate->is opponent
			var entityNodes = $.extend(true, [], entity.nodes);
			entityNodes.push({x:entity.x,y:entity.y}); //group root and nodes

			for(var j=0;j<entityNodes.length;j++){ //check nodes
				var target=entityNodes[j];
				var distanceToTarget=Math.abs(target.x-selected.x)+Math.abs(target.y-selected.y);
				if(minDist>distanceToTarget){//closer than minDist
					minDist=distanceToTarget;
					minPos=target;
				}
			}
		}
		
	}
	if(minDist==1000) //nothing was found
		return false;
	selected.aipath=astar({x:selected.x,y:selected.y},minPos);
	selected.aitarget=minPos;
}
var astarTile=function(inPos,inWeight,inFrom,endPos){
	//setTimeout(function(){debugastar(inPos.x,inPos.y,'yellow')},500*timer);
	timer++;

	this.weight=inWeight;
	this.from=inFrom;
	
	this.pos=inPos;
	this.neighbors=[];
	var directions=[[0,1],[0,-1],[1,0],[-1,0]];
	for(var i=0;i<directions.length;i++){
		var x=this.pos.x+directions[i][0];
		var y=this.pos.y+directions[i][1];
		if(x>=0&&x<GLOBAL['board'].length&&y>=0&&y<GLOBAL['board'][0].length){
			var t2=GLOBAL['board'][x][y];
			var hasEntities=(t2.entity!==undefined);
			if(t2.type==0||t2.type==3){ //if tile is an obstacle
				continue;
			}else if(x==endPos.x&&y==endPos.y){// if its the goal add it
			}else if(hasEntities){
				e1=getEntity(game_selected);
				e2=getEntity(t2.entity.globalid);
				//console.log(data_entities[e1.id].label,e1.globalid==e2.globalid,x,y);
				if(e1.globalid!=e2.globalid){
					continue; //if space has entity thats not me
				}
			}
			this.neighbors.push({'x':x,'y':y});
		}
	}
	//console.debug(this);
	return this;
}
var timer=0;
function debugastar(x,y,color){
	var px=GLOBAL['gamevars'].xoffset+(46*x);
	var py=GLOBAL['gamevars'].yoffset+(46*y);
	gamectx.fillStyle=color;
	gamectx.fillRect(px,py,10,10);
}
function astar(startPos,endPos){ // {x,y,gid}
	var searchspace=new Array(GLOBAL['board'].length);
	for(var i=0;i<searchspace.length;i++)
		searchspace[i]=new Array(GLOBAL['board'][0].length);
	var possible =[];
	var evaluated=[];
	var solution =[];

	possible.push(new astarTile(startPos,0,startPos,endPos));
	searchspace[startPos.x][startPos.y]=possible[0];
	while(possible.length>0){
		possible=possible.sort( function(a,b) {
			return (a.weight<b.weight)?1:((b.weight<a.weight)?-1:0);
		}); 
		var heaviestWeighted=possible[possible.length-1];
		var currentWeight=heaviestWeighted.weight;

		if(heaviestWeighted.pos.x==endPos.x&&heaviestWeighted.pos.y==endPos.y){
			var traceBack=heaviestWeighted;
			while (!(traceBack.pos.x==startPos.x&&traceBack.pos.y==startPos.y)){
				var prev=searchspace[traceBack.from.x][traceBack.from.y];
				var px=GLOBAL['gamevars'].xoffset+(46*prev.pos.x);
				var py=GLOBAL['gamevars'].yoffset+(46*prev.pos.y);
				gamectx.fillStyle='blue';

				traceBack=prev;
				solution.push(prev);
			}
			return solution;
		}
		possible.pop();
		evaluated.push(heaviestWeighted);
		currentWeight++;
		$.each(heaviestWeighted.neighbors,function(key,value){
			var notVisited=(searchspace[value.x][value.y]===undefined);
			//var weightedMore=currentWeight>=searchspace[value.x][value.y].weight;

			if(!notVisited && (currentWeight>=searchspace[value.x][value.y].weight)){
			}else if(notVisited || !(currentWeight>=searchspace[value.x][value.y].weight)){
				var n = new astarTile(value,(currentWeight),heaviestWeighted.pos,endPos);
				searchspace[n.pos.x][n.pos.y]=n;
				for(var i=0;i<possible.length;i++){
					var obj=possible[i];
					if(obj.pos.x==n.pos.x&&obj.pos.y==n.pos.y){		//if its queued to check.
						break;
					}
				}
				possible.push(n);
			}
		});
	}
}



