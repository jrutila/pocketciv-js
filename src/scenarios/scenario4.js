module.exports = {
    "name": "scenario4",
    "title": "From the Mountains to the Sea",
    "description": "",
    "goal": "Build a City in Region 1 before the end of Era 4. The City must be standing at the end of a Round (after Upkeep).",
    'end_of_era.post': function(ctx) {
        console.log("Check for winning conditions")
        var engine = this;
        // End of era 4
        if (engine.era == 5)
        {
            if (engine.map.areas[1].city > 0)
            {
                engine.gameOver(true);
            } else {
                engine.gameOver(false, "You did not manage to build the city to area 1.");
            }
            ctx.done && ctx.done();
        }
    },
    'upkeep.post': function(ctx) {
            if (this.map.areas[1].city > 0)
            {
                this.gameOver(true);
            }
            ctx.done && ctx.done();
    },
    "map": {
        "areas": {
            "1": {
                "id": 1,
                "forest": true,
                "neighbours": [ 3, 'sea', 'frontier'],
            },
            "2": {
                "id": 2,
                "mountain": true,
                "neighbours": [ 7, 8, 'frontier'],
            },
            "3": {
                "id": 3,
                "desert": true,
                "neighbours": [ 1, 4, 8, 'sea', 'frontier'],
            },
            "4": {
                "id": 4,
                "volcano": true,
                "neighbours": [ 3, 8, 'frontier']
            },
            "6": {
                "id": 6,
                "mountain": true,
                "farm": true,
                "tribes": 1,
                "neighbours": [ 7, 'frontier'],
            },
            "7": {
                "id": 7,
                "tribes": 1,
                "forest": true,
                "mountain": true,
                "neighbours": [ 2, 6, 8, 'frontier' ]
            },
            "8": {
                "id": 8,
                "forest": true,
                "mountain": true,
                "neighbours": [ 2, 3, 4, 7, 'frontier' ]
            },
        },
        "width": 11,
        "height": 14,
        "grid":[
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1 ],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1 ],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1 ],
        [-1, 1, 1,-1,-1,-1,-1,-1,-1,-1,-1 ],
        [-1, 1, 3, 3, 3, 3, 0, 0, 0, 0, 0 ],
        [ 0, 0, 1, 0, 8, 4, 4, 0, 0, 0, 0 ],
        [ 0, 0, 0, 0, 2, 8, 4, 4, 0, 0, 0 ],
        [ 0, 0, 0, 0, 2, 2, 8, 8, 0, 0, 0 ],
        [ 0, 0, 0, 0, 0, 0, 2, 7, 7, 0, 0 ],
        [ 0, 0, 0, 0, 0, 6, 0, 7, 7, 0, 0 ],
        [ 0, 0, 0, 0, 0, 0, 6, 6, 6, 0, 0 ],
        [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
        [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
        ] 
    }
}