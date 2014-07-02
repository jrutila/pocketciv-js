module.exports = {
    name: 'famine',
    title: 'Famine',
    punchline: 'Famine is upon us!',
    description: "",
    steps: {
            '1': "{% area_card %}",
            '2.1': "In {{ Active Region|area }}, Decimate Tribes and Farms. Reduce City AV by 2. {% change = { tribes: '0', farm: false, city: '-2' } %}",
            '2.2': "{% if (adv(irrigation)) { %}2.2. If you have {{ adv:irrigation }}, do not Decimate Farms. Reduce City AV by 1 instead 2.{% change = { tribes: '0', city: '-1' } %}{% } %}",
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