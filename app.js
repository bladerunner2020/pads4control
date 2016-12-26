var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

var MESSAGE_TIMEOUT = 15000;

var port = 8000;
console.log('Listening at port ' + port);
server.listen(port);

var vars = {
    button1: false,
    button2: false,
    button3: false
};

var message = {flag: false, text: "", emergency: false};

app.use('/cp', express.static('cp'));

app.get('/json/message', function (req, res) {
    var text = message.text;
    var emergency = false;
    if (vars.button1 || vars.button2 || vars.button3) {
        emergency = true;
        if (vars.button1)
            text = "Просьба покинуть здание.";
        if (vars.button2)
            text = "Экстренное сообщени 2.";
        if (vars.button3)
            text = "Экстренное сообщени 3.";

        message.flag = true;

        setTimeout(function(){
            message.flag = false;
            vars.button1 = false;
            vars.button2 = false;
            vars.button3 = false;
            io.emit('vars', vars);
        }, MESSAGE_TIMEOUT);
    }
    
    
    console.log("request");
    res.json({
        'flag' : message.flag,
        'text' : text,
        'emergency': emergency
    });
});

app.get('/json/data', function (req, res) {
    console.log("request");
    res.json(vars);
});



io.on('connection', function (socket) {
    console.log('Open connection ');
    io.emit('vars', vars);

    socket.on('message', function (data) {
        console.log(data);
        message.text = data;
        message.flag = true;
        setTimeout(function() {message.flag = false; message.text = ""}, MESSAGE_TIMEOUT);
    });

    socket.on('vars', function(data){
        console.log(data);
        for(var name in data){
            vars[name] = data[name];

        }
    })
});


