var reducer = require('../core/reducer')
var _ = require('underscore')

module.exports = {
    name: 'flood',
    title: 'Flood',
    punchline: 'Your floor is quite wet...',
    description: "",
    steps: {
            '1': "Draw the next card.{%; area_card() %} Circle denotes the Active Region {{ active_region }}.",
            '2': "If the {{ Active Region|active_region}} neighbors the Sea then see Tsunami below.\
                  {% if (active_region.neighbours.indexOf('sea') > -1) goto('3') %}",
            '2.1': "If the Active Region does not Neighbor the Sea: \
                    Reduce Tribes by 2 in the Active Region. \
                    Decimate Farms in the Active Region. \
                    Reduce City AV by 1 in the Active Region. \
                    Create a Forest in the Active Region.\
                    {% change({'tribes': '-2', 'farm': false, 'city': '-1', 'forest': true }) %}",
            '3': "Tsunami {% break_if(active_region.neighbours.indexOf('sea') == -1) %}",
            '3.1': "Draw the next Event Card {%; draw_card() %}. Using the symbols shown \
                    on the ORIGINAL Event card ({{ event.expr }}). The total value that this creates \
                    {% damage = card_value(event.expr) %} \
                    determines Damage {{ damage }}.",
            '3.2': "Each Region Neighboring the Sea (that neighbors \
                        the Active Region) is inflicted with this amount of \
                        Damage, and must have the following elements \
                        Reduced appropriately. Damage is inflicted on Tribes \
                        first, then any remaining Damage after all Tribes are \
                        Reduced is inflicted on City AV. If a City is \
                        Decimated, then remaining damage is inflicted on \
                        Wonders of your choice in the Region, one at a time. \
                        {% changes = {} %} \
                         \
                        <ul> \
                        <li>1 Tribe = 1 Damage{% dmgTr = 1 %}</li> \
                        <li>1 City AV = 2 Damage{% dmgCt = 2 %}</li> \
                        <li>1 Wonder = 3 Damage{% dmgWn = 3 %}</li></ul>",
            '-': "{% tsunami() %}"
    },
    'tsunami': function() {
        var active = this.active_region;
        var seas = _.filter(this.active_region.neighbours, reducer.isSea);
        var ngh = _.pick(this.engine.map.areas, function(area, ak) {
            return _.contains(active.neighbours, parseInt(ak)) &&
                    _.size(_.intersection(
                    _.filter(area.neighbours, reducer.isSea),
                    seas)) > 0;
        },this);
        
        // Also the actual active region
        ngh[active.id] = this.active_region;
        _.each(ngh, function(area) {
            var dmg = damage;
            var tribes = Math.min(Math.ceil(dmg/dmgTr), Math.ceil(area.tribes/dmgTr))
            dmg -= tribes*dmgTr;
            //console.log(area.id+ ' ' +Math.ceil(dmg/dmgCt) +' '+ Math.ceil(area.city/dmgCt))
            var city = Math.min(Math.ceil(dmg/dmgCt), Math.ceil(area.city/dmgCt))
            dmg -= city*dmgCt;
            // TODO: Wonders!
            if (tribes)
                this.change({tribes:-1*tribes}, area);
            if (city)
                this.change({city:-1*city}, area);
        },this);
    },
}