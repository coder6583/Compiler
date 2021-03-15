const express = require('express');
const { exec } = require('node:child_process');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = 80;

app.use('/', express.static('/home/pi/compilerserver/Compiler/'));
app.get('/', (req, res) => {
  res.sendFile('/home/pi/compilerserver/Compiler/index.html');
});

io.on('connection', socket => {
  socket.on('compile', async input => {
    // コンパイル
    exec('./home/pi/compilerserver/Compiler/compiler3/compiler test.lang', (err, stdout, stderr) =>
    {
        if(err)
        {
            console.log('stderr: ${stderr}');
            return;
        }
        console.log(('stdout: ${stdout}'));
    }
    );

    // 出力
  })
});

app.listen(port, () => {
  console.log(`Compiler Server listening at http://rootlang.ddns.net`);
});
