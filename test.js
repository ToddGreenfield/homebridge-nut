var Nut = require('node-nut');
var _ = require('underscore');

oNut = new Nut(3493, 'localhost');

oNut.on('error', function(err) {
	console.log('There was an error: ' + err);
});

oNut.on('close', function() {
	console.log('Connection closed.');
});

oNut.on('ready', function() {
	self = this;
	var ups, upsFull;
        oNut.GetUPSList(function(upslist) {
                ups = _.keys(upslist);
		upsFull = upslist;
        })
	setTimeout(function() {
		console.log(upsFull);
		getVars(ups);
	}, 1000);
});

function getVars (ups) {
var upsvars;
        oNut.GetUPSVars(ups, function(upsvars) {
                console.log(upsvars);
                var obj = _.keys(upsvars);
                for (prop in obj) {
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
	self.close();
	return upsvars; 
        })

}

oNut.start();
