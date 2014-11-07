module.exports = {
    name: "agriculture",
    title: "Agriculture",
    description: "Farms can be created in any Region, and you do NOT \
decimate Forests to create Farms once per turn. You still must \
Decimate 2 Tribes to create a Farm.",
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
                    'forest_free': !engine.round.agriculture_farm_used,
                    'forest_free_used': function() {
                        console.log("Agriculture used for farm building!")
                        engine.round.agriculture_farm_used = true;
                        }
                    }
            }
        },
    }
}