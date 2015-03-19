module.exports = {
    "name": "scenario8",
    "title": "Go West",
    "description": "You may only move Tribes by Sea (with Fishing or Navigation), \
    from one Region to another Region that Neighbors the same Sea. Tribes may \
    not move from the Western Sea to the Eastern Sea, and vice versa. \
    Tsunamis can only affect Regions that neighbor the same Sea that the Active \
    Region neighbors. For example, a Tsunami that was “started” in Region 6, \
    can only affect Regions 6 and 1",
    "goal": "Build a City in Region 1 and Region 6 before the end of the 8th \
    Era. Both of these Cities must have a City AV of 3 or greater \
    (at the end of a round after Upkeep) to win.",
    'end_of_era.post': function(ctx) {
        console.log("Check for winning conditions")
        var engine = this;
        // End of era 8
        if (engine.era == 9)
        {
            if (engine.map.areas[1].city > 2 && engine.map.areas[6].city > 2)
            {
                engine.gameOver(true);
            } else {
                engine.gameOver(false, "You did not manage to build the cities \
                with 2 AV to areas 1 and 6.");
            }
            ctx.done && ctx.done();
        }
    },
    'upkeep.post': function(ctx) {
        var engine = this;
        if (engine.map.areas[1].city > 2 && engine.map.areas[6].city > 2)
        {
            engine.gameOver(true);
        }
        ctx.done && ctx.done();
    },
    "map": {
        "areas": {
            "1": {
                "id": 1,
                "desert": true,
                "neighbours": [ 3, 4, 6, 'western', 'frontier'],
            },
            "2": {
                "id": 2,
                "tribes": 1,
                "mountain": true,
                "forest": true,
                "neighbours": [ 5, 7, 8, 'eastern', 'frontier'],
            },
            "3": {
                "id": 3,
                "desert": true,
                "neighbours": [ 1, 4, 5, 6 ],
            },
            "4": {
                "id": 4,
                "desert": true,
                "mountain": true,
                "neighbours": [ 1, 3, 5, 8, 'frontier']
            },
            "5": {
                "id": 5,
                "desert": true,
                "mountain": true,
                "neighbours": [ 2, 3, 4, 6, 'frontier'],
            },
            "6": {
                "id": 6,
                "forest": true,
                "mountain": true,
                "neighbours": [ 1, 3, 5, 'western', 'frontier'],
            },
            "7": {
                "id": 7,
                "tribes": 1,
                "city": 1,
                "forest": true,
                "farm": true,
                "neighbours": [ 2, 8, 'eastern', 'frontier' ]
            },
            "8": {
                "id": 8,
                "tribes": 1,
                "forest": true,
                "neighbours": [ 2, 4, 7, 'frontier'],
            },
        },
        "width": 13,
        "height": 11,
        "grid":[
        [-1,-1,-1, 0, 0, 0,-1,-1,-1,-1,-1,-1 ],
        [-1,-1,-1, 0, 0, 0,-1,-1,-1,-1,-1,-1 ],
        [-1,-1,-1, 0, 0, 0,-1,-1,-1,-1,-1,-1 ],
        [-1,-1, 6, 0, 0, 0, 0, 0,-1,-1,-1,-1 ],
        [-1,-1, 6, 6, 0, 0, 0, 0,-1,-1,-1,-1 ],
        [-1, 1, 6, 3, 5, 5, 0,-1,-1,-1,-1,-1 ],
        [-1, 1, 3, 3, 3, 5, 2, 2, 2, 7,-1,-1 ],
        [-1,-1, 1, 1, 4, 4, 5, 2, 7, 7,-1,-1 ],
        [-1,-1,-1, 0, 0, 4, 4, 0, 8, 7,-1,-1 ],
        [-1,-1,-1, 0, 0, 0, 8, 8, 8, 0,-1,-1 ],
        [-1,-1,-1, 0, 0, 0, 0, 0, 0, 0,-1,-1 ],
        [-1,-1,-1, 0, 0, 0, 0, 0, 0, 0,-1,-1 ],
        [-1,-1,-1,-1,-1,-1,-1, 0, 0, 0, 0,-1 ],
        [-1,-1,-1,-1,-1,-1,-1, 0, 0, 0, 0 ],
        [-1,-1,-1,-1,-1,-1,-1, 0, 0, 0, 0 ],
        ] 
    }
}