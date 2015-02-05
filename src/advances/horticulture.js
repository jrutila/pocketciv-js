module.exports = {
    name: "horticulture",
    title: "Horticulture",
    description: "Decimate 4 Tribes in a Region to Create a Forest.",
    points: 8,
    cost: { 'tribes': 2 },
    resources: [ 'wood' ],
    requires: [ ],
    required_by: [ 'irrigation', 'equestrian' ],
    events: { },
    actions: {
        'forest': {
            'title': "Create a Forest",
            'run': function(context) {
                var engine = this;
                var possibleAreas = {};
                for (var key in engine.map.areas)
                {
                    if (!engine.map.areas[key].forest &&
                        engine.map.areas[key].tribes >= 4)
                    {
                        possibleAreas[key] = engine.map.areas[key];
                    }
                }
                engine.areaSelector(possibleAreas, function(area) {
                    var changes = {};
                    changes[area.id] = {
                        'tribes': '-4',
                        'forest': true 
                    };
                    context.changes = changes;
                    context.done && context.done();
                });
            }
        },
    }
}