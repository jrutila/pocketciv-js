var pocketciv = require("../core/pocketciv")
var playFile = process.argv[2];
var play = require("./plays/" + playFile)
var _ = require("underscore")
var expect = require("chai").expect
var runplay = require("../core/runplay")

var engine = pocketciv.Engine;

function check(final, chk, path) {
    if (!path) path = "";
    _.each(chk, function(v, k) {
        mpath = path + '-' + k;
        if (_.isObject(v)) check(final[k], v, mpath);
        else {
            if (v[0] == "X") eval("expect(final[k], mpath)" + v.substring(1))
            else expect(final[k], mpath).to.equal(v);
        }
    })
}

try {
    runplay.run(engine, play);
}
catch (e) {
    if (e == "END") {
        console.log('ENDED')
        check(engine, play.check);
    }
    else throw e
}