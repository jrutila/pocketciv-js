module.exports = {
    name: 'civil_war',
    title: 'Civil War',
    punchline: 'Yo, bro! I\'m tired of your face!',
    description: "",
    steps: {
            '1': "{% area_card %}",
            '2': "All City AVs in the {{Active Region|area}} and \
                in {{ Neighboring Regions|neighbours(area) }} are reduced by 2.\
                Cities reduced to 0 are decimated.\
                {% areaCityReduce = -2; neighbourCityReduce = -2; cityMin = 0; %}",
            '3': "Draw the next card {% draw_card %}.",
            '3.1': "The number in the BLUE HEX indicates\
                your collateral damage. {% collateralDamage = card_value('h') %}",
            '-': "\
            {% if (area.city <= areaCityReduce) { %}\
            {%  changes[area.id] = { 'city': cityMin.toString() } %}\
            {% } else { %}\
            {%  changes[area.id] = { 'city': areaCityReduce.toString() } %}\
            {% }  %}\
            {% areas = neighbours(area) %}\
            {% for (var ar in areas) { %} \
            {% var a = areas[ar] %} \
            {% if (a.city <= neighbourCityReduce) { %}\
            {%  changes[a.id] = { 'city': cityMin.toString() } %}\
            {% } else { %}\
            {%  changes[a.id] = { 'city': neighbourCityReduce.toString() } %}\
            {% }  %}\
            {% } %}\
            {% areas[area.id] = area %}",
            '--': "{%= reduce('tribes', collateralDamage, areas) %}",
    }
}
    /*
    
    run: function(engine, event) {
        console.log("Famine is upon us!")
        engine.drawer(engine.deck, function(card) {
            var area_id = card.circle;
            if (area_id in engine.map.areas)
            {
                var area = engine.map.areas[area_id];
                // TODO: Irrigation city: -1
                engine.areaChange(area, { 'tribes': '0', 'city': '-2' });
            }
        });
    }
    */