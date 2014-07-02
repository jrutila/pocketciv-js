module.exports = {
    run: function(engine) {
        var possibleAreas = [];
        for (var key in engine.map.areas)
        {
            if (engine.map.areas[key].tribes >= 4 &&
                !engine.map.areas[key].city)
            {
                possibleAreas.push(key);
            }
        }
        engine.areaSelector(possibleAreas, function(area) {
            var changes = {};
            changes[area] = {
                'tribes': '-4',
                'city': '1' };
            engine.areaChange(changes);
        });
    }
}