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
            '3.2': "Reduce total Tribes in the Affected Regions by the \
                value of your Collateral Damage. \
                {%; reduce('tribes', collateralDamage, areas) %}",
    },
    cityReduce: function() {
        var act = this.active_region
        if (act.city <= activeCityReduce)
            this.changes[act.id] = { 'city': cityMin.toString() }
        else
            this.changes[act.id] = { 'city': activeCityReduce.toString()  }
         
        areas = this.neighbours(act)
        for (var ar in areas) {
            var a = areas[ar]
            if (a.city <= neighbourCityReduce)
             this.changes[a.id] = { 'city': cityMin.toString() }
            else
             this.changes[a.id] = { 'city': neighbourCityReduce.toString() }
            areas[act.id] = this.active_region;
        }
    }
}