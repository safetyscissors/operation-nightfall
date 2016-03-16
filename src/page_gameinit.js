var gamectx;
var gameinit_input=[];
var gameinit_input=[];
var gamedragtile=[];
var gameEntityCount=0;

var gametilesize=40;

var entityObj=function(x,y,id,n,player){
	this.x=x;
	this.y=y;
	this.n=n;
	this.id=id;
	this.nodes=[];
	this.player=player;
	gameEntityCount++;
	this.globalid=gameEntityCount;
}

function loadGameInit(){
	GLOBAL['state']='gameinit';
	$('#main').html('<canvas id="game"></canvas>');
	$('#game')[0].width=window.innerWidth;
	$('#game')[0].height=window.innerHeight;
	gamectx=$('#game')[0].getContext('2d');

	GLOBAL['gamevars'].turn='p1';
	GLOBAL['gamevars'].animQueue=[];
	GLOBAL['gamevars'].tutorialtext='';
	$('#disclaimer').prepend('fps:'+gameframerate+' ');

	$('#main').append('<div class="action"></div>');
	$('.action').html('press space to start');

	gameinit_input.click=false;
	gameinit_input.space=false;

	game_initBoard();
	game_initEntities();
	game_initInv();
	tutorialcheck=true;
	game_updateloop();

}
function game_updateloop(){
	gamectx.clearRect(0,0,window.innerWidth,window.innerHeight);
	game_drawBoard();
	game_drawConnections();
	game_drawInv();
	game_hoverInfo();
	game_dragInfo();

	if(GLOBAL['gamevars'].turn=='tutorial'){
		if(gameinit_input.space||gameinit_input.click){
			game_chatAnimation(4,true);
			gameinit_input.click=false;
			gameinit_input.space=false;
			setTimeout(function(){$('.action').html('press space to start');},1000);
		}
	}else{
		game_initmenu();
	}
	game_tutorial();
	game_animations();

	if(GLOBAL['state']=='gameinit'){
		setTimeout(function(){ game_updateloop()},(1000/gameframerate));
	}


}


/* ************************************************************* *\
	init stuff
\* ************************************************************* */
function game_initBoard(){
	//get map from data.
	var mapdata=data_map[GLOBAL['gid']].map;
	var spawntiles=[];
	GLOBAL['board']=[];
	//copy data into a board of tile objects
	for(var i=0;i<mapdata.length;i++){
		GLOBAL['board'][i]=[];
		for(var j=0;j<mapdata[i].length;j++){
			var tile={x:i,y:j,type:mapdata[i][j]};
			tile.color=Math.round(170+(Math.random()*30));
			if(tile.type==2){
				spawntiles.push(tile);
			}
			GLOBAL['board'][i][j]=tile;
		}
	}
	var xmax=46*GLOBAL['board'].length;
	var ymax=46*GLOBAL['board'][0].length;
	//share the board offset, and spawn tiles.

	GLOBAL['gamevars'].xoffset=Math.round(($('#game')[0].width-xmax)/2);
	GLOBAL['gamevars'].yoffset=Math.round(($('#game')[0].height-ymax)/2);
	GLOBAL['gamevars'].spawnpoints=spawntiles;
}
function game_initEntities(){
	//get entities from data.
	var entitydata=data_map[GLOBAL['gid']].entities;
	GLOBAL['entities']=[];
	//add them to the board and to GLOBAL['entities']
	for(var i=0;i<entitydata.length;i++){
		var entity=new entityObj(entitydata[i].tilex,entitydata[i].tiley,entitydata[i].dataid,'root','ai');
		entity.nodes=$.extend(true, [], entitydata[i].nodes);
		GLOBAL['entities'].push(entity);
		
		GLOBAL['board'][entitydata[i].tilex][entitydata[i].tiley].entity={globalid:entity.globalid,n:'root'};
		for(var j=0;j<entitydata[i].nodes.length;j++){
			var node=entitydata[i].nodes[j];
			GLOBAL['board'][node.x][node.y].entity={globalid:entity.globalid,n:j};
		}

	}
}
function game_initInv(){
	GLOBAL['programinv']=[];
	GLOBAL['programinv'].push([0,1]);
	GLOBAL['programinv'].push([1,1]);
}
function game_dragInfo(){
	if(gameinit_input.drag){
		if(typeof(gamedragtile.tileid)=='undefined'){
			var x=gameinit_input.x;
			var y=gameinit_input.y;
			if(x<=50&&x>8&&y>30){
				y=y-30;
				var tileid=Math.floor(y/46);
				if(y%46<40&&GLOBAL['programinv'].length>tileid){
					game_dragInit(tileid,'bar');
				}
			}else{
				for(var i=0;i<GLOBAL['gamevars'].spawnpoints.length;i++){
					var tile=GLOBAL['gamevars'].spawnpoints[i];
					if(typeof(GLOBAL['board'][tile.x][tile.y].entity)!='undefined'){
						var tx=Math.floor((x-GLOBAL['gamevars'].xoffset)/46);
						var ty=Math.floor((y-GLOBAL['gamevars'].yoffset)/46);
						if(tx==tile.x&&ty==tile.y){
							game_dragInit(tile,'field');
						}
					}
				}
			}			
		}
//		game_dragSnapHighlight();
		game_drawDrag();
	}
}
function game_dragInit(tileid,type){
	if(type=='bar'){
		gamedragtile.tileid=tileid;
		gamedragtile.x=8;
		gamedragtile.y=30+tileid*45;
	}else if(type=='field'){
		gamedragtile.globalid=tileid.entity.globalid;
		gamedragtile.tileid=getEntity(tileid.entity.globalid).id;
		gamedragtile.tilex=tileid.x;
		gamedragtile.tiley=tileid.y;
		gamedragtile.x=(tileid.x*45)+GLOBAL['gamevars'].xoffset;
		gamedragtile.y=(tileid.y*45)+GLOBAL['gamevars'].yoffset;
	}
	gamedragtile.type=type;
	gamedragtile.offsetx=gameinit_input.x-gamedragtile.x;
	gamedragtile.offsety=gameinit_input.y-gamedragtile.y;
}
function getEntity(globalid){
	for(var i=0;i<GLOBAL['entities'].length;i++){
		if(GLOBAL['entities'][i].globalid==globalid){
			return GLOBAL['entities'][i];
		}
	}
}
function removeEntity(globalid){
	for(var i=0;i<GLOBAL['entities'].length;i++){
		if(GLOBAL['entities'][i].globalid==globalid){
			var dataid=GLOBAL['entities'][i].id;
			GLOBAL['entities'].splice(i,1);
			return dataid;
		}
	}
}
function game_hoverInfo(){
	if(!gameinit_input.drag){
		var x=gameinit_input.x;
		var y=gameinit_input.y-30;
		if(x<=50&&x>8&&y>0){
			var tileid=Math.floor(y/45);
			if(y%45<40&&GLOBAL['programinv'].length>tileid){
				game_drawHover(tileid,'bar');
			}
		}else if(GLOBAL['entities']){
			for(var i=0;i<GLOBAL['entities'].length;i++){
				var entity=GLOBAL['entities'][i];
				var xpx=GLOBAL['gamevars'].xoffset+(entity.x*(gametilesize+6));
				var ypx=GLOBAL['gamevars'].yoffset+(entity.y*(gametilesize+6))-30;
				if(x-xpx<46&&x-xpx>0&&y-ypx<46&&y-ypx>0){
					game_drawHover(entity.globalid,'field');
				}				
			}
		}
	}
}
function game_initmenu(){
	var x=100;
	var y=0;
	gamectx.fillStyle='black';
	gamectx.fillRect(x,y,40,40);

	gamectx.beginPath();
	gamectx.fillStyle='#18CAE6';
	gamectx.moveTo(x+10,y+10);
	gamectx.lineTo(x+10,y+30);
	gamectx.lineTo(x+30,y+20);
	gamectx.fill();
	if(gameinit_input.click){
		gameinit_input.click=false;
		if((gameinit_input.x-x)<40&&(gameinit_input.x-x)>0&&(gameinit_input.y-y)<40&&(gameinit_input.y-y)>0){
			game_endInit();
		}
	}else if(gameinit_input.space){
		gameinit_input.space=false;
		game_endInit();
	}
}

function game_endInit(){
	var ready=false;
	for(var i=0;i<GLOBAL['entities'].length;i++){
		if(GLOBAL['entities'][i].player=='p1'){
			ready=true;
			break;
		}
	}
	if(ready){
		$('#transition').html('');
		$('#transition').show();
		transitionOut('gameinit');
	}else{
		$('.action').html('drag programs to white tiles');
		setTimeout(function(){$('.action').html('press space to start');},2000);
	}
}
/* ************************************************************* *\
	draw stuff
\* ************************************************************* */
function game_drawBoard(){
	var x=GLOBAL['gamevars'].xoffset;
	var y=GLOBAL['gamevars'].yoffset;
	var w=gametilesize+6;
	//draw a square for each tile
	for(var i=0;i<GLOBAL['board'].length;i++){
		for(var j=0;j<GLOBAL['board'][i].length;j++){
			var tile=GLOBAL['board'][i][j];
			if(tile.type>0){
				if(tile.type==2&&GLOBAL['state']=='gameinit'){
					gamectx.fillStyle='white';
				}else if(tile.type>0&&GLOBAL['state']=='gameinit'){
					gamectx.fillStyle='grey';
				}else if(GLOBAL['state']=='game'){
					var hue=tile.color;
					gamectx.fillStyle='rgba('+hue+','+hue+','+hue+',.5)';
				}
				gamectx.fillRect(x+((w)*i),y+((w)*j),w,w);
				if(GLOBAL['state']=='game'&&tile.highlight){
					if(tile.highlight=='selected'||tile.highlight=='selectedAtk'){
						gamectx.fillStyle='white';
					}else if(tile.highlight=='move1'){
						gamectx.fillStyle='green';
					}else if(tile.highlight=='move2'){
						gamectx.fillStyle='limegreen';
					}else if(tile.highlight=='atk1'){
						gamectx.fillStyle='#A10000';
					}else if(tile.highlight=='atk2'){
						gamectx.fillStyle='#A10000';
					}
					gamectx.fillRect(x+((w)*i),y+((w)*j),w,w);
				}
			}
			if(typeof(tile.entity)!=='undefined'){
			//has an entity
	if(typeof(gamedragtile)!='undefined'&&gamedragtile.type=='field'&&gamedragtile.globalid==tile.entity.globalid){
					//ignore entity if its currently being dragged somewhere.
				}else{
					var drawx=x+3+((w)*i);
					var drawy=y+3+((w)*j);
					var dataid=getEntity(tile.entity.globalid).id;
					game_drawTile(drawx,drawy,dataid,tile.entity.n);
				}
			}
			if(tile.type==3){
				gamectx.drawImage(data_credit,x+((w)*i)+10,y+((w)*j)+10);
			}
			if(tile.highlight=='selectedAtk'&&GLOBAL['gamevars'].turn!='ai'){
				gamectx.fillStyle='white';
				gamectx.fillText(tile.highlightVal,x+(w*i)+30,y+(w*j)+15);
			}
		}
	}
}
function game_drawMenuTile(x,y,tile,greyout){
	var imgObj=menu_entities[tile].img;
	gamectx.drawImage(imgObj,x,y);
	if(greyout){
		var imageData = gamectx.getImageData(x, y, imgObj.width, imgObj.height);
		var data = imageData.data;

		for(var i=0;i<data.length;i+=4){
			var brightness=0.34*data[i]+0.5*data[i+1]+0.16*data[i+2];
			data[i] = brightness; //red
			data[i + 1] = brightness; //green
			data[i + 2] = brightness; //blue
		}
		gamectx.putImageData(imageData, x, y);
	}
	gamectx.fillStyle='#333';
	gamectx.beginPath();
	gamectx.moveTo(x+35,y);
	gamectx.lineTo(x+40,y+5);
	gamectx.lineTo(x+40,y+40);
	gamectx.lineTo(x+5,y+40);
	gamectx.lineTo(x,y+35);
	gamectx.lineTo(x+35,y+35);
	gamectx.fill();
}
function game_drawTile(x,y,dataid,n){
	if(n=='root'){ //draw the image from dataimg
		gamectx.drawImage(data_entities[dataid].img, x,y);
	}else{ //otherwise, a solid color block from datacolor
		gamectx.fillStyle=data_entities[dataid].color;
		gamectx.fillRect(x,y,35,35);
	}
	//draw the shadow
	gamectx.fillStyle=data_entities[dataid].shadow;
	gamectx.beginPath();
	gamectx.moveTo(x+35,y);
	gamectx.lineTo(x+40,y+5);
	gamectx.lineTo(x+40,y+40);
	gamectx.lineTo(x+5,y+40);
	gamectx.lineTo(x,y+35);
	gamectx.lineTo(x+35,y+35);
	gamectx.fill();
}

function game_drawConnections(){
	for(var i=0;i<GLOBAL['entities'].length;i++){
		var entity=GLOBAL['entities'][i];
		if(entity.nodes.length>0){
			//var color=data_entities[entity.id].color;
			var color='brown';
			//for all nodes,
			for(var j=0;j<entity.nodes.length;j++){
				var node=entity.nodes[j];
				//use previous node unless the last is root.
				var dirx=(j==0)?entity.x-node.x:entity.nodes[j-1].x-node.x;
				var diry=(j==0)?entity.y-node.y:entity.nodes[j-1].y-node.y;
				if(Math.abs(dirx)+Math.abs(diry)>1){continue;}
				var nx=node.x*(gametilesize+6)+GLOBAL['gamevars'].xoffset+13;
				var ny=node.y*(gametilesize+6)+GLOBAL['gamevars'].yoffset+3;
				var nw=gametilesize-20;
				var nh=6;
				if(dirx==0){//if its up or down
					ny-=nh;
					if(diry==1){
						ny+=gametilesize+6;
					}
				}else if(diry==0){//if its left or right
					var swap=nw;
					nw=nh;
					nh=swap;
					nx-=nw+10;
					ny+=10;
					if(dirx==1){
						nx+=gametilesize+6;
					}
				}
				gamectx.fillStyle=color;
				gamectx.fillRect(nx,ny,nw,nh);
			}
		}
	}
}
function game_drawInv(){
	gamectx.fillStyle='#333';
	gamectx.fillRect(0,0,60,$('#game')[0].height);	

	gamectx.lineWidth=1;
	gamectx.strokeStyle='#18CAE6';
	gamectx.shadowColor = '#18CAE6';
	gamectx.shadowBlur = 20;

	gamectx.beginPath();
	gamectx.moveTo(60,0);
	gamectx.lineTo(60,$('#game')[0].height);
	gamectx.stroke();

	gamectx.shadowBlur = 0;

	for(var i=0;i<GLOBAL['programinv'].length;i++){
		if(typeof(gamedragtile)!='undefined'&&gamedragtile.type=='bar'&&i==gamedragtile.tileid){
		}else{
			game_drawTile(8,30+(i*46),GLOBAL['programinv'][i][0],'root');
		}
	}
}
function game_drawDrag(){
	if(!(typeof(gamedragtile.tileid)=='undefined')){
		var x=gameinit_input.x-gamedragtile.offsetx;
		var y=gameinit_input.y-gamedragtile.offsety;
		var tid=(gamedragtile.type=='bar')?GLOBAL['programinv'][gamedragtile.tileid][0]:gamedragtile.tileid;
		game_drawTile(x,y,tid,'root');
	}
}
function game_drawHover(tileid,type){
	var entity;
	var x;
	var y;
	if(type=='bar'){
		entity=data_entities[GLOBAL['programinv'][tileid][0]];
		x=17+8;
		y=50+tileid*45;
	}else if(type=='field'){
		var fieldentity=getEntity(tileid);
		entity=data_entities[fieldentity.id];
		x=GLOBAL['gamevars'].xoffset+((fieldentity.x)*(gametilesize+6))+(gametilesize/2);
		y=GLOBAL['gamevars'].yoffset+(fieldentity.y*(gametilesize+6))+(gametilesize/2);
	}

	gamectx.fillStyle="white";
	gamectx.font= "10pt Source Code Pro";
/*	gamectx.fillText(text.label,x+24,y-10);
	gamectx.fillText('move:'+text.move+' maxsize:'+text.maxsize,x+24,y+2);
	gamectx.fillText('attack1',x+24,y+14);
	gamectx.fillText('attack2',x+24,y+26);
*/	var text=entity.label+'\n'+'move:'+entity.move+' max size:'+entity.maxsize;
	for(var i=0;i<entity.attacks.length;i++){
		var attack=data_attack[entity.attacks[i]];
		text+='\n\n'+'attack:'+attack.label+'\n'+attack.desc;
		text+='\nrange:'+attack.range+' damage:'+attack.damage+' req size:'+attack.req;;
	}
	game_tooltip(x+24,y-18,text);
}
/* ************************************************************* *\
	mouse listeners
\* ************************************************************* */
function game_initmouse(x,y){
	gameinit_input.x=x;
	gameinit_input.y=y;
}
function game_initclick(x,y){
	gameinit_input.x=x;
	gameinit_input.y=y;
	gameinit_input.click=true;
}
function game_initkeypress(key){
	gameinit_input.space=true;
}
function game_dragmouse(x,y){
	gameinit_input.x=x;
	gameinit_input.y=y;
	gameinit_input.drag=true;
}
function game_dragup(){
	game_dropDrag();
	gameinit_input.drag=false;
	gamedragtile=[];
}
function game_dropDrag(){
	if(!(typeof(gamedragtile.tileid)=='undefined')){
		for(var i=0;i<GLOBAL['gamevars'].spawnpoints.length;i++){
			var tile=GLOBAL['gamevars'].spawnpoints[i];
			var x=Math.floor((gameinit_input.x-GLOBAL['gamevars'].xoffset)/46);
			var y=Math.floor((gameinit_input.y-GLOBAL['gamevars'].yoffset)/46);
			if(x==tile.x&&y==tile.y){
				if(!(typeof(GLOBAL['board'][tile.x][tile.y].entity)=='undefined')){
					if(gamedragtile.type=='bar'){//swap from menu
						var draggedid=GLOBAL['programinv'][gamedragtile.tileid][0];
						var menuEntity=new entityObj(tile.x,tile.y,draggedid,'root','p1');
						GLOBAL['entities'].push(menuEntity);
						GLOBAL['programinv'].splice(gamedragtile.tileid,1);

						var boardEntity=getEntity(GLOBAL['board'][tile.x][tile.y].entity.globalid);
						removeEntity(GLOBAL['board'][tile.x][tile.y].entity.globalid);
						GLOBAL['programinv'].unshift([boardEntity.id,1]);
	
						GLOBAL['board'][tile.x][tile.y].entity={globalid:menuEntity.globalid,n:'root'}
					}else if(gamedragtile.globalid!=tile.entity.globalid){//swap from board and not with self
						//remove one
						var existing={globalid:tile.entity.globalid,n:'root'};
						var dragtile={globalid:gamedragtile.globalid,n:'root'};

						GLOBAL['board'][gamedragtile.tilex][gamedragtile.tiley].entity=existing;
						GLOBAL['board'][tile.x][tile.y].entity=dragtile;
						//replace with identical
						var droppedtile=getEntity(existing.globalid);
						droppedtile.x=gamedragtile.tilex;
						droppedtile.y=gamedragtile.tiley;

						var swappedtile=getEntity(dragtile.globalid);
						swappedtile.x=tile.x;
						swappedtile.y=tile.y;
					}
					return;
				}
				if(gamedragtile.type=='bar'){//from menu to empty board
					var tileid=GLOBAL['programinv'][gamedragtile.tileid][0];
					var entity=new entityObj(tile.x,tile.y,tileid,'root','p1');
					GLOBAL['entities'].push(entity);
					GLOBAL['board'][tile.x][tile.y].entity={globalid:entity.globalid,n:'root'};
					GLOBAL['programinv'].splice(gamedragtile.tileid,1);
					return;
				}else{//from board to empty board
					var entity=new entityObj(tile.x,tile.y,gamedragtile.tileid,'root','p1');
					removeEntity(GLOBAL['board'][gamedragtile.tilex][gamedragtile.tiley].entity.globalid);

					GLOBAL['entities'].push(entity);
					GLOBAL['board'][tile.x][tile.y].entity={globalid:entity.globalid,n:'root'};;
					GLOBAL['board'][gamedragtile.tilex][gamedragtile.tiley].entity=undefined;
					return;
				}			
			}
		}
		if(gamedragtile.type=='field'){
			GLOBAL['board'][gamedragtile.tilex][gamedragtile.tiley].entity=undefined;
			GLOBAL['programinv'].unshift([gamedragtile.tileid,1]);
		}
	}	
}
