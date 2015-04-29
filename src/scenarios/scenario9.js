module.exports = {
    "name": "scenario9",
    "title": "Sister Lands of the North",
    "rules": "If you have Roadbuilding or Equestrian, you can move \
    Tribes between Regions 4 and Region 1 as if they share a common border",
    "goal": "Acquire Law before the end of the 8th Era.",
    "description": "Start the game as if you were in Era 2.",
    "era": 2,
    'end_of_era.post': function(ctx) {
        var engine = this;
        // End of era 8
        if (engine.era == 9)
        {
            if (engine.acquired.indexOf('law') != -1)
            {
                engine.gameOver(true);
            } else {
                engine.gameOver(false, "You did not manage to acquire the Law.");
            }
            ctx.done && ctx.done();
        }
    },
    "advance.post": function(ctx) {
        var engine = this;
        if (engine.acquired.indexOf('law') != -1)
        {
            engine.gameOver(true);
        }
        ctx.done && ctx.done();
    },
    "move.pre": function(ctx) {
        if (_.contains(ctx.engine.acquired, "equestrian") || _.contains(ctx.engine.acquired, "roadbuilding")) {
            ctx.engine.map.areas[1].neighbours.push(4);
            ctx.engine.map.areas[4].neighbours.push(1);
        }
        ctx.done && ctx.done();
    },
    "move.post": function(ctx) {
        var i = -1;
        i = ctx.engine.map.areas[1].neighbours.indexOf(4);
        if (i > -1)
            ctx.engine.map.areas[1].neighbours.splice(i, 1);
        i = ctx.engine.map.areas[4].neighbours.indexOf(1);
        if (i > -1)
            ctx.engine.map.areas[4].neighbours.splice(i, 1);
        ctx.done && ctx.done();
    },
    "map": {
        "areas": {
            "1": {
                "id": 1,
                "tribes": 1,
                "forest": true,
                "mountain": true,
                "neighbours": [ 7, 8, 'sea', 'frontier'],
            },
            "2": {
                "id": 2,
                "desert": true,
                "neighbours": [ 3, 4, 5, 'frontier'],
            },
            "3": {
                "id": 3,
                "forest": true,
                "volcano": true,
                "neighbours": [ 2, 5, 'sea', 'frontier'] ,
            },
            "4": {
                "id": 4,
                "forest": true,
                "mountain": true,
                "neighbours": [ 2, 5, 'sea', 'frontier']
            },
            "5": {
                "id": 5,
                "forest": true,
                "neighbours": [ 2, 3, 4, 'sea'],
            },
            "6": {
                "id": 6,
                "tribes": 1,
                "city": 2,
                "forest": true,
                "neighbours": [ 7, 8, 'sea', 'frontier'],
            },
            "7": {
                "id": 7,
                "tribes": 1,
                "forest": true,
                "fault": true,
                "neighbours": [ 1, 6, 8, 'frontier' ]
            },
            "8": {
                "id": 8,
                "tribes": 1,
                "forest": true,
                "neighbours": [ 1, 6, 7, 'sea', 'frontier'],
            },
        },
        "width": 14,
        "height": 11,
        "grid":[
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1 ],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1 ],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1 ],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1 ],
        [-1, 3, 3, 3, 5,-1,-1,-1,-1,-1,-1,-1,-1 ],
        [ 0, 0, 3, 2, 5,-1,-1,-1,-1,-1,-1,-1,-1 ],
        [ 0, 0, 2, 2, 2, 5,-1,-1,-1,-1,-1,-1,-1 ],
        [ 0, 0, 0, 0, 4, 4, 5,-1,-1,-1,-1,-1,-1 ],
        [ 0, 0, 0, 0, 0, 4, 4,-1,-1,-1, 8,-1,-1 ],
        [ 0, 0, 0, 0, 0, 0, 0,-1, 8, 8, 8, 6 ],
        [ 0, 0, 0, 0, 0, 0, 0, 1, 1, 7, 6, 6 ],
        [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 7, 6 ],
        [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 7, 7 ],
        [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
        [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
        [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
        [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
        ] 
    }
}