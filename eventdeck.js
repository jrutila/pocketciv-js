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
        'circle': 6,
        'square': 4,
        'hexagon': 6,
        'ab': 'B',
        'friendly': true,
        'gold': 0,
        'events': {
            1: { name: 'flood', expr: 'c' },
            3: { name: 'visitation', visitor: 'atlantea', expr: '2*h' },
            4: { name: 'civil_war', expr: 'h' },
            5: { name: 'sandstorm' },
            6: { name: 'epidemic', expr: 'h+c' },
            8: { name: 'earthquake', expr: '3*s' },
        }
    },
    7: {
        'circle': 7,
        'square': 5,
        'hexagon': 7,
        'ab': 'A',
        'friendly': false,
        'gold': 1,
        'events': {
            2: { name: 'visitation', visitor: 'nordic', expr: 'h+s' },
            3: { name: 'anarchy' },
            4: { name: 'visitation', visitor: 'floren', expr: '2*h' },
            5: { name: 'uprising' },
            6: { name: 'anarchy' },
            7: { name: 'bandits', expr: '2*h' },
        }
    },
    8: {
        'circle': 8,
        'square': 6,
        'hexagon': 8,
        'ab': 'B',
        'friendly': false,
        'gold': 0,
        'events': {
            1: { name: 'sandstorm' },
            2: { name: 'tribal_war' },
            3: { name: 'visitation', visitor: 'floren', expr: '2*h' },
            4: { name: 'flood', expr: 's+c' },
            7: { name: 'visitation', visitor: 'atlantea', expr: '3*h' },
            8: { name: 'uprising' },
        }
    },
    9: {
        'circle': 1,
        'square': 7,
        'hexagon': 9,
        'ab': 'B',
        'friendly': true,
        'gold': 0,
        'events': {
            2: { name: 'volcano' },
            4: { name: 'visitation', visitor: 'gilda', expr: '3*s' },
            5: { name: 'volcano' },
            6: { name: 'corruption', expr: 's' },
            7: { name: 'superstition', expr: 'h' },
            8: { name: 'superstition', expr: 'h' },
        }
    },
    10: {
        'circle': 2,
        'square': 4,
        'hexagon': 10,
        'ab': 'A',
        'friendly': true,
        'gold': 0,
        'events': {
            1: { name: 'famine' },
            2: { name: 'famine' },
            3: { name: 'sandstorm' },
            5: { name: 'visitation', visitor: 'atlantea', expr: '3*h' },
            6: { name: 'uprising' },
            8: { name: 'bandits', expr: 'h+c+s' },
        }
    },
    11: {
        'circle': 3,
        'square': 5,
        'hexagon': 7,
        'ab': 'B',
        'friendly': false,
        'gold': 1,
        'events': {
            2: { name: 'visitation', visitor: 'nordic', expr: 'h+s' },
            4: { name: 'bandits', expr: '2*h' },
            5: { name: 'earthquake', expr: 'c+h' },
            6: { name: 'bandits', expr: '2*h+s' },
            7: { name: 'civil_war', expr: 'h' },
            8: { name: 'corruption', expr: 's' },
        }
    },
    12: {
        'circle': 4,
        'square': 6,
        'hexagon': 8,
        'ab': 'A',
        'friendly': false,
        'gold': 3,
        'events': {
            1: { name: 'visitation', visitor: 'gilda', expr: 'h' },
            3: { name: 'volcano' },
            4: { name: 'anarchy' },
            5: { name: 'flood', expr: '2*s+c' },
            6: { name: 'visitation', visitor: 'atlantea', expr: '2*h+s' },
            7: { name: 'volcano' },
        }
    },
    13: {
        'circle': 5,
        'square': 3,
        'hexagon': 9,
        'ab': 'B',
        'friendly': true,
        'gold': 3,
        'events': {
            2: { name: 'earthquake', expr: '2*c' },
            3: { name: 'tribal_war' },
            5: { name: 'bandits', expr: '2*h' },
            6: { name: 'civil_war', expr: 'h' },
            7: { name: 'visitation', visitor: 'nordic', expr: '2*h+s' },
            8: { name: 'superstition', expr: 's' },
            
        }
    },
    14: {
        'circle': 6,
        'square': 4,
        'hexagon': 7,
        'ab': 'A',
        'friendly': false,
        'gold': 0,
        'events': {
            1: { name: 'visitation', visitor: 'nordic', expr: 'h' },
            3: { name: 'earthquake', expr: '2*s' },
            4: { name: 'visitation', visitor: 'floren', expr: '2*h' },
            6: { name: 'volcano' },
            7: { name: 'famine' },
            8: { name: 'anarchy' },
        }
    },
    15: {
        'circle': 7,
        'square': 5,
        'hexagon': 8,
        'ab': 'B',
        'friendly': false,
        'gold': 2,
        'events': {
            2: { name: 'sandstorm' },
            3: { name: 'flood', expr: '2*s' },
            4: { name: 'sandstorm' },
            5: { name: 'anarchy' },
            6: { name: 'visitation', visitor: 'gilda', expr: 'c+h+s' },
            7: { name: 'visitation', visitor: 'floren', expr: 'c+h+s' },
            
        }
    },
    16: {
        'circle': 8,
        'square': 6,
        'hexagon': 6,
        'ab': 'A',
        'friendly': false,
        'gold': 2,
        'events': {
            1: { name: 'epidemic', expr: 's' },
            2: { name: 'flood', expr: 's' },
            4: { name: 'superstition', expr: 'c' },
            5: { name: 'visitation', visitor: 'nordic', expr: '2*h' },
            7: { name: 'anarchy' },
            8: { name: 'visitation', visitor: 'atlantea', expr: '2*h+s' }
        }
    },
};

module.exports = {
    EventDeck: eventDeck,
}