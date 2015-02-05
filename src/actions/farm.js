var i18n = require('../lib/i18n');
module.exports = {
    title: "Create a Farm",
    run: function(context) {
        var engine = this;
        var possibleAreas = {};
        for (var key in engine.map.areas)
        {
            if (!engine.map.areas[key].farm &&
                engine.map.areas[key].tribes >= 2 &&
                (
                    (context && context.forest_free)
                    ||
                    engine.map.areas[key].forest
                )
                )
            {
                possibleAreas[key] = engine.map.areas[key];
            }
        }
        engine.areaSelector(possibleAreas, function(area) {
            var changes = {};
            changes[area.id] = {
                'tribes': '-2',
                'farm': true };
            var built_without_forest = true;
            if (!context || !context.forest_free)
            {
                changes[area.id].forest = false;
                built_without_forest = false;
            }
            if (context && context.forest_free && area.forest == true)
            {
                var msg = i18n.translate('Do you want to use the forest in the area %s?').fetch(area);
                if (engine.queryUser('yesno', msg))
                {
                    changes[area.id].forest = false;
                    built_without_forest = false;
                }
            }
            
            context.changes = changes;
            context.confirm =  function() {
                context && built_without_forest && context['forest_free_used']();
            };
            context.done && context.done();
        });
    }
}
