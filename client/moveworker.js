console.log("Init Move Worker")
require = function() {};
module = {};
importScripts("move.js", "bower_components/underscore/underscore.js");

onmessage = function(msg) {
    var action = msg.data.action;
    if (action == "reset")
    {
        self.mover = new module.exports.TribeMover(msg.data.map, msg.data.moveLimit, msg.data.seaCost);
        console.log("Reseted TribeMover")
    } else if (action == "init") {
        self.mover.init(msg.data.start);
        console.log("Init start set",msg.data.start);
    } else if (action == "ok") {
        self.mover.stop();
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
        } else {
            console.log("Mover was stopped!")
        }
    }
}