module.exports = {
    name: 'corruption',
    title: 'Corruption',
    punchline: 'Here\'s your money',
    description: "",
    steps: {
            '1': "Draw the next event card {% draw_card %}. Using the symbols shown \
            on the ORIGINAL Event card to the far right of the \
            Corruption event, add up the values in the symbols on \
            the newly drawn card. The total value that this creates \
            determines your amount of Corruption.",
            '1.0': '{% corruption = card_value(event.expr) %}',
            '2': "Reduce City AVs throughout your Empire equal to \
            the amount of Corruption. You may choose which \
            Cities to reduce. Any City Reduced to 0 AV is \
            Decimated. {% reduce('city', corruption) %}",
            '3': "Decimate all Gold you currently have.",
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