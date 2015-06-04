var _ = require("underscore")
var mover = require("../phases/move").TribeMover;

module.exports = {
    run: function(engine, play, done) {

        var old = {
            'drawer': engine.drawer,
            'areaChanger': engine.areaChanger,
            'areaSelector': engine.areaSelector,
            'reducer': engine.reducer,
            'mover': engine.mover,
            'acquirer': engine.advanceAcquirer,
        }
        engine.advanceAcquirer = function(engine, done) {
            var acq = play.acquires.shift();
            if (!acq) {
                old['acquirer'](acq, done)
                throw "END"
            }
            var a = { };
            done(_.object(_.map(acq, function (advn, key) {
                return [key, _.isObject(advn) ? advn : engine.advances[advn]];
            })));
        }
        engine.drawer = function(deck, done) {
            var id = play.deck.shift();
            if (!id) {
                old['drawer'](deck, done)
                throw "END"
            }
            var card = engine.deck.draw(id);
            console.log("card: "+card.id)
            done.call(engine, card)
        }

        engine.areaChanger = function(ctx, done) {
            console.log("("+engine.phase+") ready")
            done.call(engine);
        }

        engine.areaSelector = function(possibleAreas, done) {
            var id = play.areas.shift();
            console.log("SELECT AREA: "+id)
            if (!id) {
                old['areaSelector'](possibleAreas, done)
                throw "END"
            }
            done(possibleAreas[id])
        }
        
        var getMovement = function(areas) {
            return _.object(_.map(engine.map.areas, function (area, id) {
                return [id, area.tribes ? area.tribes : 0 ];
            }));
        }

        engine.mover = function(situation, done) {
            var move = play.move.shift();
            if (!move) {
                old['mover'](situation, done)
                throw "END"
            }
            var mr = new mover(engine.map.areas,
            engine.params.moveLimit,
            engine.params.sea_move ? engine.params.sea_cost : undefined);
            console.log(getMovement(engine.map.areas));
            console.log(move)
            mr.init(getMovement(engine.map.areas));
            var ok = mr.ok(move);
            if (!ok.ok)
                throw new Error("Failed move!");
            
            done.call(engine, ok);
        }

        engine.reducer = function(reducer, done) {
            var red = play.reduce && play.reduce.shift();
            console.log("REDUCE: ")
            console.log(red)
            if (!red) {
                old['reducer'](reducer, done)
                throw "END"
            }
            var ok = reducer.ok(red);
            console.log(ok.target)
            console.log(ok.ok)
            done(ok);
        }

        if (play.scenario) engine.init(play.scenario)


        try {

            console.log('Start cycle')
            if (!engine.phase) engine.phase= "populate";
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