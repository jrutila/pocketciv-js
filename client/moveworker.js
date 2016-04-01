console.log("New Move Worker")
require = function() {};
module = {};
importScripts("move.js", "bower_components/underscore/underscore.js");

onmessage = function(msg) {
    self.mover = new module.exports.TribeMover(msg.data.map, msg.data.moveLimit, msg.data.seaCost);
    if (msg.data.start)
    {
        console.log("moveworker Init")
        self.mover.init(msg.data.start);
        self.postMessage({ "mover": self.mover});
        return;
    }
    if (msg.data.mover) {
        self.mover.start = msg.data.mover.start;
        self.mover.viaMap = msg.data.mover.viaMap;
        self.mover.neighbours = msg.data.mover.neighbours;
        self.mover.neighbours2 = msg.data.mover.neighbours2;
        self.mover.max = msg.data.mover.max;
        self.mover.ngh2 = msg.data.mover.ngh2;
    }
    
    if (msg.data.situation)
    {
        console.log("Checking for ok in Move Worker")
        var ok = self.mover.ok(msg.data.situation,
            function(ok) {
                // Found valid, not necessarily cheapest
                console.log("Ok",ok);
                postMessage(ok);
            }
        );
        //var millis = 2000;
        //var date = new Date();
        //var curDate = null;
        //do { curDate = new Date(); }
        ////while(curDate-date < millis);
        if (ok.ok != "stopped") {
            console.log("Calculated",ok);
            console.log("TODO: Cache this fastest one")
            postMessage(ok);
            postMessage("final");
        } else {
            console.log("Mover was stopped!")
        }
    }
}