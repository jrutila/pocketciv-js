var eventRunner = require('../../src/core/event')
var pocketciv = require('../../src/core/pocketciv')
var PhaseContext = require('../../src/core/context').Context;

var engine = undefined;
var runEvent = eventRunner.runEvent;
var done = undefined; //function() { throw "Nomplemented"; };
var notok = undefined;
var deck = [];
var reduce = [];

var getContext = function(state) {
    engine = new pocketciv.EngineBuild();
    state && engine.init(state);
    
    engine.drawer = function(dde, done) { console.log(deck); done(deck.shift()) }
    engine.reducer = function(rdc, done) {
        console.log(rdc.opts);
        var r = reduce.shift();
        var ok = rdc.ok(r);
        ctx.ok = ok;
        done(ok);
    }
    
    var ctx = new PhaseContext(engine);
    ctx.done = function() {
        if (this.ok.ok)
            if (done)
                done.call(this, this.ok);
            else
                throw "WasOK";
        else {
            if (notok)
                notok.call(this, this.ok);
            else
                throw "NotOK";
        }
        //done.call(this);
    };
    return ctx;
}

module.exports = {
    done: function(newdone) {
        done = newdone;
    },
    notok: function(newnotok) {
        notok = newnotok;
    },
    deck: deck,
    reduce: reduce,
    engine: engine,
    runEvent: function(event, ev, state) {
        var ctx = getContext(state)
        runEvent(engine, event, ev, ctx)
    }
}