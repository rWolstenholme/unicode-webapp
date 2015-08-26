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

function addGraphs(){
    addPie("Code Point Ages", "ages");
    addPie("Block Names", "blocks");
    addBar("Bytes to Encode", "sizes")
}

function addPie(title, data){
    c3.generate({
        bindto: '#'+data,
        data: {
            columns: toGraph[data] ,
            type : 'donut'
        },
        donut: {
            title: title
        }
    });
}

function addBar(title, data){
    c3.generate({
        bindto: '#'+data,
        data: {
            columns: toGraph[data],
            type: 'bar'
        },
        bar: {
            title: title
        },
        axis: {
            x: {
                show: false,
                padding: 0
            },
            y:{
                tick: {
                    format: function(d){return d + "B"}
                }
            },
            rotated: true
        },
        tooltip: {
            grouped: false,
            format:{
                title: function () { return 'Bytes to encode'}
            }
        }
    });
}

addGraphs();