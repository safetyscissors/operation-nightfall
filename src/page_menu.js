jQuery.fn.rotate = function(degrees) {
    $(this).css({'-webkit-transform' : 'rotate('+ degrees +'deg)',
                 '-moz-transform' : 'rotate('+ degrees +'deg)',
                 '-ms-transform' : 'rotate('+ degrees +'deg)',
                 'transform' : 'rotate('+ degrees +'deg)'});
};

function init(){
	GLOBAL['state']='home';
	$('#user').focus();
	flicker();
}init()

function flicker(restore){
	var word='nightfall';
	var wordarr=word.split('');
	var transformarr=[];
	transformarr['margin']=200;
	transformarr['fontsize']=3;
	transformarr['fontweight']=200;
	transformarr['rotation']=0;

	var timeout=Math.random()*1500;
	if (!restore){
		wordarr=letter_swap(Math.floor(Math.random()*3),Math.floor(Math.random()*(wordarr.length)),wordarr);
		timeout=100;
		transformarr=transform(Math.floor(Math.random()*4),transformarr);
	}

	$('.title').css('margin-left',transformarr['margin']+'px');
	$('.title').css('margin-top',transformarr['margin']+'px');
	$('.title').css('font-size',transformarr['fontsize']+'em');
	$('.title').css('font-weight',transformarr['fontweight']);
	$('.title').rotate(transformarr['rotation']);

	var w1=(wordarr.slice(0,5)).join('');
	var w2=(wordarr.slice(5)).join('');
	var output='<span style="font-weight:400">'+w1+'</span>'+w2;
	$('#maintitle').html(output)
	if(GLOBAL['state']=='home'){
		if (!restore){
			setTimeout('flicker(1)',timeout)
		}else{
			setTimeout('flicker()',timeout)
		}
	}

}

function letter_swap(action,key,word){
	if(action==0){
		word[key]=' ';
		if(key==0){
			word[key]='&#209;';
		}
		
	}else if(action==1){
		var leet='n16h+f411';
		var leetarr=leet.split('');
		word[key]=leet[key];
	}else if(action==2){
		word[key]=word[key].toUpperCase();
	}
	return word;
}

function transform(action,data){
	if(action==0){
		data['fontweight']=400;
	}
	if(action==1){
		if(Math.random()>.8){
			data['rotation']=(Math.random()>.5)?1:-1;
		}
	}
	if(action==2){
		data['fontsize']=2.9+(Math.random()*.2);
	}
	if(action==3){
		data['margin']=198+(Math.random()*4);
	}
	return data;
}

var transitiontiles=[];
var yscale=xscale=100;
var ctx;
var currentpage;
function transitionOut(transitionfrom){
	GLOBAL['state']='transition';
	GLOBAL['transitioning']=true;
	$('#user').blur();
	$('#transition').html('<canvas id="tileout"></canvas>');
	$('#transition').css('z-index',6);
	var w=$('#tileout')[0].width=window.innerWidth;
	var h=$('#tileout')[0].height=window.innerHeight;
	var xmax=Math.floor(w/xscale)+1;
	var ymax=Math.floor(h/yscale)+1;
	ctx = $('#tileout')[0].getContext('2d');
	
	for (var i=0;i<=xmax;i++){
		var ytiles=[];
		for(var j=0;j<ymax;j++){
			ytiles.push(j);
		}
		transitiontiles.push([i,ytiles]);
	}
	currentpage=transitionfrom;
	setTimeout(function(){transition_iteratetiles(1)},50);

}
	function transition_finish(){
		$('#main').html('');
		if(currentpage=='menu'){
			//GLOBAL['gid']=0;
			//loadGameInit();
			loadLobby();
		}else if(currentpage=='lobby'){
			loadGameInit();
		}else if(currentpage=='gameinit'){
			startGame();
		}else if(currentpage=='game'){
			loadLobby();
		}
		GLOBAL['transitioning']=false;
		$('#transition').fadeOut();
	}
	function transition_iteratetiles(repeat){
		var key=Math.floor(Math.random()*transitiontiles.length);
		var tile=transitiontiles[key];
		var ykey=Math.floor(Math.random()*tile[1].length);
		//got a random x,y
		transition_fillTile(ctx,tile[0],xscale,tile[1][ykey],yscale);
		//filled tile
		if(tile[1].length<=1){
			transitiontiles[key]=transitiontiles[(transitiontiles.length-1)];//swap with last
			transitiontiles.pop();
		}else{
			tile[1][ykey]=tile[1][(tile[1].length-1)];//swap with last
			tile[1].pop();
			transitiontiles[key]=tile;
		}
		
		if(transitiontiles.length>0&&repeat==1){
			if(transitiontiles.length>2){
				transition_iteratetiles(0);
				transition_iteratetiles(0);
			}
			setTimeout(function(){transition_iteratetiles(1)},1000/gameframerate);
		}else if(transitiontiles.length==0){
			transition_finish();
		}
	}
	function transition_fillTile(ctx,x,xscale,y,yscale){
		var color=Math.floor(Math.random()*20);
		ctx.fillStyle='rgba('+color+', '+color+', '+color+','+Math.random()+')';
		ctx.rect(xscale*x,yscale*y,xscale,yscale);
		ctx.fill();
		
	}
function transitionIn(){

}
