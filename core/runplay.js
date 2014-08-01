var _ = require("underscore")

module.exports = {
    run: function(engine, play, done) {

        var old = {
            'drawer': engine.drawer,
            'areaChanger': engine.areaChanger,
            'areaSelector': engine.areaSelector,
            'reducer': engine.reducer,
            'mover': engine.mover,
        }
        engine.drawer = function(deck, done) {
            var id = play.deck.shift();
            if (!id) {
                old['drawer'](deck, done)
                throw "END"
            }
            var card = engine.deck.draw(id);
            console.log(card)
            done.call(engine, card)
        }

        engine.areaChanger = function(changes, done) {
            console.log("CHANGE: ")
            console.log(changes);
            done.call(engine);
        }

        engine.areaSelector = function(possibleAreas, done) {
            var id = play.areas.shift();
            if (!id) {
                old['areaSelector'](possibleAreas, done)
                throw "END"
            }
            done(possibleAreas[id])
        }

        engine.mover = function(situation, done) {
            var move = play.move.shift();
            if (!move) {
                old['mover'](situation, done)
                throw "END"
            }
            console.log(move)
            done.call(engine, move);
        }

        engine.reducer = function(reducer, done) {
            var red = play.reduce.shift();
            if (!red) {
                old['reducer'](reducer, done)
                throw "END"
            }
            done(reducer.ok(red));
        }

        if (play.engine) engine.init(play.engine)


        try {

            console.log('Start cycle')
            while (true) {
                if (engine.phase == "advance") {
                    var advances = play.advance.shift();
                    if (advances === undefined) throw "END";
                    _.each(advances, function(adv) {
                        engine.runPhase('advance', adv);
                    })
                    engine.nextPhase();
                }
                else
                    engine.runPhase(engine.phase);
            }
        }
        catch (e) {
            _.extend(engine, old);
            done && done();
            throw e;
        }
    }
}