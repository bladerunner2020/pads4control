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
        'text' : message.text
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


///// *************

JSON.Parse = JSON.parse;
JSON.Stringify = JSON.stringify;
var Debug = console.log;

function iDate() {
    this.hours = 0;
    this.minutes = 0;


    switch (arguments.length) {
        case 0:
            var d = new Date();
            this.hours = d.getHours();
            this.minutes = d.getMinutes();
            break;
        case 1:
            var value = arguments[0];
            value = value - Math.floor(value);
            this.hours = Math.floor(value*24);
            this.minutes = Math.floor((value*24 - this.hours)*60);
            break;
        case 3:
            // this.day =
            // this.month =
        case 5:
            this.hours = arguments[3];
            this.minutes = arguments[4];
        case 6:
            // this.seconds
            break;
    }

}


var TimeTable_30_chemistry =
{starttime: "08:30", endtime: "22:30", room: 30, timetable: [
    {starttime: "08:30", endtime: "09:15", type: "lesson", class_number: "9Б", subject: "Реакции ионного обмена"},
    {starttime: "09:25", endtime: "10:10", type: "lesson", class_number: "8A", subject: "Относительная молекулярная масса вещества. Закон Авогадро"},
    {starttime: "10:30", endtime: "11:15", type: "lesson", class_number: "10А", subject: "Генетические связи углеводородов"},
    {starttime: "11:35", endtime: "12:20", type: "lesson", class_number: "8Б", subject: "Валентность химических элементов"},
    {starttime: "12:35", endtime: "13:20", type: "lesson", class_number: "9А", subject: "Физические свойства веществ с различным типом связи"},
    {starttime: "13:30", endtime: "14:15", type: "lesson", class_number: "10Б", subject: "Нефть и продукты ее переработки"}
]};

ExpandTimeTable(TimeTable_30_chemistry);


function TimeStringToiDate(str) {
    var indx = str.indexOf(":");
    var h = parseInt(str.substring(0,indx), 10);
    var m = parseInt(str.substring(indx+1,str.length), 10);

    return new iDate(1, 1, 2000, h, m);
}


function MyTime() {

    this._date = {};

    if (arguments.length > 0) {
        if (typeof(arguments[0]) == "string") {
            var str = arguments[0];
            var indx = str.indexOf(":");

            this._date.minutes = parseInt(str.substring(indx+1,str.length), 10);;
            this._date.hours = parseInt(str.substring(0,indx), 10);
        }
    } else {
        var d = new iDate(); // текущая дата
        this._date.minutes = d.minutes;
        this._date.hours = d.hours;
    }

    var that = this;

    this.AddMinutes = function(min) {
        var m = that._date.minutes + min;
        var minutes = that._date.minutes;
        var hours = that._date.hours;

        minutes = m % 60;
        hours +=  (m - m % 60)/60;

        if (minutes < 0) {
            minutes += 60;
            hours--;
        }

        that._date.hours = hours;
        that._date.minutes = minutes;
    };

    

    this.toMinutes = function() {
        return that._date.hours*60 + that._date.minutes;
    };

    this.Difference = function(time) {
        var sign = false;
        var time1 = time;
        var time2 = new MyTime(that.toString());

        if (time2.toMinutes() < time1.toMinutes()) {
            sing = true;
            time1 = time2;
            time2 = new MyTime(time.toString());
        }

        var min = time1.toMinutes();
        time2.AddMinutes(-min);
        return time2;
    };

    this.toString = function() {
        var h = that._date.hours;
        var m = that._date.minutes;
        if (m < 10) m = '0' + m;
        return h + ":" + m;
    };

    this.IsBefore = function(time) {
        var new_time = time;

        if (typeof(time) == "string")
            new_time = new MyTime(time);

        return that.toMinutes() < new_time.toMinutes();
    };

    this.IsAfter = function(time) {
        var new_time = time;

        if (typeof(time) == "string")
            new_time = new MyTime(time);

        return that.toMinutes() > new_time.toMinutes();
    };

    /**
     * @return {boolean}
     */
    this.IsInRange = function(time1, time2){
        var t1 = time1;
        var t2 = time2;

        if (typeof(t1) == "string")
            t1 = new MyTime(t1);
        if (typeof(t2) == "string")
            t2 = new MyTime(t2);


        var min = that.toMinutes();
        return (min >= t1.toMinutes() && (min < t2.toMinutes()));
    };
}


function ExpandTimeTable(data) {
    var EndOfLessons = new MyTime(data.endtime);
    var BeginOfLessons = new MyTime(data.starttime);
    var table = data.timetable;
    var t_length = table.length;

    var index = t_length;
    var BeginOfBlock = new MyTime(table[t_length-1].endtime);

    var BlockDurationInMinutes = BeginOfBlock.toMinutes() - BeginOfLessons.toMinutes() + 20;
    var MinutesToAdd =0;

    while (true) {
        index++;
        if(index >= t_length) {
            MinutesToAdd += BlockDurationInMinutes;

            index = 0;
        }
        var t1 = new MyTime(table[index].starttime);
        var t2 = new MyTime(table[index].endtime);
        t1.AddMinutes(MinutesToAdd);
        t2.AddMinutes(MinutesToAdd);

        var entry = JSON.Parse(JSON.Stringify(table[index]));
        entry.starttime = t1.toString();
        entry.endtime = t2.toString();

        if (t2.toMinutes() > EndOfLessons.toMinutes()) break;
        table.push(entry);
    }
}

function GetNextLesson(data, shift_index) {
    var current = new MyTime();
    var table = data.timetable;

    var previous_end = table[0].endtime;

    for (var i = 0; i< table.length;i++) {
        var end_t = table[i].endtime;

        if (current.IsInRange(previous_end, end_t)) {
            if ((i + shift_index) < table.length) {
                var entry = table[i + shift_index];
                entry.id = i + shift_index + 1;
                return entry;
            }

            break;
        }
        previous_end = end_t;
    }
}




/**
 * @return {boolean}
 */
function IsBreak(data) {
    var current = new MyTime();

    var lesson = GetNextLesson(data, 0);
    if (lesson) return false;

    return (current.IsInRange(data.starttime, data.endtime));
}

/**
 * @return {boolean}
 */
function IsLesson(data) {
    var current = new MyTime("16:19");
    var table = data.timetable;

    for (var i = 0; i< table.length;i++) {
        var start_t = table[i].starttime;
        var end_t = table[i].endtime;

        if (current.IsInRange(start_t, end_t)) return true;
    }

    return false;
}

function PrintTable(data) {
    var current = new MyTime();
    var table = data.timetable;

    for (var i = 0; i< table.length;i++) {
        var start_t = table[i].starttime;
        var end_t = table[i].endtime;

        Debug("Lesson #" + (i + 1) +" " + start_t + " - " + end_t + " " + table[i].subject);
    }
}


var time1 = new MyTime("16:09");
var time2 = new MyTime("16:15");

var diff = time2.Difference(time1);

console.log(time2.toString() +" - " + time1.toString() + " = " +diff.toString());

var diff = time1.Difference(time2);

console.log(diff.toString());

console.log("time2 is before time1? = " + time2.IsBefore(time1));
console.log("time2 is after time1? = " + time2.IsAfter(time1));
console.log("time2 is before 23:30? = " + time2.IsBefore("23:30"));



var next = GetNextLesson(TimeTable_30_chemistry, 0);


// PrintTable(TimeTable_30_chemistry);

