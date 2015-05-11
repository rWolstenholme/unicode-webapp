var fs = require('fs'),
    xmlStream = require('xml-stream'),
    redis = require('redis');

function sendToDb(key, value){
    redClient.set(key, JSON.stringify(value), function (err, res) {
    });
}

var chars = [];

var dataStream = fs.createReadStream('ucd.all.flat.xml');
var xmlStream = new xmlStream(dataStream);

var redClient = redis.createClient();
redClient.on("error", function (err) {
    console.log("Error " + err);
});
console.log("Waiting for database connection");
redClient.on('connect', function() {
    console.log("Connected to database");
    parse();
});

var start = (new Date).getTime();
var count = 0;

function parse(){
    var aliases = [];

    xmlStream.preserve('char', true);
    xmlStream.collect('name-alias');
    xmlStream.on('endElement: char', function(ch){
        var charPoint = ch.$.cp;
        var char = {
            'name' : ch.$.na,
            'age' : ch.$.age,
            'block' : ch.$.blk,
            'generalCategory' : ch.$.gc,
            'combiningClass' : ch.$.ccc,
            'decompositionType' : ch.$.dt,
            'decompositionMapping' : ch.$.dm,
            'aliases' : aliases
        };
        chars.push(char)
        aliases = [];
        sendToDb(charPoint,char);
        //if(count%100==0) console.log("Parsed "+count+" at charpoint "+charPoint);
        count++;
    });
    xmlStream.on('endElement: name-alias', function(na){
        aliases.push({alias:na.$.alias,type:na.$.type});
    });
    xmlStream.on('end',function(){
        console.log("Parsing "+count+" elements complete in: "+(((new Date).getTime()-start))+"ms");
        process.exit(0);
    });
};