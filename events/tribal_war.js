var reducer = require('../core/reducer')
var _ = require('underscore')

module.exports = {
    name: 'tribal_war',
    title: 'Tribal War',
    punchline: 'What did you say?',
    description: "",
    steps: {
            '1': "Draw the next card.{%; area_card() %} Circle denotes the Active Region {{ active_region }}.",
            '1.1': "Disregard event if there is no tribes. \
                    {% break_if(active_region.tribes == 0) %}",
            '2': "The amount of Tribes in the Active Region \
                becomes the base Warring Tribes amount \
                {% warring_tribes = active_region.tribes %}",
            '2.1': "Multiply the base Warring Tribes amount by 2.\
                {% warring_tribes = warring_tribes * 2 %} \
                {% neighbourCount = 2 %}\
                ",
            '3': "Select two neighboring regions with tribes (if possible). \
                {%; selectAreas() %}",
            '4': "Reduce Tribes in Active Region by 3.\
                 {% change({ 'tribes': '-3' }) %}"
    },
    selectAreas: function() {
        var ctx = this;
        var rdc = new reducer.Reducer(ctx.engine);
        rdc.startAmount = warring_tribes;
        rdc.areas = function() {
            var areas = {};
            if (this.visited.length == neighbourCount)
                return areas;
            var unvisitedngh = _.difference(ctx.active_region.neighbours, this.visited)
            _.each(_.pick(this.engine.map.areas, unvisitedngh), function(area, key) {
                if (area.tribes > 0)
                    areas[key] = area;
            });
            return areas;
        }
        rdc.reduce = function(area) {
            return { 'tribes': (-1*warring_tribes).toString() }
        }
        ctx.engine.reducer(rdc, function(chg) {
            ctx.changes = chg;
            ctx.done && ctx.done();
        });
    }
}