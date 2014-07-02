module.exports = {
    run: function(context) {
        var engine = this;
        var possibleAreas = [];
        for (var key in engine.map.areas)
        {
            if (!engine.map.areas[key].farm &&
                engine.map.areas[key].tribes >= 2 &&
                (
                    (context && context.do_not_use_forest)
                    ||
                    engine.map.areas[key].forest
                )
                )
            {
                possibleAreas.push(key);
            }
        }
        engine.areaSelector(possibleAreas, function(area) {
            var changes = {};
            changes[area] = {
                'tribes': '-2',
                'farm': true };
            if (!context || !context.do_not_use_forest)
                changes[area].forest = false;
            
            engine.areaChange(changes, function() {
                context && context['done']();
            });
        });
    }
}