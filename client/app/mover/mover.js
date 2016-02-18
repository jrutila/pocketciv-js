var TribeMover = require('../../../src/phases/move').TribeMover;

function ClientMover()
{
    if (window.Worker)
    {
        this.worker = new Worker("moveworker.js")
        var self = this;
        // Handle return
        this.worker.onmessage = function(msg) {
            self.valid(msg.data);
        }
    } else {
        console.log("NO WORKER!! DANGER DANGER!")
        this.mover = undefined;
    }
    
}

ClientMover.prototype.reset = function(map, moveLimit, seaCost) {
    console.log("ClientMover reset");
    console.log(map, moveLimit, seaCost);
    if (this.worker)
        this.worker.postMessage({
            action: "reset",
            map: map,
            moveLimit: moveLimit,
            seaCost: seaCost
        });
    else
        this.mover = new TribeMover(map, moveLimit, seaCost);
}

ClientMover.prototype.init = function(start) {
    console.log("ClientMover init");
    console.log(start);
    if (this.worker)
        this.worker.postMessage({
            action: "init",
            start: start
        });
    else
        this.mover.init(start);
}

ClientMover.prototype.ok = function(target) {
    console.log("ClientMover ok check");
    console.log(target);
    if (this.worker)
        this.worker.postMessage({
            action: "ok",
            situation: target
        });
    else {
        var ok = this.mover.ok(target, this.valid);
        if (ok.ok != "stopped")
            this.valid(ok);
    }
}

ClientMover.prototype.terminate = function() {
    if (this.worker)
    {
        this.worker.terminate();
        delete this.worker;
    }
}

ClientMover.prototype.valid = function(valid) {
    console.log("ClientMover valid");
    console.log(valid);
}

module.exports = ClientMover;