var eventRunner = require('../../src/core/event')
var pocketciv = require('../../src/core/pocketciv')
var PhaseContext = require('../../src/core/context').Context;

var engine = undefined;
var runEvent = eventRunner.runEvent;
var done = function() { throw "Nomplemented"; };
var deck = [];
var reduce = [];

var getContext = function(state) {
    engine = new pocketciv.EngineBuild();
    state && engine.init(state);
    
    engine.drawer = function(dde, done) { done(deck.shift()) }
    engine.reducer = function(rdc, done) {
        var r = reduce.shift();
        var ok = rdc.ok(r);
        if (ok.ok)
            done(ok);
        else {
            throw "NotOK";
        }
    }
    
    var ctx = new PhaseContext(engine);
    ctx.done = function() {
        done.call(this);
    };
    return ctx;
}

module.exports = {
    done: function(newdone) {
        done = newdone;
    },
    deck: deck,
    reduce: reduce,
    engine: engine,
    runEvent: function(event, ev, state) {
        var ctx = getContext(state)
        runEvent(engine, event, ev, ctx)
    }
}