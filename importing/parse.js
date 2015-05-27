var fs = require('fs'),
    xmlStream = require('xml-stream'),
    redis = require('redis'),
    zlib = require('zlib'),
    cpf = require('../charpointFormatting.js');

var zippedName = 'ucd.all.flat.zip';
var unzippedName = 'ucd.all.flat.xml';

//prepareFiles();
prepareParse();

function prepareFiles(){
    fs.exists(unzippedName,function(err, exists) {
        if (!exists) {
            var gunzip = zlib.createGunzip();
            var inp = fs.createReadStream(zippedName);
            var out = fs.createWriteStream(unzippedName);
            inp.pipe(gunzip)
                .pipe(out)
                .on('end', function () {
                    prepareParse()
                });
        }
        else{
            prepareParse();
        }
    });
}

function prepareParse(){
    var redClient = redis.createClient();
    redClient.on("error", function (err) {
        console.log("Error " + err);
    });
    console.log("Waiting for database connection");
    redClient.on('connect', function() {
        console.log("Connected to database");
        parse(redClient);
    });
}

function parse(redClient){
    var xmlStr = new xmlStream(fs.createReadStream(unzippedName));

    var start = (new Date).getTime();
    var count = 0;

    var chars = [];
    var aliases = [];

    xmlStr.preserve('char', true);
    xmlStr.collect('name-alias');
    xmlStr.on('endElement: char', function(ch){
        var charPoint = ch.$.cp;
        var char = {
            'Character' : cpf.dbToChar(ch.$.cp),
            'Character Point' : ch.$.cp,
            'Name' : ch.$.na,
            'Age' : ch.$.age,
            'Block Name' : ch.$.blk,
            'General Catagory' : ch.$.gc,
            'Combining Class' : ch.$.ccc,
            'Decomposition Type' : ch.$.dt,
            'Decomposition Mapping' : ch.$.dm,
            'Grapheme Base' : ch.$.Gr_Base,
            'Grapheme Extended' : ch.$.Gr_Ext,
            'Aliases' : JSON.stringify(aliases)
        };
        chars.push(char)
        aliases = [];
        redClient.set(charPoint, JSON.stringify(char));
        if(count%100==0) console.log("Parsed "+count+" at charpoint "+charPoint);
        count++;
    });
    xmlStr.on('endElement: name-alias', function(na){
        aliases.push({alias:na.$.alias,type:na.$.type});
    });
    xmlStr.on('end',function(){
        console.log("Parsing "+count+" elements complete in: "+(((new Date).getTime()-start))+"ms");
        process.exit(0);
    });
};