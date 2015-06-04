module.exports = {
    "name": "scenario2",
    "title": "2. The Gilded Land",
    "description": "This is another simple scenario. You will be required now \
    to create some gold at some point, in order to acquire \
Architecture. This can be done through various ways, through other \
Advances (such as Mining and Black Market) or through Expeditions",
    "goal": "Acquire Architecture before the end of Era 3.",
    'end_of_era.post': function(ctx) {
        console.log("Check for winning conditions")
        var engine = this;
        // End of era 3
        if (engine.era == 4)
        {
            if (engine.acquired.indexOf('architecture') != -1)
            {
                engine.gameOver(true);
            } else {
                engine.gameOver(false, "You did not manage to acquire Architecture.");
            }
        }
        ctx.done && ctx.done();
    },
    "advance.post": function(ctx) {
        var engine = this;
        if (engine.acquired.indexOf('architecture') != -1)
        {
            engine.gameOver(true);
        }
        ctx.done && ctx.done();
    },
    "map": {
        "areas": {
            "3": {
                "id": 3,
                "tribes": 1,
                "farm": true,
                "neighbours": [ 4, 5, 6, 8, 'sea'],
            },
            "4": {
                "id": 4,
                "tribes": 1,
                "mountain": true,
                "forest": true,
                "farm": true,
                "neighbours": [ 3, 8, 'sea', 'frontier']
            },
            "5": {
                "id": 5,
                "tribes": 1,
                "mountain": true,
                "forest": true,
                "neighbours": [ 3, 6, 8, 'sea', 'frontier'],
                "mountain": true
            },
            "6": {
                "id": 6,
                "tribes": 1,
                "neighbours": [ 3, 5, 8 ],
                "forest": true
            },
            "8": {
                "id": 8,
                "neighbours": [ 3, 4, 5, 6, 'frontier'],
                "desert": true
            }
        },
        "width": 11,
        "height": 11,
        "grid":[
        [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
        [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
        [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
        [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
        [ 0, 5, 5, 8, 8, 0, 0, 0, 0, 0 ],
        [-1,-1, 5, 6, 6, 8, 0, 0, 0, 0 ],
        [-1,-1,-1, 5, 6, 6, 8, 0, 0, 0 ],
        [-1,-1,-1,-1, 3, 3, 3, 4, 4, 0 ],
        [-1,-1,-1,-1,-1, 3,-1, 4, 4, 0 ],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1 ],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1 ],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1 ],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1 ],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1 ],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1 ],
        ] 
    }
}