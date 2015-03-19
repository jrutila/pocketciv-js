module.exports = {
    "name": "scenario1",
    "title": "A New World",
    "description": "This scenario is a simple layout, with a simple goal that can be \
    played in a short amount of time to get the hang of how the \
    game works. Many of the more advanced techniques, such as expeditions, and acquiring gold, \
    are not needed.",
    "goal": "Build a City in Region 4 before the end of Era 1. \
The City must be standing at the end of a Round (after Upkeep).",
    'end_of_era.post': function(ctx) {
        console.log("Check for winning conditions")
        var engine = this;
        if (engine.era == 2)
        {
            if (engine.map.areas[4].city > 0)
            {
                engine.gameOver(true);
            } else {
                engine.gameOver(false, "You did not manage to build the city to area 4.");
            }
            ctx.done && ctx.done();
        }
    },
    'upkeep.post': function(ctx) {
            if (this.map.areas[4].city > 0)
            {
                this.gameOver(true);
            }
            ctx.done && ctx.done();
    },
    "map": {
        "areas": {
            "1": {
                "id": 1,
                "neighbours": [3, 4, 8, 'frontier'],
                "forest": true
            },
            "2": {
                "id": 2,
                "desert": true,
                "neighbours": [3, 5, 8, 'sea', 'frontier']
            },
            "3": {
                "id": 3,
                "desert": true,
                "neighbours": [1, 2, 4, 8, 'frontier'],
            },
            "4": {
                "id": 4,
                "desert": true,
                "neighbours": [1, 3, 'frontier']
            },
            "5": {
                "id": 5,
                "tribes": 1,
                "neighbours": [2, 7, 'sea'],
                "mountain": true
            },
            "7": {
                "id": 7,
                "neighbours": [5, 8, 'sea'],
                "forest": true
            },
            "8": {
                "id": 8,
                "neighbours": [1, 2, 3, 7, 'sea', 'frontier'],
                "forest": true,
                "mountain": true
            }
        },
        "width": 11,
        "height": 9,
        "grid":[
        [ 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
        [ 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
        [ 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
        [-1,-1, 0, 1, 1, 0, 0, 0, 0 ],
        [-1,-1, 8, 8, 1, 1, 4, 4, 0 ],
        [-1,-1,-1, 7, 8, 3, 4, 4, 0 ],
        [-1,-1, 7, 7, 0, 8, 3, 3, 0 ],
        [-1,-1, 5, 7, 0, 0, 2, 3, 0 ],
        [-1,-1, 5, 5, 5, 2, 2, 2, 0 ],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1 ],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1 ],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1 ],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1 ],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1 ],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1 ],
        ] 
    }
}