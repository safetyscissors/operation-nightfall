var data_map=[[],[],[],[]];
data_map[0].level='127.0.0.1';
data_map[0].status='complete';
data_map[0].desc='tutorials';
data_map[0].map=[
[0,3,1,1,1,0],
[1,1,1,1,1,1],
[1,1,1,1,1,1],
[1,1,1,2,1,1],
[1,1,1,1,1,1],
[1,1,1,1,1,1],
[0,1,1,1,1,0]];
data_map[0].entities=[];
data_map[0].entities[0]={
	'dataid':1,
	'tilex':1,
	'tiley':1,
	'nodes':[{'x':2,'y':1},{'x':2,'y':2},{'x':1,'y':2}]
}

data_map[1].level='168.29.0.212';
data_map[1].status='new';
data_map[1].desc='link1';
data_map[1].map=[
[1,1,1,1,1,1,1,1,1,1],
[1,1,1,1,1,0,1,1,1,1],
[1,1,1,1,1,0,1,1,1,1],
[1,1,0,0,1,1,1,1,1,1],
[1,1,0,0,1,1,1,1,2,1],
[1,1,1,1,1,1,2,1,1,1],
[1,1,1,1,1,1,1,1,1,1]];
data_map[1].entities=[];
data_map[1].entities[0]={
	'dataid':1,
	'tilex':2,
	'tiley':1,
	'nodes':[{'x':1,'y':1}]
}
data_map[1].entities[1]={
	'dataid':1,
	'tilex':2,
	'tiley':2,
	'nodes':[{'x':1,'y':2}]
}

data_map[2].level='level3.com';
data_map[2].status='new';
data_map[2].desc='link2';
data_map[2].map=[
[1,1,1,1,1,1,1,1,1],
[1,1,1,1,1,1,1,1,1],
[1,0,1,1,1,1,1,1,1],
[2,0,1,1,1,1,1,0,1],
[1,0,0,1,1,1,0,0,1],
[1,1,1,3,1,3,1,1,1],
[1,0,0,1,1,1,0,0,2],
[2,0,1,1,1,1,1,0,1],
[1,1,1,1,1,1,1,0,1],
[1,1,1,1,1,1,1,1,1]];
data_map[2].entities=[];
data_map[2].entities[0]={
	'dataid':1,
	'tilex':1,
	'tiley':4,
	'nodes':[{'x':0,'y':4}]
}
data_map[2].entities[1]={
	'dataid':1,
	'tilex':8,
	'tiley':4,
	'nodes':[{'x':9,'y':4}]
}
data_map[2].entities[2]={
	'dataid':1,
	'tilex':5,
	'tiley':4,
	'nodes':[]
}
data_map[2].entities[3]={
	'dataid':1,
	'tilex':8,
	'tiley':3,
	'nodes':[{'x':9,'y':3}]
}
data_map[2].entities[4]={
	'dataid':1,
	'tilex':1,
	'tiley':5,
	'nodes':[{'x':0,'y':5}]
}

data_map[3].level='https://prx.securebanking.com';
data_map[3].status='locked';
data_map[3].desc='link2';

data_tutorial=[];
data_tutorial[0]={'state':'lobby','entitystate':'any','text':[]};
	data_tutorial[0].text.push({n:0,t:'degrading dialogue. you nub'});
	data_tutorial[0].text.push({n:20,t:"story blah blah\nsecret government stuff testing this company's\n security"});
	data_tutorial[0].text.push({n:40,t:'this is their network\ntakeover nodes to find more nodes'});
	data_tutorial[0].text.push({n:80,t:'click anywhere or press space \nto advance or close dialogue'});
data_tutorial[2]={'state':'game','entitystate':'any','gid':0,'text':[]};
	data_tutorial[2].text.push({n:0,t:'mindblowing roleplay here'});
	data_tutorial[2].text.push({n:10,t:'lets start this databattle'});
	data_tutorial[2].text.push({n:50,t:'each piece has a move\n phase followed by an attack'});
	data_tutorial[2].text.push({n:110,t:'click on highlighted tiles\n to move or use the arrow keys'});
	data_tutorial[2].text.push({n:140,t:"click on your program's\n icon to see other actions"});
data_tutorial[1]={'state':'gameinit','entitystate':'any','gid':0,'text':[]};
	data_tutorial[1].text.push({n:0,t:'sensual storyline words'});
	data_tutorial[1].text.push({n:20,t:'check out this databattle'});
	data_tutorial[1].text.push({n:40,t:'your programs are listed\non the left. drag and drop them on open ports \nhighlighted in white.'});
data_tutorial[3]={'state':'game','entitystate':'attack','gid':0,'text':[]};
	data_tutorial[3].text.push({n:0,t:'Your move phase has ended'});
	data_tutorial[3].text.push({n:10,t:'Your current attack, \nbash, does 2 damage at 2 range'});
	data_tutorial[3].text.push({n:40,t:"Click your program's \nicon to see more attack details, switch to a \nsecond attack, or undo your move"});

menu_entities=[];
menu_entities['atk']={'img':new Image()};
menu_entities['atk'].img.src='img/menu_atk.gif';
menu_entities['exit']={'img':new Image()};
menu_entities['exit'].img.src='img/menu_exit.gif';
menu_entities['move']={'img':new Image()};
menu_entities['move'].img.src='img/menu_move.gif';
menu_entities['undo']={'img':new Image()};
menu_entities['undo'].img.src='img/menu_undo.gif';
menu_entities['hide']={'img':new Image()};
menu_entities['hide'].img.src='img/menu_hide.gif';

data_credit=new Image();
data_credit.src='img/credit.gif';
data_irc=new Image();
data_irc.src='img/irc_sidebar.gif';


data_entities=[];
data_entities[0]={
	'typeid':0,
	'label':'sentinel',
	'color':'#FF9900',
	'shadow':'brown',
	'img':new Image(),
	'move':3,
	'maxsize':4,
	'attacks':[0,1]
};
data_entities[0].img.src='img/prog0.gif';
data_entities[1]={
	'typeid':1,
	'label':'fire wall',
	'color':'#FF6600',
	'shadow':'brown',
	'img':new Image(),
	'move':2,
	'maxsize':2,
	'attacks':[0]
};
data_entities[1].img.src='img/prog1.gif';

data_attack=[];
data_attack[0]={
	'typeid':0,
	'label':'bash',
	'damage':2,
	'range':2,
	'req':0,
	'desc':'hits something'
}
data_attack[1]={
	'typeid':1,
	'label':'crash',
	'damage':3,
	'range':1,
	'req':3,
	'desc':'hits something else'
}

