function toggleDisp(){
    var txt = document.getElementById('asText');
    var box = document.getElementById('asBoxed');
    if (txt.style.display == 'none') {
        box.style.display = 'none';
        txt.style.display = 'block';
    }
    else {
        txt.style.display = 'none';
        box.style.display = 'block';
    }
}
