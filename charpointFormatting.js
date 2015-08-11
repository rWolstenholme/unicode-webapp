module.exports.jsToDb = function jsToDb(js){
    var db = js.charCodeAt(0).toString(16).toUpperCase();
    if (db.length<4) { db = ("000"+db).slice(-4); }
    return db;
};

module.exports.dbToJs = function dbToJs(db){
    js = parseInt('0x'+db);
    return js;
};

module.exports.dbToChar = function dbToChar(db){
    js = parseInt('0x'+db);
    return String.fromCharCode(js);
};

module.exports.charToDb = function charToDb(char) {
    var cp = char.charCodeAt(0);
    var db = cp.toString(16).toUpperCase();
    if (db.length < 4) {
        db = ("000" + db).slice(-4);
    }
    return db;
};

module.exports.decToDb = function decToDb(num){
    var db = num.toString(16).toUpperCase();
    if (db.length < 4) {
        db = ("000" + db).slice(-4);
    }
    return db;
}