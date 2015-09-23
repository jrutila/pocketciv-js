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
        var ok = self.mover.ok(msg.data.situation);
        console.log("Calculated!");
        console.log(ok);
        postMessage(ok);
    }
}