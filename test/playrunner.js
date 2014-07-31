var pocketciv = require("../core/pocketciv")
var playFile = process.argv[2];
var play = require("./plays/"+playFile)
var _ = require("underscore")
var expect = require("chai").expect

var engine = pocketciv.Engine;

engine.drawer = function(deck, done) {
    var card = engine.deck.draw(play.deck.shift());
    if (!card) throw "END"
    console.log(card)
    done.call(engine, card)
}

engine.areaChanger = function(changes, done) {
    console.log("CHANGE: ")
    console.log(changes);
    done.call(engine);
}

engine.mover = function(situation, done)
{
    var move = play.move.shift();
    if (!move) throw "END"
    done.call(engine, move);
}

engine.reducer = function(reducer, done) {
    var red = play.reduce.shift();
    if (!red) throw "END"
    done(reducer.ok(red));
}

engine.init(play.engine)

function check(final, chk, path) {
    if (!path) path = "";
    _.each(chk, function(v, k) {
        mpath = path + '-' + k;
        if (_.isObject(v))
            check(final[k], v, mpath);
        else
        {
            if (v[0] == "X")
                eval("expect(final[k], mpath)"+v.substring(1))
            else
                expect(final[k], mpath).to.equal(v);
        }
    })
}

try {
    
while(true)
{
    console.log('Start cycle')
    engine.populate();
    engine.move();
    engine.event();
    engine.support();
    engine.gold_decimate();
    engine.city_support();
    engine.upkeep();
}

} catch (e) {
    if (e == "END")
    {
        console.log('ENDED')
        check(engine, play.check);
    }
    else
        throw e
}