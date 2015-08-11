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