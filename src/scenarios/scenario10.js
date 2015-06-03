module.exports = {
    "name": "scenario10",
    "title": "The Enemy Outpost",
    "rules": "To remove 1 Enemy Outpost counter: \
<ul> \
<li>You must Decimate 10 Tribes from Region 6.</li> \
<li>If you have Military OR Metal Working, Decimate 6 Tribes from Region 6.</li> \
<li>If you have Military AND Metal Working, Decimate 3 Tribes from Region 6.</li> \
</ul>",
    "goal": "Destroy the Enemy Outpost before the end of the 8th Era",
    "description": "You win when you have destroyed the Enemy Outpost by removing all Outpost counters from Region 6. \
At the end of an Era, if an Outpost counter is still in Region 6, add one more Outpost counter.",
    'end_of_era.post': function(ctx) {
        var engine = this;
        // End of era 8
        if (engine.era == 9)
        {
            if (engine.map.areas[6].counter)
            {
                engine.gameOver(false, "You did not destroy the Enemy Outpost.");
            } else {
                engine.gameOver(true);
            }
        } else {
            console.log(engine.map.areas[6].counter)
            if (engine.map.areas[6].counter)
            {
                //engine.map.areas[6].counter = engine.map.areas[6].counter + 1;
                //ctx.initial[6].counter = engine.map.areas[6].counter;
                ctx.change(6, {counter: 1 });
            }
        }
        ctx.done && ctx.done();
    },
    "map": {
        "areas": {
            "1": {
                "id": 1,
                "farm": true,
                "fault": true,
                "neighbours": [ 3, 4, 6, 'western', 'frontier'],
            },
            "2": {
                "id": 2,
                "forest": true,
                "mountain": true,
                "tribes": 1,
                "neighbours": [ 3, 5, 7, 8, 'frontier'],
            },
            "3": {
                "id": 3,
                "desert": true,
                "neighbours": [ 1, 2, 8, 'frontier'] ,
            },
            "4": {
                "id": 4,
                "forest": true,
                "neighbours": [ 1, 8, 'western', 'frontier']
            },
            "5": {
                "id": 5,
                "forest": true,
                "tribes": 1,
                "neighbours": [ 2, 7, 'eastern'],
            },
            "6": {
                "id": 6,
                "forest": true,
                "counter": 1,
                "neighbours": [ 1, 'western', 'frontier'],
            },
            "7": {
                "id": 7,
                "tribes": 1,
                "forest": true,
                "neighbours": [ 2, 5, 8, 'eastern' ]
            },
            "8": {
                "id": 8,
                "mountain": true,
                "neighbours": [ 2, 3, 4, 7, 'eastern', 'frontier'],
            },
        },
        "width": 11,
        "height": 10,
        "grid":[
        [-1,-1, 0, 0, 0, 0,-1,-1,-1,-1,-1 ],
        [-1,-1, 0, 0, 0, 0,-1,-1,-1,-1,-1 ],
        [-1,-1, 0, 0, 0, 0,-1,-1,-1,-1,-1 ],
        [-1,-1, 0, 0, 0, 0,-1,-1,-1,-1,-1 ],
        [-1, 4, 4, 4, 8, 8, 8,-1,-1,-1,-1 ],
        [-1, 1, 4, 0, 0, 8, 2, 7,-1,-1,-1 ],
        [-1, 6, 1, 0, 3, 3, 2, 2, 7,-1,-1 ],
        [-1, 6, 6, 1, 3, 3, 0, 2, 7,-1,-1 ],
        [ 0, 0, 6, 1, 0, 0, 0, 5, 7,-1,-1 ],
        [ 0, 0, 0, 0, 0, 0, 0, 5, 5,-1,-1 ],
        [ 0, 0, 0, 0, 0, 0, 0, 5, 0,-1,-1 ],
        [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
        [-1,-1,-1,-1,-1,-1, 0, 0, 0, 0, 0 ],
        [-1,-1,-1,-1,-1,-1, 0, 0, 0, 0, 0 ],
        ] 
    }
}