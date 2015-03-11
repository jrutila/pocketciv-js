module.exports = {
    "name": "scenario5",
    "title": "Invaders From the Divide",
    "description": "",
    "goal": "Survive the Invasion.<br/>\
At the end of the Round when the 4th End of Era check has occurred, an Attacking Force of 50 invades Region 2 from the \
Mountains. If you have at least 1 Tribe or 1 City remain after the attack, you have completed your Goal.",
    'upkeep.post': function(ctx) {
        var engine = this;
        // Fourth end of era check has occurred means we are on era 5
        if (engine.era == 5) {
            console.log("ATTACK of 50 happens!")
            var olddone = ctx.done;
            ctx.done = function() {
                olddone();
                engine.gameOver(true);
            };
            ctx.ctx = {};
            ctx.ctx.active_region = engine.map.areas[2];
            ctx.ctx.attack_force = 50;
            engine.doEvent({ name: 'attack' }, ctx);
        } else
            ctx.done && ctx.done();
    },
    'final_attack': function(ctx) {
        ctx.done && ctx.done();
    },
    "map": {
        "areas": {
            "1": {
                "id": 1,
                "forest": true,
                "tribes": 1,
                "neighbours": [ 6, 8, 'sea', 'frontier'],
            },
            "2": {
                "id": 2,
                "mountain": true,
                "desert": true,
                "neighbours": [ 3, 4, 'frontier'],
            },
            "3": {
                "id": 3,
                "mountain": true,
                "forest": true,
                "neighbours": [ 2, 4, 6, 7, 'frontier'],
            },
            "4": {
                "id": 4,
                "mountain": true,
                "neighbours": [ 2, 3, 6, 'frontier']
            },
            "6": {
                "id": 6,
                "mountain": true,
                "forest": true,
                "neighbours": [ 1, 3, 4, 'frontier'],
            },
            "7": {
                "id": 7,
                "forest": true,
                "tribes": 1,
                "neighbours": [ 3, 8, 'frontier' ]
            },
            "8": {
                "id": 8,
                "forest": true,
                "tribes": 1,
                "neighbours": [ 1, 7, 'sea', 'frontier' ]
            },
        },
        "width": 11,
        "height": 14,
        "grid":[
        [ 0, 0, 0, 0, 0, 0, 0,-1,-1,-1,-1 ],
        [ 0, 0, 0, 0, 0, 0, 0,-1,-1,-1,-1 ],
        [ 0, 0, 2, 0, 0, 0, 0,-1,-1,-1,-1 ],
        [ 0, 2, 2, 4, 4, 0, 0,-1,-1,-1,-1 ],
        [ 0, 0, 3, 2, 4, 4, 0,-1,-1,-1,-1 ],
        [ 0, 0, 0, 3, 3, 6, 6, 1,-1,-1,-1 ],
        [ 0, 0, 0, 0, 3, 0, 6, 6, 1,-1,-1 ],
        [ 0, 0, 0, 0, 7, 7, 0, 1, 1,-1,-1 ],
        [ 0, 0, 0, 0, 0, 7, 0, 8, 8,-1,-1 ],
        [ 0, 0, 0, 0, 0, 0, 7, 8, 8,-1,-1 ],
        [ 0, 0, 0, 0, 0, 0, 0, 0,-1,-1,-1 ],
        [ 0, 0, 0, 0, 0, 0, 0, 0,-1,-1,-1 ],
        [ 0, 0, 0, 0, 0, 0, 0, 0,-1,-1,-1 ],
        ] 
    }
}