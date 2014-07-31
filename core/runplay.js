var _ = require("underscore")

module.exports = {
    run: function(engine, play) {

        var old = {
            'drawer': engine.drawer,
            'areaChanger': engine.areaChanger,
            'areaSelector': engine.areaSelector,
            'reducer': engine.reducer,
            'mover': engine.mover,
        }
        engine.drawer = function(deck, done) {
            var id = play.deck.shift();
            if (!id) throw "END"
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
            if (!id) throw "END"
            done(possibleAreas[id])
        }

        engine.mover = function(situation, done) {
            var move = play.move.shift();
            if (!move) throw "END"
            done.call(engine, move);
        }

        engine.reducer = function(reducer, done) {
            var red = play.reduce.shift();
            if (!red) throw "END"
            done(reducer.ok(red));
        }

        if (play.engine) engine.init(play.engine)


        try {

            while (true) {
                console.log('Start cycle')
                engine.populate();
                engine.move();
                engine.event();
                engine.support();
                var advances = play.advance.shift();
                if (advances === undefined) throw "END";
                _.each(advances, function(adv) {
                    engine.advance(adv);
                })
                engine.gold_decimate();
                engine.city_support();
                engine.upkeep();
            }
        }
        catch (e) {
            _.extend(engine, old);
            throw e;
        }
    }
}