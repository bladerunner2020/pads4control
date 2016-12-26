
//Данные с сервера
var listGroup = $('.list-group-item');
var panelHeading = $('.panel-heading');
var vars = {};

listGroup.each(function(i, item){
    var name = $(item).data('var');
    vars[name] = $(item);
});

panelHeading.each(function(i, item){
    var name = $(item).data('var');
    if(name){
        vars[name] = $(item);
    }
});

function setVars(data){
    for(var name in data){
        var $var = $(vars[name]);

        if(data[name]){
            if($var.hasClass('list-group-item')){
                $var.addClass('selected');
                checkAll($var);
            }else{
                $var.parent().addClass('panel-warning');
                //checkAll($var);
            }
        }else{
            if($var.hasClass('list-group-item')){
                $var.removeClass('selected');
                checkAll($var);
            }else{
                $var.parent().removeClass('panel-warning');
                //checkAll($var);
            }
        }
    }
}

// Данные с клиента
$('.list-group-item').click(function(){
    $this = $(this);

    var data = {};
    var name = $this.data('var');

    if($this.hasClass('selected')){
        $this.removeClass('selected');
        data[name] = false;
    }else{
        $this.addClass('selected');
        data[name] = true;
    }

    checkAll($this);

    socket.emit('vars', data);
});

$('.panel-heading').click(function(){
    $this = $(this);
    var name = $(this).data('var');
    var data = {};
    var light = true;

    if($this.parent().hasClass('panel-warning')){
        $this.parent().removeClass('panel-warning');
        light = false;
    }else{
        $this.parent().addClass('panel-warning');
        light = true;
    }

    if(!name){
        var vars = $this.next().children();

        vars.each(function(i, item){
            var $item = $(item);
            var name = $(item).data('var');
            if(light){
                $item.addClass('selected');
            }else{
                $item.removeClass('selected');
            }
            data[name] = light;
        })
    }else{
        data[name] = light;
    }
    socket.emit('vars', data);
});


function checkAll($list){
    var $panel = $list.parents('.panel');

    var lists = $panel.find('.list-group-item');
    var all = true;


    lists.each(function(i, item){
        if(!$(item).hasClass('selected')){
            if($panel.hasClass('selected')){
                $panel.removeClass('selected');
            }
            all = false;
            return false;
        }
    });

    if(all){
        $panel.addClass('panel-warning');
    }else{
        $panel.removeClass('panel-warning');
    }
}

var server_address = 'http://' + window.location.host;
var socket = io.connect(server_address);
console.log('client is connecting + '+ server_address );

socket.on('vars', function (data) {
    setVars(data);
});

socket.on('time_on', function (data) {
    if ((document != null) && (document.getElementById('time_on') != null)) {
        console.log('Aquarium time on = ', data);
        document.getElementById('time_on').value = data;
    }
});

socket.on('message', function (data) {
    if ((document != null) && (document.getElementById('message') != null)) {
        console.log('Message = ', data);
        document.getElementById('Message').value = data;
    }
});

$('textarea[name=message]').change(function() {
    var data = document.getElementById('message').value;

    socket.emit('message', data);
    console.log('Message = ', data);
});




