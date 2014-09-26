module.exports = {
    title: "Build a City",
    run: function() {
        var engine = this;
        var possibleAreas = {};
        for (var key in engine.map.areas)
        {
            if (engine.map.areas[key].tribes >= 4 &&
                !engine.map.areas[key].city)
            {
                possibleAreas[key] = engine.map.areas[key];
            }
        }
        engine.areaSelector(possibleAreas, function(area) {
            var changes = {};
            changes[area.id] = {
                'tribes': '-4',
                'city': '1' };
            engine.areaChange(changes);
        });
    }
}