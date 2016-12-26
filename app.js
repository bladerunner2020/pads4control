var express = require('express');
var app = express();
var server = require('http').Server(app);

var MESSAGE_TIMEOUT = 15000;

var port = 8000;
console.log('Listening at port ' + port);
server.listen(port);

var vars = {
    button1: false,
    button2: false,
    button3: false
};

var message = {flag: false, text: ""};

app.use('/cp', express.static('cp'));

app.get('/json/message', function (req, res) {
    console.log("request");
    res.json({
        'flag' : message.flag,
        'text' : message.text,
        'emergency': false
    });
});


var io = require('socket.io')(server);
io.on('connection', function (socket) {
    console.log('Open connection ');
    io.emit(vars);

    socket.on('message', function (data) {
        console.log(data);
        message.text = data;
        message.flag = true;
        setTimeout(function() {message.flag = false; message.text = ""}, MESSAGE_TIMEOUT);
    });

    socket.on('vars', function(data){
        // console.log(data);
        for(var name in data){
            vars[name] = data[name];

        }
    })
});


