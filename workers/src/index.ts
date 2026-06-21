var rooms = {};
function initBoard(){ return Array(15).fill(null).map(function(){return Array(15).fill(0)}); }
function checkWin(board,row,col,color){
  var dirs=[[0,1],[1,0],[1,1],[1,-1]];
  for(var d=0;d<dirs.length;d++){var dr=dirs[d][0],dc=dirs[d][1];
    var line=[{row:row,col:col}];var r=row+dr,c=col+dc;
    while(r>=0&&r<15&&c>=0&&c<15&&board[r][c]===color){line.push({row:r,col:c});r+=dr;c+=dc;}
    r=row-dr;c=col-dc;
    while(r>=0&&r<15&&c>=0&&c<15&&board[r][c]===color){line.unshift({row:r,col:c});r-=dr;c-=dc;}
    if(line.length>=5)return line;
  }
  return null;
}

export default {
  async fetch(request){
    var url=new URL(request.url);
    if(url.pathname==='/join'){
      var roomId=url.searchParams.get('room')||'0000';
      var room=rooms[roomId];
      // 房间不存在则自动创建（第一人）
      if(!room){ room={players:[],board:initBoard(),currentPlayer:1,moves:[],status:'PLAYING'}; rooms[roomId]=room; }
      var pair=new WebSocketPair();var client=pair[0],server=pair[1];server.accept();
      var color=room.players.length===0?1:2;
      var player={color:color,ws:server};room.players.push(player);
      server.send(JSON.stringify({type:'ASSIGN',color:color,roomId:roomId}));
      if(room.players.length===2){
        var msg=JSON.stringify({type:'GAME_START',board:room.board,currentPlayer:1});
        room.players.forEach(function(p){try{p.ws.send(msg)}catch(e){}});
      }else{server.send(JSON.stringify({type:'WAITING',msg:'Room:'+roomId}));}
      server.addEventListener('message',function(event){
        try{var msg=JSON.parse(event.data);
          if(msg.type==='MOVE'){var row=msg.row,col=msg.col;
            if(room.status!=='PLAYING'||room.currentPlayer!==player.color||room.board[row][col]!==0)return;
            room.board[row][col]=player.color;room.moves.push({row:row,col:col,color:player.color});
            var winLine=checkWin(room.board,row,col,player.color);
            if(winLine){room.status='WIN';var m=JSON.stringify({type:'GAME_OVER',winner:player.color,winLine:winLine});room.players.forEach(function(p){try{p.ws.send(m)}catch(e){}});return;}
            if(room.moves.length===225){room.status='DRAW';var m2=JSON.stringify({type:'GAME_OVER',winner:null,winLine:[]});room.players.forEach(function(p){try{p.ws.send(m2)}catch(e){}});return;}
            room.currentPlayer=room.currentPlayer===1?2:1;var m3=JSON.stringify({type:'MOVE',row:row,col:col,color:player.color,currentPlayer:room.currentPlayer});room.players.forEach(function(p){try{p.ws.send(m3)}catch(e){}});}
          if(msg.type==='SURRENDER'){var winner=player.color===1?2:1;room.status='WIN';var m=JSON.stringify({type:'GAME_OVER',winner:winner,winLine:[],reason:'surrender'});room.players.forEach(function(p){try{p.ws.send(m)}catch(e){}});}
          if(msg.type==='DRAW_REQUEST'){var opp=room.players.find(function(p){return p.color!==player.color});if(opp)opp.ws.send(JSON.stringify({type:'DRAW_REQUEST'}));}
          if(msg.type==='DRAW_RESPONSE'){if(msg.accept){room.status='DRAW';var m=JSON.stringify({type:'GAME_OVER',winner:null,winLine:[],reason:'draw'});room.players.forEach(function(p){try{p.ws.send(m)}catch(e){}});}else{var req=room.players.find(function(p){return p.color!==player.color});if(req)req.ws.send(JSON.stringify({type:'DRAW_REJECTED'}));}}
          if(msg.type==='UNDO_REQUEST'){var opp=room.players.find(function(p){return p.color!==player.color});if(opp)opp.ws.send(JSON.stringify({type:'UNDO_REQUEST'}));}
          if(msg.type==='UNDO_RESPONSE'){if(msg.accept){for(var i=0;i<2&&room.moves.length>0;i++){var m=room.moves.pop();room.board[m.row][m.col]=0;}room.currentPlayer=1;var m2=JSON.stringify({type:'UNDO_EXECUTED',board:room.board,currentPlayer:room.currentPlayer});room.players.forEach(function(p){try{p.ws.send(m2)}catch(e){}});}else{var req=room.players.find(function(p){return p.color!==player.color});if(req)req.ws.send(JSON.stringify({type:'UNDO_REJECTED'}));}}
        }catch(e){}
      });
      server.addEventListener('close',function(){room.players=room.players.filter(function(p){return p.ws!==server});if(room.players.length===0)delete rooms[roomId];else{var m=JSON.stringify({type:'OPPONENT_LEFT'});room.players.forEach(function(p){try{p.ws.send(m)}catch(e){}});}});
      return new Response(null,{status:101,webSocket:client});
    }
    return new Response('Gomoku WS OK',{headers:{'Access-Control-Allow-Origin':'*'}});
  }
};