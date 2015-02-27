var _ = require('underscore');

module.exports = {
    name: 'trade',
    title: 'Trade',
    steps: {
        '1': "Draw the next Event card {%; draw_card() %}. Increase the amount of \
              Gold you currently have by the value in the RED CIRCLE. {% change('gold', card_value('c')) %} ",
    },
};
