var reducer = require('../core/reducer');
var _ = require('underscore');

module.exports = {
    name: 'bandits',
    title: 'Bandits',
    punchline: '',
    description: "",
    steps: {
            '1': "Draw the next card.{%; area_card() %} Circle denotes the Active Region {{ active_region }}.",
            '2': "If the Active Region, or a Neighboring Region, \
contains a Desert, you are being Attacked by Bandits. \
Otherwise, disregard the Bandit Event. {% break_if(!is_there_desert())  %}",
            '3': "{% evexpr = event.expr %}\
            Draw the next Event Card {%; draw_card() %}.",
            '4': "Using the symbols shown \
                    on the ORIGINAL Event card ({{ event.expr }}) . The total value that this creates \
                    {% attack_force = card_value(evexpr) %} \
                    determines the Attacking Force {{ attack_force }}.",
            'include': 'attack'
    },
    is_there_desert: function() {
        if (this.active_region.desert)
            return true;
        var ret = false;
        _.each(this.active_region.neighbours, function(n) {
            var ngh = this.engine.map.areas[n];
            if (ngh && ngh.desert)
                ret = true;
        });
        return ret;
    },
}
