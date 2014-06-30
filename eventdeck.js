
var eventDeck = {
    1: {
        'circle': 1,
        'square': 7,
        'hexagon': 6,
        'ab': 'A',
        'friendly': true,
        'gold': 0,
        'events': {
            1: { name: 'tribal_war' },
            2: { name: 'epidemic', expr: 'h' },
            3: { name: 'famine' },
            4: { name: 'uprising' },
            6: { name: 'visitation', visitor: 'floren', expr: '2*h' },
            8: { name: 'corruption', expr: 'h' }
        }
    },
    2: {
        'circle': 2,
        'square': 4,
        'hexagon': 7,
        'ab': 'B',
        'friendly': false,
        'gold': 2,
        'events': {
            1: { name: 'volcano' },
            2: { name: 'tribal_war' },
            3: { name: 'corruption', expr: 'c' },
            5: { name: 'civil_war', expr: 'h' },
            6: { name: 'visitation', visitor: 'gilda', expr: 'c+h+s' },
            7: { name: 'earthquake', expr: '2*c+s' },
            8: { name: 'visitation', visitor: 'atlantea', expr: '3*h' }
        }
    },
    3: {
        'circle': 3,
        'square': 5,
        'hexagon': 8,
        'ab': 'A',
        'friendly': false,
        'gold': 1,
        'events': {
            2: { name: 'bandits', expr: 'h+s' },
            4: { name: 'epidemic', expr: 'c+s+h' },
            5: { name: 'visitation', visitor: 'atlantea', expr: '3*h' },
            7: { name: 'visitation', visitor: 'gilda', expr: 'c+h+s' },
            8: { name: 'civil_war', expr: 'h' },
        }
    },
    4: {
        'circle': 4,
        'square': 6,
        'hexagon': 7,
        'ab': 'B',
        'friendly': false,
        'gold': 2,
        'events': {
            1: { name: 'earthquake', expr: 'c' },
            3: { name: 'visitation', visitor: 'floren', expr: '2*h' },
            4: { name: 'superstition', expr: 'c' },
            6: { name: 'famine' },
            7: { name: 'uprising' },
            8: { name: 'visitation', visitor: 'nordic', expr: '2*h+s' },
        }
    },
    5: {
        'circle': 5,
        'square': 3,
        'hexagon': 9,
        'ab': 'A',
        'friendly': true,
        'gold': 1,
        'events': {
            3: { name: 'epidemic', expr: 'h' },
            4: { name: 'visitation', visitor: 'gilda', expr: '2*h' },
            5: { name: 'corruption', expr: 's' },
            6: { name: 'tribal_war' },
            7: { name: 'corruption', expr: 's' },
            8: { name: 'flood', expr: '2*s' },
        }
    },
    6: {
        'circle': 5,
        'square': 3,
        'hexagon': 9,
        'ab': 'A',
        'friendly': true,
        'gold': 1,
        'events': {}
    },
    7: {
        'circle': 5,
        'square': 3,
        'hexagon': 9,
        'ab': 'A',
        'friendly': true,
        'gold': 1,
        'events': {}
    },
    8: {
        'circle': 5,
        'square': 3,
        'hexagon': 9,
        'ab': 'A',
        'friendly': true,
        'gold': 1,
        'events': {}
    },
    9: {
        'circle': 5,
        'square': 3,
        'hexagon': 9,
        'ab': 'A',
        'friendly': true,
        'gold': 1,
        'events': {}
    },
    10: {
        'circle': 5,
        'square': 3,
        'hexagon': 9,
        'ab': 'A',
        'friendly': true,
        'gold': 1,
        'events': {}
    },
    11: {
        'circle': 5,
        'square': 3,
        'hexagon': 9,
        'ab': 'A',
        'friendly': true,
        'gold': 1,
        'events': {}
    },
    12: {
        'circle': 5,
        'square': 3,
        'hexagon': 9,
        'ab': 'A',
        'friendly': true,
        'gold': 1,
        'events': {}
    },
    13: {
        'circle': 5,
        'square': 3,
        'hexagon': 9,
        'ab': 'A',
        'friendly': true,
        'gold': 1,
        'events': {}
    },
    14: {
        'circle': 5,
        'square': 3,
        'hexagon': 9,
        'ab': 'A',
        'friendly': true,
        'gold': 1,
        'events': {}
    },
    15: {
        'circle': 5,
        'square': 3,
        'hexagon': 9,
        'ab': 'A',
        'friendly': true,
        'gold': 1,
        'events': {}
    },
    16: {
        'circle': 5,
        'square': 3,
        'hexagon': 9,
        'ab': 'A',
        'friendly': true,
        'gold': 1,
        'events': {}
    },
};

module.exports = {
    EventDeck: eventDeck,
}