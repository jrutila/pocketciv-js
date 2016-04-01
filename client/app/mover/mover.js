var TribeMover = require('../../../src/phases/move').TribeMover;

function ClientMover()
{
    if (window.Worker)
    {
        this.worker = new Worker("moveworker.js")
        this.workers = [];
        var self = this;
        // Handle return
        this.worker.onmessage = function(msg) {
            if (msg.data.mover) {
                console.log("Got mover",msg.data.mover)
                self.mover = msg.data.mover;
                
            }
            else if (msg.data != "final")
                self.valid(msg.data);
            else
                console.log("FINALIZED!!")
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
    {
        this.map = map;
        this.moveLimit = moveLimit;
        this.seaCost = seaCost;
    }
    else
        this.mover = new TribeMover(map, moveLimit, seaCost);
}

ClientMover.prototype.init = function(start) {
    console.log("ClientMover init");
    console.log(start);
    if (this.worker)
        this.worker.postMessage({
            start: start,
            map: this.map,
            moveLimit: this.moveLimit,
            seaCost: this.seaCost
        });
    else
        this.mover.init(start);
}

ClientMover.prototype.latest_valid = function(worker, ok)
{
    if (worker == this.workers[this.workers.length-1])
        this.valid(ok);
    else
        console.log("WARN: got valid from worker that is not the latest one");
}

ClientMover.prototype.add_worker = function(worker)
{
    var workers = this.workers;
    workers.push(worker);
    if (workers.length >= 2)
        setTimeout(function() {
            while(workers.length > 2)
                workers.shift().terminate();
        },0);
}

ClientMover.prototype.ok = function(target) {
    console.log("ClientMover ok check");
    console.log(target);
    if (this.worker)
    {
        var self = this;
        var prevWorker = this.worker;
        prevWorker.onmessage = function(msg) {
            if (msg.data != "final")
                self.latest_valid(this, msg.data);
            else
            {
                self.workers.splice(self.workers.indexOf(prevWorker),1);
                console.log("FINALIZED!!")
                console.log(self.workers)
            }
        }
        prevWorker.postMessage({
            map: this.map,
            moveLimit: this.moveLimit,
            seaCost: this.seaCost,
            situation: target,
            mover: this.mover
        });
        self.add_worker(prevWorker);
        this.worker = new Worker("moveworker.js")
        this.worker.postMessage({
            map: this.map,
            moveLimit: this.moveLimit,
            seaCost: this.seaCost,
            mover: this.mover
        });
        console.log(self.workers)
    }
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