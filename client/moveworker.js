console.log("Init Move Worker")
require = function() {};
module = {};
importScripts("move.js", "bower_components/underscore/underscore.js");

onmessage = function(msg) {
    var action = msg.data.action;
    if (action == "create")
    {
        self.mover = new module.exports.TribeMover(msg.data.map, msg.data.moveLimit, msg.data.seaCost);
        console.log("Inited TribeMover")
    } else if (action == "init") {
        self.mover.init(msg.data.start);
        console.log("Start set");
    } else if (action == "ok") {
        var handled = false;
        var ok = self.mover.ok(msg.data.situation,
        function(ok) {
            // Failed fast
            handled = true;
            !handled && postMessage({ ok: false });
        });
        //var millis = 2000;
        //var date = new Date();
        //var curDate = null;
        //do { curDate = new Date(); }
        ////while(curDate-date < millis);
        console.log("Calculated!");
        !handled && postMessage(ok);
    }
}