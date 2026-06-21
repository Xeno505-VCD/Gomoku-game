import http from 'http';
import { WebSocketServer } from 'ws';
import nodemailer from 'nodemailer';

const server = http.createServer(async (req, res) => {
  // CORS 预检
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    res.end();
    return;
  }

  res.setHeader('Access-Control-Allow-Origin', '*');

  // 反馈端点
  if (req.method === 'POST' && req.url === '/api/feedback') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const { message } = JSON.parse(body);
        if (!message) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: '消息不能为空' }));
          return;
        }
        // 通过 Gmail SMTP 发送到管理员邮箱
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: 'xinshangsun714@gmail.com',
            pass: process.env.GMAIL_APP_PASSWORD || '',
          },
        });
        if (!process.env.GMAIL_APP_PASSWORD) {
          // 如果没有配置密码，仅记录到控制台
          console.log('[反馈]', new Date().toISOString(), message);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: true, note: 'logged to console' }));
          return;
        }
        await transporter.sendMail({
          from: 'xinshangsun714@gmail.com',
          to: 'xinshangsun714@gmail.com',
          subject: '🏠 五子棋反馈',
          text: `来自五子棋页面的反馈：\n\n${message}\n\n时间：${new Date().toISOString()}`,
        });
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true }));
      } catch (e) {
        console.error('反馈发送失败:', e.message);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: '发送失败' }));
      }
    });
    return;
  }

  if (req.url === '/create') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    const roomId = String(Math.floor(1000 + Math.random() * 9000));
    res.end(JSON.stringify({ roomId }));
  } else {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true }));
  }
});

const wss = new WebSocketServer({ server });
const rooms = {};

function initBoard() {
  return Array(15).fill(null).map(() => Array(15).fill(0));
}

function checkWin(board, row, col, color) {
  const dirs = [[0,1],[1,0],[1,1],[1,-1]];
  for (const [dr, dc] of dirs) {
    const line = [{ row, col }];
    let r = row + dr, c = col + dc;
    while (r >= 0 && r < 15 && c >= 0 && c < 15 && board[r][c] === color) { line.push({ row: r, col: c }); r += dr; c += dc; }
    r = row - dr; c = col - dc;
    while (r >= 0 && r < 15 && c >= 0 && c < 15 && board[r][c] === color) { line.unshift({ row: r, col: c }); r -= dr; c -= dc; }
    if (line.length >= 5) return line;
  }
  return null;
}

function broadcast(room, data) {
  const msg = JSON.stringify(data);
  room.players.forEach(p => { try { p.ws.send(msg); } catch(e) {} });
}

wss.on('connection', (ws, req) => {
  const url = new URL(req.url, 'http://localhost');
  const roomId = url.searchParams.get('room') || '0000';
  if (!rooms[roomId]) {
    rooms[roomId] = { players: [], board: initBoard(), currentPlayer: 1, moves: [], status: 'PLAYING' };
  }
  const room = rooms[roomId];

  if (room.players.length >= 2) {
    ws.send(JSON.stringify({ type: 'FULL' }));
    ws.close();
    return;
  }

  const color = room.players.length === 0 ? 1 : 2;
  const player = { color, ws };
  room.players.push(player);
  ws.send(JSON.stringify({ type: 'ASSIGN', color, roomId }));

  if (room.players.length === 2) {
    broadcast(room, { type: 'GAME_START', board: room.board, currentPlayer: 1 });
  } else {
    ws.send(JSON.stringify({ type: 'WAITING', msg: 'Room:' + roomId }));
  }

  ws.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw.toString());
      if (msg.type === 'ping') return;

      if (msg.type === 'MOVE') {
        const { row, col } = msg;
        if (room.status !== 'PLAYING' || room.currentPlayer !== player.color || room.board[row][col] !== 0) return;
        room.board[row][col] = player.color;
        room.moves.push({ row, col, color: player.color });
        const winLine = checkWin(room.board, row, col, player.color);
        if (winLine) {
          room.status = 'WIN';
          broadcast(room, { type: 'GAME_OVER', winner: player.color, winLine });
          return;
        }
        if (room.moves.length === 225) {
          room.status = 'DRAW';
          broadcast(room, { type: 'GAME_OVER', winner: null, winLine: [] });
          return;
        }
        room.currentPlayer = room.currentPlayer === 1 ? 2 : 1;
        broadcast(room, { type: 'MOVE', row, col, color: player.color, currentPlayer: room.currentPlayer });
      }
      if (msg.type === 'SURRENDER') {
        const winner = player.color === 1 ? 2 : 1;
        room.status = 'WIN';
        broadcast(room, { type: 'GAME_OVER', winner, winLine: [], reason: 'surrender' });
      }
      if (msg.type === 'DRAW_REQUEST') {
        const opp = room.players.find(p => p.color !== player.color);
        if (opp) opp.ws.send(JSON.stringify({ type: 'DRAW_REQUEST' }));
      }
      if (msg.type === 'DRAW_RESPONSE') {
        if (msg.accept) {
          room.status = 'DRAW';
          broadcast(room, { type: 'GAME_OVER', winner: null, winLine: [], reason: 'draw' });
        } else {
          const req = room.players.find(p => p.color !== player.color);
          if (req) req.ws.send(JSON.stringify({ type: 'DRAW_REJECTED' }));
        }
      }
      if (msg.type === 'UNDO_REQUEST') {
        const opp = room.players.find(p => p.color !== player.color);
        if (opp) opp.ws.send(JSON.stringify({ type: 'UNDO_REQUEST' }));
      }
      if (msg.type === 'UNDO_RESPONSE') {
        if (msg.accept) {
          for (let i = 0; i < 2 && room.moves.length > 0; i++) {
            const m = room.moves.pop();
            room.board[m.row][m.col] = 0;
          }
          room.currentPlayer = 1;
          broadcast(room, { type: 'UNDO_EXECUTED', board: room.board, currentPlayer: room.currentPlayer, moves: room.moves });
        } else {
          const req = room.players.find(p => p.color !== player.color);
          if (req) req.ws.send(JSON.stringify({ type: 'UNDO_REJECTED' }));
        }
      }
      // 再来一局
      if (msg.type === 'REMATCH_REQUEST') {
        const opp = room.players.find(p => p.color !== player.color);
        if (opp) opp.ws.send(JSON.stringify({ type: 'REMATCH_REQUEST' }));
      }
      if (msg.type === 'REMATCH_RESPONSE') {
        if (msg.accept) {
          // 重置棋盘
          room.board = initBoard();
          room.moves = [];
          room.currentPlayer = 1;
          room.status = 'PLAYING';
          broadcast(room, { type: 'REMATCH_START' });
        } else {
          const req = room.players.find(p => p.color !== player.color);
          if (req) req.ws.send(JSON.stringify({ type: 'REMATCH_REJECTED' }));
        }
      }
    } catch(e) {}
  });

  ws.on('close', () => {
    room.players = room.players.filter(p => p.ws !== ws);
    if (room.players.length === 0) {
      delete rooms[roomId];
    } else {
      broadcast(room, { type: 'OPPONENT_LEFT' });
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log('Gomoku WS Server on port ' + PORT));