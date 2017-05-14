var Nut = require('node-nut');

oNut = new Nut(3493, 'localhost');

oNut.on('error', function(err) {
    console.log('There was an error: ' + err);
});

oNut.on('close', function() {
    console.log('Connection closed.');
});

oNut.on('ready', function() {
    oNut.GetUPSList(function(upslist, err) {
        if (err) {
            console.log('ERROR ' + err);
        }
        else {
            var ups = Object.keys(upslist);
            console.log(upslist);
            getVars(ups);
        }
    });
});

function getVars(ups) {
    if (!ups.length) {
        oNut.close();
        console.log('DONE');
        return;
    }
    var currentUps = ups.shift();
    oNut.GetUPSVars(currentUps, function(upsvars, err) {
        if (err) {
            console.log('ERROR ' + err);
            self.close();
        }
        else {
            console.log('UPS ' + currentUps);
            console.log(upsvars);
            var obj = Object.keys(upsvars);
            for (var prop in obj) {
                switch(obj[prop]) {
                    case "device.mfr":
                        console.log("Nut eventVar device.mfr received is %s: ", upsvars["device.mfr"]);
                        break;
                    case "device.model":
                        console.log("Nut eventVar device.model received is %s: ", upsvars["device.model"]);
                        break;
                    case "ups.productid":
                        console.log("Nut eventVar ups.productid received is %s: ", upsvars["ups.productid"]);
                        break;
                }
            }
            getVars(ups);
        }
    });
}

oNut.start();
