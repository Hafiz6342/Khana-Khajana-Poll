const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static('public'));

const labels = ['Sohel','Sahil kim','Sahil surat','Saif','Babu','Javed','Rizwan','Hafiz','Fajal','Faizal','Sameer'];
let votes = labels.map(() => 0);
let userVotes = {};

io.on('connection', (socket) => {
  socket.emit('initial', { votes, userVotes });
  socket.on('vote', (index) => {
    if (typeof index !== 'number' || index < 0 || index >= labels.length) return;
    const old = userVotes[socket.id];
    if (old !== undefined && old !== null && votes[old] > 0) votes[old]--;
    votes[index] = (votes[index] || 0) + 1;
    userVotes[socket.id] = index;
    io.emit('update', { votes, userVotes });
  });
  socket.on('disconnect', () => {
    const old = userVotes[socket.id];
    if (old !== undefined && old !== null && votes[old] > 0) votes[old]--;
    delete userVotes[socket.id];
    io.emit('update', { votes, userVotes });
  });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => console.log('Running'));
