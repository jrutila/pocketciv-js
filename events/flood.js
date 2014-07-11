module.exports = {
    name: 'flood',
    title: 'Flood',
    punchline: 'Your floor is quite wet...',
    description: "",
    steps: {
            '1': "{% area_card %}",
            '2.1': "If the {{ Active Region|area }} neighbors the Sea then see TSUNAMI below",
            '2.2.1': "If the Active Region does not Neighbor the Sea: \
                    Reduce Tribes by 2 in the Active Region. \
                    Decimate Farms in the Active Region. \
                    Reduce City AV by 1 in the Active Region. \
                    Create a Forest in the Active Region.\
                    {% if (!('sea' in area.neighbours )) { %} \
                    {% change = {'tribes': '-2', 'farm': false, 'city': '-1', 'forest': true } %} \
                    {% } %}",
            '3': "TSUNAMI {% break_if(!('sea' in area.neighbours )) %}",
            '3.1': "Draw the next Event Card {% draw_card() %}. Using the symbols shown \
                    on the ORIGINAL Event card to the far right of the \
                    Flood event, add up the values in the symbols on the \
                    newly drawn card. The total value that this creates \
                    determines Damage. \
                    {% change = undefined %} \
                    {% damage = card_value(event.expr) %}",
            '3.2': "Each Region Neighboring the Sea (that neighbors \
the Active Region) is inflicted with this amount of \
Damage, and must have the following elements \
Reduced appropriately. Damage is inflicted on Tribes \
first, then any remaining Damage after all Tribes are \
Reduced is inflicted on City AV. If a City is \
Decimated, then remaining damage is inflicted on \
Wonders of your choice in the Region, one at a time. \
 \
1 Tribe = 1 Damage. {% dmgTr = 1 %} \
1 City AV = 2 Damage. {% dmgCt = 2 %} \
1 Wonder = 3 Damage. {% dmgWn = 3 %}",
            '-': "{% tsunami %}"
    },
    'tsunami': function() {
        console.log("Running TSUNAMI!")
        var ngh = neighbours(area);
        /*
            '-': "{% ngh = neighbours(area) %} \
                  {% for (var a in ngh) { %} \
                  {%  if ('sea' in ngh[a].neighbours) { %} \
                  {%   var tribes = Math.min(damage, dmgTr*ngh[a].tribes) %}
                  {%   var city = Math.min()
                  {%   changes[a]
                  {% }} %}
                  "
                  */
    },
}