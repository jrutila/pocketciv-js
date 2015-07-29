module.exports = {
    "name": "scenario15",
    "title":  "15. The Den of Thieves",
    "rules": "",
    "goal": "Acquire Civil Service in order to remove Culture of Thievery",
    "description": "You start with Culture of Thievery.",
    "acquired": ["culture_of_thievery"],
    'end_of_era.post': function(ctx) {
        var engine = this;
        // End of era  8
        if (engine.era ==  9)
        {
            if (_.contains(engine.acquired, "civil_service"))
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
        if (_.contains(engine.acquired, "civil_service"))
        {
            engine.gameOver(true);
        }
        ctx.done && ctx.done();
    },
    "map": {
        "areas": {
             "1": {
                "id":  1,
                "desert": true,
                "tribes": 1,
                "neighbours": [  3, 4, 6, 'sea' ],
            },
             "2": {
                "id":  2,
                "forest": true,
                "neighbours": [  5, 7, 8, 'sea' ],
            },
             "3": {
                "id":  3,
                "mountain": true,
                "fault": true,
                "tribes": 1,
                "neighbours": [ 1, 4, 5, 6, 'frontier' ] ,
            },
             "4": {
                "id":  4,
                "forest": true,
                "tribes": 1,
                "neighbours": [ 1, 3, 'sea', 'frontier' ]
            },
             "5": {
                "id":  5,
                "forest": true,
                "mountain": true,
                "neighbours": [ 2, 3, 8, 'sea', 'frontier' ],
            },
             "6": {
                "id":  6,
                "desert": true,
                "neighbours": [ 1, 3, 'sea', 'frontier' ],
            },
             "7": {
                "id":  7,
                "forest": true,
                "neighbours": [ 2, 8, 'sea', 'frontier' ]
            },
             "8": {
                "id":  8,
                "forest": true,
                "mountain": true,
                "neighbours": [ 2, 5, 7, 'frontier' ],
            },
        },
        "width":  10,
        "height":  11,
        "grid":[[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],[-1,-1,0,0,7,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],[-1,-1,0,0,7,7,7,2,-1,-1,-1,-1,-1,-1,-1,-1],[-1,-1,0,8,8,8,2,2,-1,-1,-1,-1,-1,-1,-1,-1],[-1,6,6,0,0,8,5,2,-1,-1,-1,-1,-1,-1,-1,-1],[-1,1,6,6,3,5,5,5,-1,-1,-1,-1,-1,-1,-1,-1],[-1,1,1,3,3,3,0,-1,-1,-1,-1,-1,-1,-1,-1,-1],[-1,-1,-1,1,4,4,0,-1,-1,-1,-1,-1,-1,-1,-1,-1],[-1,-1,-1,4,4,0,0,-1,-1,-1,-1,-1,-1,-1,-1,-1],[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1]]
    }
}