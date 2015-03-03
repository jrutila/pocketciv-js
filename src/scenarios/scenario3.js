module.exports = {
    "name": "scenario3",
    "title": "A Dedication to the Island Gods",
    "description": "You will need to go on Sea Expeditions now. Also, due to \
        the Desert in Region 4, you will need to build up enough Tribes to \
        sail to Region 4 and build the Monolith before upkeep occurs.",
    "goal": "In Region 4, build a Huge Monolith of Impressiveness before the end of Era 5. \
    (NOTE! Wonders not yet implemented!)",
    'end_of_era.post': function(ctx) {
        console.log("Check for winning conditions")
        var engine = this;
        // End of era 5
        if (engine.era == 6)
        {
            engine.gameOver(false, "Do you have the monolith?");
            ctx.done && ctx.done();
        }
    },
    "map": {
        "areas": {
            "1": {
                "id": 1,
                "desert": true,
                "neighbours": [ 3, 'sea', 'frontier'],
            },
            "2": {
                "id": 2,
                "tribes": 1,
                "desert": true,
                "forest": true,
                "neighbours": [ 7, 'sea'],
            },
            "3": {
                "id": 3,
                "mountain": true,
                "forest": true,
                "neighbours": [ 1, 5, 'sea', 'frontier'],
            },
            "4": {
                "id": 4,
                "desert": true,
                "neighbours": [ 'sea', 'frontier']
            },
            "5": {
                "id": 5,
                "forest": true,
                "neighbours": [ 3, 'sea', 'frontier'],
            },
            "7": {
                "id": 7,
                "tribes": 4,
                "city": 1,
                "forest": true,
                "mountain": true,
                "farm": true,
                "neighbours": [ 2, 'sea' ]
            },
        },
        "width": 11,
        "height": 11,
        "grid":[
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1 ],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1 ],
        [-1,-1, 7,-1,-1,-1,-1,-1,-1,-1,-1 ],
        [-1,-1, 2, 7,-1,-1,-1,-1,-1,-1,-1 ],
        [-1, 2, 2, 7, 7,-1,-1,-1,-1,-1,-1 ],
        [-1,-1,-1, 2,-1,-1,-1, 4,-1,-1,-1 ],
        [-1,-1,-1,-1,-1,-1, 0, 4, 4, 0, 0 ],
        [-1,-1, 5, 5, 3, 1, 0, 0, 4, 0, 0 ],
        [-1,-1, 0, 5, 3, 3, 1, 0, 0, 0, 0 ],
        [-1, 0, 0, 0, 5, 3, 1, 1, 0, 0, 0 ],
        [-1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
        [-1,-1,-1,-1,-1, 0, 0, 0, 0, 0, 0 ],
        [-1,-1,-1,-1,-1,-1, 0, 0, 0, 0, 0 ],
        [-1,-1,-1,-1,-1,-1, 0, 0, 0, 0, 0 ],
        [-1,-1,-1,-1,-1,-1, 0, 0, 0, 0, 0 ],
        ] 
    }
}