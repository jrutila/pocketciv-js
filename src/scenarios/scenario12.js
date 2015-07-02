module.exports = {
    "name": "scenari o12",
    "title":  "12. To Honor the Fallen",
    "rules": "If you have Roadbuilding or Equestrian, you can move \
    Tribes between Regions 8 and 7 as if they share a common border",
    "goal": "Build a Coliseum of Death and an Amphitheater before the end of the  8th Era.",
    "description": "You start the game automatically with Coinage.",
    "acquired": ["coinage"],
    'end_of_era.post': function(ctx) {
        var engine = this;
        // End of era  8
        if (engine.era ==  9)
        {
            if (
                _.some(engine.map.areas, function(area) {
                    return area.wonders && _.contains(area.wonders, "coliseum");
            }) &&
                _.some(engine.map.areas, function(area) {
                    return area.wonders && _.contains(area.wonders, "amphitheater");
            }) 
            )
            {
                engine.gameOver(true);
            } else {
                engine.gameOver(false, "You did not manage to build a Coliseum of Death and an Amphitheater .");
            }
        }
        ctx.done && ctx.done();
    },
    "advance.post": function(ctx) {
        var engine = this;
        // TODO: Should the game end when those are ready?
        if (false)
        {
            engine.gameOver(true);
        }
        ctx.done && ctx.done();
    },
    "move.pre": function(ctx) {
        // Make 8 and 7 neighbours for the move
        if (_.contains(ctx.engine.acquired, "equestrian") || _.contains(ctx.engine.acquired, "roadbuilding")) {
            ctx.engine.map.areas [8].neighbours.push (7);
            ctx.engine.map.areas [7].neighbours.push (8);
        }
        ctx.done && ctx.done();
    },
    "move.post": function(ctx) {
        // Remove neighbourhood
        var i = -1;
        i = ctx.engine.map.areas [8].neighbours.indexOf (7);
        if (i > -1)
            ctx.engine.map.areas [8].neighbours.splice(i,  1);
        i = ctx.engine.map.areas [7].neighbours.indexOf (8);
        if (i > -1)
            ctx.engine.map.areas [7].neighbours.splice(i,  1);
        ctx.done && ctx.done();
    },
    "map": {
        "areas": {
             "1": {
                "id":  1,
                "tribes":  2,
                "forest": true,
                "neighbours": [  4,  5,  8, 'eastern' ],
            },
             "2": {
                "id":  2,
                "forest": true,
                "mountain": true,
                "neighbours": [  3,  4, 'western', 'frontier' ],
            },
             "3": {
                "id":  3,
                "forest": true,
                "neighbours": [  2,  4, 'western', 'frontier' ] ,
            },
             "4": {
                "id":  4,
                "desert": true,
                "neighbours": [  1,  2,  3,  5,  8, 'frontier' ]
            },
             "5": {
                "id":  5,
                "forest": true,
                "mountain": true,
                "tribes":  2,
                "neighbours": [  1,  4, 'eastern', 'frontier' ],
            },
             "6": {
                "id":  6,
                "forest": true,
                "mountain": true,
                "neighbours": [ 'western', 'frontier' ],
            },
             "7": {
                "id":  7,
                "forest": true,
                "neighbours": [ 'eastern', 'frontier' ]
            },
             "8": {
                "id":  8,
                "forest": true,
                "volcano": true,
                "neighbours": [  1,  4, 'eastern', 'frontier' ],
            },
        },
        "width":  14,
        "height":  11,
        "grid": [
            [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
            [ 0 ,0,-1 ,0,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
            [ 0 ,6 ,6,-1,-1 ,0,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
            [-1 ,6 ,6,-1,-1 ,0 ,0 ,0,-1,-1,-1,-1,-1,-1,-1,-1,-1],
            [-1,-1,-1,-1 ,2 ,2 ,0 ,0 ,0 ,0,-1,-1,-1,-1,-1,-1,-1],
            [-1,-1,-1 ,3 ,2 ,2 ,0 ,5 ,0 ,0 ,0,-1,-1,-1,-1,-1,-1],
            [-1,-1 ,3 ,3 ,4 ,4 ,0 ,5 ,5 ,5 ,0 ,0 ,0,-1,-1,-1,-1],
            [-1,-1,-1 ,3 ,0 ,0 ,4 ,4 ,1,-1,-1,-1,-1,-1,-1,-1,-1],
            [-1,-1,-1,-1 ,0 ,0 ,8 ,1 ,1 ,1,-1,-1,-1,-1,-1,-1,-1],
            [-1,-1,-1,-1 ,0 ,0 ,0 ,8 ,8 ,8,-1,-1,-1,-1,-1,-1,-1],
            [-1,-1,-1,-1,-1 ,0 ,0 ,0 ,0 ,0,-1,-1,-1,-1,-1,-1,-1],
            [-1,-1,-1,-1,-1,-1 ,0 ,0 ,7 ,7 ,7,-1,-1,-1,-1,-1,-1],
            [-1,-1,-1,-1,-1,-1 ,0 ,0,-1,-1 ,7,-1,-1,-1,-1,-1,-1],
            [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
            [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
            [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1]
        ]
    }
}