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

var timer = 0;


app.use('/cp', express.static('cp'));

app.get('/json/message', function (req, res) {
    var text = message.text;
    var emergency = false;
    if (vars.button1 || vars.button2 || vars.button3) {
        emergency = true;
        if (vars.button1)
            text = "Просьба покинуть здание.";
        if (vars.button2)
            text = "Экстренное сообщени 1.";
        if (vars.button3)
            text = "Экстренное сообщени 2.";

        message.flag = true;
        
        if (timer) 
            clearTimeout(timer);

        timer = setTimeout(function(){
            timer = 0;
            message.flag = false;
            vars.button1 = false;
            vars.button2 = false;
            vars.button3 = false;
            io.emit('vars', vars);
            
        }, MESSAGE_TIMEOUT);
    }
    
    
    // console.log("request");
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

app.get('/json/set', function (req, res){
    var button1 = req.query.button1;
    var button2 = req.query.button2;
    var button3 = req.query.button3;

    console.log('buttons = %d, %d, %d', button1, button2, button3);

    res.writeHead(200, {'content-type': 'text/plain'});
    res.end('Done.');

    if (!isNaN(button1)) {
        vars["button1"] = (button1 > 0);
    }

    if (!isNaN(button2)) {
        vars["button2"] = (button2 > 0);
    }

    if (!isNaN(button3)) {
        vars["button3"] = (button3 > 0);
    }


    io.emit('vars', vars); // refresh GUI

});




io.on('connection', function (socket) {
    console.log('Open connection ');
    io.emit('vars', vars);

    socket.on('message', function (data) {
        console.log(data);
        message.text = data;
        message.flag = true;
        vars.button1 = false;
        vars.button2 = false;
        vars.button3 = false;
        io.emit('vars', vars);


        if (timer)
            clearTimeout(timer);
        timer = setTimeout(function() {
            message.flag = false; 
            message.text = ""; 
            message.emergency = false;
            timer = 0;
        }, MESSAGE_TIMEOUT);
    });

    socket.on('vars', function(data){
        console.log(data);

        var name_found = '';
        var value_found = false;
        for(var name in data){
            vars[name] = data[name];
            name_found = name;
            value_found = data[name];
        }

        for (var name in vars) {
            if (name != name_found)
                vars[name] = false;
        }

        if (!value_found && timer) {
            message.flag = false;
            clearTimeout(timer);
            timer = 0;
        }

        io.emit('vars', vars);

    })
});





