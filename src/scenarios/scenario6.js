module.exports = {
    "name": "scenario6",
    "title": "6. In the Shadow of the Twin Peaks",
    "description": "",
    "goal": "Have at least 6 cities at the end of the 6th era.",
    'end_of_era.post': function(ctx) {
        var engine = this;
        // End of era 6
        if (engine.era == 7)
        {
            if (engine.map.cityCount >= 6)
            {
                engine.gameOver(true);
            } else {
                engine.gameOver(false, "You did not manage to build 6 cities.");
            }
        }
        ctx.done && ctx.done();
    },
    "era": 3,
    "map": {
        "areas": {
            "1": {
                "id": 1,
                "forest": true,
                "farm": true,
                "mountain": true,
                "city": 1,
                "tribes": 3,
                "neighbours": [ 2, 3, 7, 'frontier'],
            },
            "2": {
                "id": 2,
                "forest": true,
                "tribes": 1,
                "neighbours": [ 1, 3, 5, 'sea', 'frontier'],
            },
            "3": {
                "id": 3,
                "forest": true,
                "fault": true,
                "neighbours": [ 1, 2, 4, 5, 7, 'frontier'],
            },
            "4": {
                "id": 4,
                "volcano": true,
                "fault": true,
                "neighbours": [ 3, 7, 8, 'frontier']
            },
            "5": {
                "id": 5,
                "volcano": true,
                "forest": true,
                "neighbours": [ 2, 3, 8, 'sea', 'frontier']
            },
            "6": {
                "id": 6,
                "forest": true,
                "neighbours": [ 8, 'sea', 'frontier'],
            },
            "7": {
                "id": 7,
                "mountain": true,
                "desert": true,
                "city": 1,
                "tribes": 2,
                "neighbours": [ 1, 3, 4, 'frontier' ]
            },
            "8": {
                "id": 8,
                "desert": true,
                "neighbours": [ 3, 4, 5, 6, 'sea', 'frontier' ]
            },
        },
        "width": 11,
        "height": 13,
        "grid":[
        [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
        [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
        [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
        [ 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0 ],
        [-1, 2, 2, 1, 1, 0, 0, 0, 0, 0, 0, 0 ],
        [-1,-1, 2, 3, 7, 0, 0, 0, 0, 0, 0, 0 ],
        [-1,-1, 2, 3, 7, 7, 0, 0, 0, 0, 0, 0 ],
        [-1,-1, 5, 3, 7, 4, 4, 0, 0, 0, 0, 0 ],
        [-1,-1, 5, 3, 4, 4, 0, 0, 0, 0, 0, 0 ],
        [-1,-1,-1, 5, 8, 8, 0, 6,-1,-1,-1,-1 ],
        [-1,-1,-1,-1, 5, 8, 6, 6,-1,-1,-1,-1 ],
        [-1,-1,-1,-1,-1,-1, 8, 6,-1,-1,-1,-1 ],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1 ],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1 ],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1 ],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1 ],
        ] 
    }
}