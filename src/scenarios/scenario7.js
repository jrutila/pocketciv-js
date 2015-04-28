module.exports = {
    "name": "scenario7",
    "title": "Bay of Plenty",
    "description": "If a Tsunami Event happens, the Bay of Plenty turns into the Bay of Brine.",
    "goal": "Attain 250 total glory.",
    'end_of_era.post': function(ctx) {
        var engine = this;
        // End of era 8
        if (engine.era == 9)
        {
            if (engine.glory >= 250)
            {
                engine.gameOver(true);
            } else {
                engine.gameOver(false, "You did not manage to get 250 Glory.");
            }
            ctx.done && ctx.done();
        }
    },
    "event.post": function(ctx) {
        if (ctx.event && ctx.event.name == 'flood')
        {
            var c = ctx.eventCtx;
            if (c.active_region &&
                _.contains(c.active_region.neighbours, "sea"))
            {
                // It WAS a Tsunami! Bay of Brine!
                ctx.engine.params.bay_of_brine = true;
            }
        }
        ctx.done && ctx.done();
    },
    "move.pre": function(ctx) {
        if (ctx.engine.params.bay_of_brine)
        {
            ctx.engine.params.sea_cost = 2;
            ctx.engine.params.sea_expedition = false;
        }
        ctx.done && ctx.done();
    },
    "advance.post": function(ctx) {
        if (ctx.engine.params.bay_of_brine)
        {
            ctx.engine.params.sea_expedition = false;
        }
        ctx.done && ctx.done();
    },
    "city_support.pre": function(ctx) {
        if (ctx.engine.params.bay_of_brine)
            ctx.supported = [];
        ctx.done && ctx.done();
    },
    "era": 1,
    "map": {
        "areas": {
            "1": {
                "id": 1,
                "forest": true,
                "volcano": true,
                "neighbours": [ 'sea', 'frontier' ],
            },
            "2": {
                "id": 2,
                "forest": true,
                "mountain": true,
                "neighbours": [ 'sea', 'frontier' ],
            },
            "3": {
                "id": 3,
                "mountain": true,
                "neighbours": [ 4, 6, 8, 'sea', 'frontier'],
            },
            "4": {
                "id": 4,
                "forest": true,
                "neighbours": [ 3, 'sea', 'frontier']
            },
            "5": {
                "id": 5,
                "desert": true,
                "neighbours": [ 6, 7, 'sea', 'frontier']
            },
            "6": {
                "id": 6,
                "forest": true,
                "neighbours": [ 3, 5, 8, 'sea', 'frontier'],
            },
            "7": {
                "id": 7,
                "forest": true,
                "neighbours": [ 5, 'sea', 'frontier' ]
            },
            "8": {
                "id": 8,
                "desert": true,
                "mountain": true,
                "tribes": 3,
                "neighbours": [ 3, 6, 'frontier' ]
            },
        },
        "width": 14,
        "height": 13,
        "grid":[
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1 ],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1 ],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1 ],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1 ],
        [-1, 7,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1 ],
        [ 0, 7, 7,-1, 1, 0, 2, 2,-1,-1,-1,-1,-1 ],
        [ 0, 7, 5,-1, 1, 1, 0, 2,-1,-1,-1,-1,-1 ],
        [ 0, 0, 5,-1,-1, 1, 0, 2,-1, 4,-1,-1,-1 ],
        [ 0, 0, 0, 5,-1,-1,-1,-1,-1, 4,-1,-1,-1 ],
        [ 0, 0, 0, 0, 5, 6, 3, 3, 3, 3, 4,-1,-1 ],
        [ 0, 0, 0, 0, 0, 6, 6, 6, 8, 0, 4, 0, 0 ],
        [ 0, 0, 0, 0, 0, 0, 8, 8, 8, 0, 0, 0, 0 ],
        [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
        [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
        [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
        [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
        [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
        ] 
    }
}