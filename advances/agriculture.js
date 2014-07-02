module.exports = {
    name: "agriculture",
    title: "Agriculture",
    points: 5,
    cost: { 'tribes': 4 },
    resources: [ 'stone' ],
    requires: [ ],
    required_by: [ 'irrigation', 'equestrian' ],
    events: { },
    actions: {
        'farm': {
            'context': function(engine) {
                return { 
                    'do_not_use_forest': !engine.forest_used,
                    'done': function() { engine.forest_used = true }
                    }
            }
        },
        'upkeep': {
            'engine': function(engine) {
                engine.forest_used = false;
            }
        }
    }
}