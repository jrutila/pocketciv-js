module.exports = {
    run: function(engine) {
        var possibleAreas = [];
        for (var key in engine.map.areas)
        {
            // TODO: Agriculture, no forest needed
            if (!engine.map.areas[key].farm &&
                engine.map.areas[key].tribes >= 2 &&
                engine.map.areas[key].forest)
            {
                possibleAreas.push(key);
            }
        }
        engine.areaSelector(possibleAreas, function(area) {
            engine.areaChange(engine.map.areas[area], {
                'tribes': '-2',
                'forest': false,
                'farm': true
            });
        });
    }
}