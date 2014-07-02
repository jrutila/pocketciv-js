module.exports = {
    name: 'anarchy',
    title: 'Anarchy',
    punchline: 'We are tired of those cities!',
    description: "",
    steps: {
            '1': "In {{ any Region|{% select_areas(function(a) { return a.city > 0 && a.tribes > a.city }) %} }} \
            where the amount of Tribes is greater \
            than the City AV, Reduce the City AV by 1 and \
            Reduce Tribes by 3. Continue to Reduce Tribes and \
            City AV’s this way until the City AV is 1, or until \
            amount of Tribes is less than the City AV.\
            {% tribeCount = 3 %}",
            '-': "\
            {% for (var ar in areas) { %} \
            {% var a = areas[ar].id %} \
            {% changes[a] = { 'tribes': 0, 'city': 0 } %} \
            {% do { %} \
            {%   changes[a].tribes -= tribeCount %} \
            {%   changes[a].city -= 1 %} \
            {% } while (areas[ar].city + changes[a].city > 1 && areas[ar].tribes + changes[a].tribes > areas[ar].city + changes[a].city) %} \
            {% changes[a].tribes = changes[a].tribes.toString() %} \
            {% changes[a].city = changes[a].city.toString() %} \
            {% } %} \
            ",
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