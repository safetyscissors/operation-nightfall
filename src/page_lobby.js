var lobbyctx;
var lobbyhover;
var lobbymouse;
var lobbyclick;
var lobbymouseclick;
var lobbyspace;
var gamectx;
var gameframerate=20;//fps

function loadLobby(){
	currentpage='lobby';
	GLOBAL['state']='lobby';
	$('#main').html('<canvas id="lobby"></canvas>');
	$('#lobby')[0].width=window.innerWidth;
	$('#lobby')[0].height=window.innerHeight;
	lobbyctx=$('#lobby')[0].getContext('2d');

	$('#main').append('<canvas id="game"></canvas>');
	$('#game')[0].width=window.innerWidth;
	$('#game')[0].height=window.innerHeight;
	gamectx=$('#game')[0].getContext('2d');
	$('#main').append('<div class="action"></div>');

	lobbyhover=0;
	lobbymouse=[];
	lobbyclick=-1;
	lobbyspace=false;

	GLOBAL['gamevars']=[];
	GLOBAL['gamevars'].tutorial=data_tutorial;
	GLOBAL['gamevars'].turn='p1';
	GLOBAL['gamevars'].animQueue=[];

	nodes_init();
	nodes_loop();
}
var nodes=[];
function nodes_init(){
	nodes=[];
	for(var i=0;i<4;i++){
		var node=[];
		node.id=i;
		node.x=150+i*150;
		node.y=150;
		node.cycle=0;
		node.maxcycles=0;
		node.realx=0;
		node.realy=0;

		nodes.push(node);
	}
	nodes[3].disabled=true;
	nodes[3].x-=150;
	nodes[2].x-=50;
	nodes[2].y+=100;
}
function nodes_draw(){
	for(var j=0;j<nodes.length;j++){
		nodes[j].cycle-=1;
		if(nodes[j].cycle<0){
			nodes_drift(nodes[j]);
		}
		nodes[j].realx=nodes[j].cycle*((nodes[j].realx-nodes[j].driftx)/nodes[j].maxcycles);
		nodes[j].realy=nodes[j].cycle*((nodes[j].realy-nodes[j].drifty)/nodes[j].maxcycles);
	}
	for(var k=1;k<nodes.length;k++){
		lobbyctx.beginPath();
		x1=nodes[k-1].x+nodes[k-1].realx;
		y1=nodes[k-1].y+nodes[k-1].realy;
		x2=nodes[k].x+nodes[k].realx;
		y2=nodes[k].y+nodes[k].realy;
		if(k==3){
			x1=nodes[k-2].x+nodes[k-2].realx;
			y1=nodes[k-2].y+nodes[k-2].realy;
		}
		lobbyctx.moveTo(x1,y1);
		lobbyctx.lineTo(x2,y2);
		lobbyctx.lineWidth=5;
		lobbyctx.strokeStyle='#088496';
		lobbyctx.stroke();	
	}
	for(var i=0;i<nodes.length;i++){
		var tilewidth=30;
//		lobbyctx.arc(nodes[i].x+nodes[i].realx,nodes[i].y+nodes[i].realy, 20, 0, 2 * Math.PI, false);
		lobbyctx.fillStyle = (nodes[i].disabled)?'#333':'#18CAE6';
		lobbyctx.fillRect(nodes[i].x+nodes[i].realx-tilewidth/2,nodes[i].y+nodes[i].realy-tilewidth/2,tilewidth,tilewidth);

		lobbyctx.lineWidth = 2;
		lobbyctx.strokeStyle = '#222';
		lobbyctx.strokeRect(nodes[i].x+nodes[i].realx-tilewidth/2,nodes[i].y+nodes[i].realy-tilewidth/2,tilewidth,tilewidth);
	}
}
function nodes_drift(node){
	var tolerance=2;
	node.driftx=Math.floor(Math.random()*2*tolerance)-tolerance;
	node.drifty=Math.floor(Math.random()*2*tolerance)-tolerance;

	node.cycle=20+Math.floor(Math.random()*20);
	node.maxcycles=node.cycle;
	nodes[node.id]=node;
}
function nodes_loop(){
	lobbyctx.clearRect(0,0,window.innerWidth,window.innerHeight);
	gamectx.clearRect(0,0,window.innerWidth,window.innerHeight);
	nodes_draw();
	lobby_hover();

	game_animations();
	game_tutorial();
	if(GLOBAL['gamevars'].turn=='tutorial'){
		if(lobbyspace||lobbymouseclick){
			game_chatAnimation(4,true);
			$('.action').html('');
			
			lobbymouseclick=false;
			lobbyspace=false;
		}
	}
	if(GLOBAL['state']=='lobby'){
		setTimeout(function(){nodes_loop()},(1000/gameframerate));
	}

}
function node_ping(){

}
function lobby_space(){
	lobbyspace=true;
}
function lobby_mouse(x,y){
	lobbymouse.x=x;
	lobbymouse.y=y;
}
function lobby_hover(){
	if(lobbyclick>=0){
		lobby_hoverdraw(lobbyhover);
		return;
	}
	var hoverflag=0;
	for(i=0;i<nodes.length;i++){
		var diffx=(nodes[i].x+nodes[i].realx)-lobbymouse.x+25;
		var diffy=(nodes[i].y+nodes[i].realy)-lobbymouse.y+25;
		if(diffx>0&&diffx<50&&diffy>0&&diffy<50){
			hoverflag+=1;
			if(lobbyhover==i){
			}else{
				lobby_hoverinit(i);
				lobbyhover=i;
			}
		}
	}
	if(hoverflag==0){
		lobbyhover=-1;
	}else{
		lobby_hoverdraw(lobbyhover);
	}
}
function lobby_hoverinit(id){
	nodes[id].hover=0;
}
function lobby_hoverdraw(id){
	nodes[id].hover+=1;
	var animscale=nodes[id].hover%20;
	var textscale=Math.floor(nodes[id].hover/20)%3;
	var percentfill=(nodes[id].hover<50)?1-(nodes[id].hover/50):0;
	var nodex=nodes[id].x+nodes[id].realx;
	var nodey=nodes[id].y+nodes[id].realy;
	lobbyctx.strokeStyle='#FFC850';
	lobbyctx.lineWidth=10;
	lobbyctx.beginPath();
	lobbyctx.arc(nodex,nodey,35,1.5*Math.PI, (percentfill*1.5*Math.PI)-.5,true);
	lobbyctx.stroke();
	if(nodes[id].hover>50){
		lobbyctx.beginPath();
		lobbyctx.lineWidth=2;
		lobbyctx.strokeStyle='#000';
		var arcpos=Math.PI*2*(animscale/20);
		lobbyctx.arc(nodex,nodey,32,arcpos,arcpos+.2,true);
		lobbyctx.stroke();
	}else{
		lobbyctx.lineWidth=2;
		lobbyctx.strokeStyle='#000';
		lobbyctx.beginPath();
		lobbyctx.arc(nodex,nodey,32,1.5*Math.PI, (percentfill*1.5*Math.PI)-.5,true);
		lobbyctx.stroke();
	}

	var textdata='';
	switch(textscale){
		case 0:	textdata=data_map[nodes[id].id].level;
				break;
		case 1:	textdata=data_map[nodes[id].id].status;
				break;
		case 2:	textdata=data_map[nodes[id].id].desc;
				break;
	}
	lobbyctx.fillStyle="white";
	lobbyctx.font= "10pt Source Code Pro";
	nodex+=5;
	if(animscale<2||animscale>17){
		for(var i=0;i<textdata.length;i++){
			var diff=(animscale==1||animscale==18)?2:4;
			for(var j=0;j<diff;j++){
				var randi=Math.floor(Math.random()*textdata.length);
				lobbyctx.fillText(textdata[randi],(i*12)+nodex+Math.random()*4,nodey-30+Math.random()*4);
			}
		}
	}else{
		lobbyctx.fillText(textdata,nodex,nodey-30);
	}
}
function lobby_click(x,y){
	lobbymouseclick=true;
	for(i=0;i<nodes.length;i++){
		var diffx=(nodes[i].x+nodes[i].realx)-x+25;
		var diffy=(nodes[i].y+nodes[i].realy)-y+25;
		if(diffx>0&&diffx<50&&diffy>0&&diffy<50){
			if(!nodes[i].locked){
				lobbyclick=i;
				GLOBAL['gid']=nodes[i].id;
				$('#transition').html('');
				$('#transition').show();
				transitionOut('lobby');
			}
		}
	}
}
