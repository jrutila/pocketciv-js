module.exports = {
    title: "Build a City",
    run: function() {
        var engine = this;
        var possibleAreas = {};
        var city_cost = engine.params.city_cost ? engine.params.city_cost : 4;
        for (var key in engine.map.areas)
        {
            if (engine.map.areas[key].tribes >= city_cost &&
                !engine.map.areas[key].city)
            {
                possibleAreas[key] = engine.map.areas[key];
            }
        }
        engine.areaSelector(possibleAreas, function(area) {
            var changes = {};
            changes[area.id] = {
                'tribes': '-'+city_cost,
                'city': '1' };
            engine.areaChange(changes);
        });
    }
}