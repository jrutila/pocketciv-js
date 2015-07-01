var _ = require('underscore')
module.exports = {
    name: 'civil_war',
    title: 'Civil War',
    punchline: 'Yo, bro! I\'m tired of your face!',
    description: "",
    steps: {
            '1': "Draw the next card.{%; area_card() %} Circle denotes the Active Region {{ active_region }}.",
            '2': "All City AVs in the Active Region {{ active_region }} and \
                in Neighboring Regions {{ neighbours(active_region) }} are reduced by 2.\
                Cities reduced to 0 are decimated.\
                {% activeCityReduce = -2; neighbourCityReduce = -2; cityMin = 0; %}",
            '3': "{% cityReduce() %} Draw the next card. {%; draw_card() %}",
            '3.1': "The number in the BLUE HEX indicates\
                your collateral damage. {% collateralDamage = card_value('h') %}",
            '4': "Reduce total Tribes in the Affected Regions by the \
                value of your Collateral Damage {{ collateralDamage }}.",
            '-': "{%; reduce('tribes', collateralDamage, areas) %}",
    },
    cityReduce: function() {
        var ctx = this;
        
        var act = this.active_region
        var ak = act.id;
        
        if (act.city > 0)
            ctx.target({city: Math.max(this.initial[ak].city + activeCityReduce, cityMin)},this.active_region);
         
        areas = this.neighbours(this.active_region)
        _.each(areas, function(area, nk) {
            if (area.city > 0)
                ctx.target({city:Math.max(this.initial[nk].city + neighbourCityReduce, cityMin)}, area);
        },this);
        areas[ak] = this.active_region;
    }
}