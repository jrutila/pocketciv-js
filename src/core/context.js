var _ = require("underscore");

function PhaseContext(engine) {
    this.engine = engine;
    this.reset();
}

PhaseContext.prototype = {
    reset: function() {
        this.initial = {};
        this.targets = {};
        _.each(this.engine.map.areas, function(area, ak) {
            this.initial[ak] = _.clone(_.omit(area, 'neighbours'));
            this.targets[ak] = _.clone(_.omit(area, 'neighbours'));
        },this);
        this.initial.gold = this.engine.gold;
        this.targets.gold = this.engine.gold;
        this.params = this.engine.params;
    },
    init: function(key, value) { // Changes initial values in context
        if (!isNaN(parseInt(key)))
            _.extend(this.initial[key], value);
        else if (_.isString(key))
            this.initial[key] = value;
        else if (_.isObject(key)) {
            value = key;
            _.each(value, function(value, key) {
                this.initial(key, value);
            },this);
        } else {
            throw new Error("NotSupportedInitKey "+key);
        }
    },
    target: function(key, value) {
        if (!isNaN(parseInt(key)))
            _.extend(this.targets[key], value);
        else if (_.isString(key))
            this.targets[key] = value;
        else if (_.isObject(key)) {
            value = key;
            _.each(value, function(value, key) {
                this.target(key, value);
            },this);
        } else {
            throw new Error("NotSupportedTargetKey "+key);
        }
    },
    change: function(key, value) {
        if (!isNaN(parseInt(key))) {
            this.targets[key] = this._chn(this.targets[key], value);
        } else if (_.isString(key))
            this.targets[key] = this._chn(this.targets[key], value);
        else if (_.isObject(key)) {
            value = key;
            _.each(value, function(v,k) {
                this.change(k,v);
            },this);
        } else {
            throw new Error("NotSupportedChangeKey "+key);
        }
    },
    _chn: function(o, n) {
        if ((_.isNumber(o) || _.isUndefined(o)) && _.isNumber(n))
            return Math.max((o||0)+n, 0);
        else if (_.isObject(n)) {
            var ret = _.isObject(o) ? o : {};
            _.each(n, function(nn, nk) {
                if (nk == '+') {
                    ret = _.union(ret, nn);
                } else if (nk == '-') {
                    ret = _.difference(ret, nn);
                } else
                    ret[nk] = this._chn(_.isUndefined(o) ? o : o[nk], nn);
            },this);
            return ret;
        } else
            return n;
    },
    get changes() {
        return changes(this.initial, this.targets);
    }
}
function changes(initial, target) {
        var ret = {};
        var keys = _.union(_.keys(initial), _.keys(target));
        _.each(keys, function(key) {
            var val = target[key];
            if (_.isObject(val)) {
                ret[key] = {};
                _.each(val, function(v,k) {
                    if (_.isNumber(v)) {
                        var vv = v - (initial[key][k] || 0);
                        if (vv != 0) ret[key][k] = vv;
                    } else if (_.isBoolean(v)) {
                        var vv = v != (initial[key][k] || false);
                        if (vv) ret[key][k] = v;
                    } else if (_.isArray(v)) {
                        var plus = _.difference(v, initial[key][k]);
                        var minus = _.difference(initial[key][k], v);
                        if (plus.length == 0 && minus.length == 0)
                            return;
                        ret[key][k] = {};
                        if (plus.length > 0) ret[key][k]['+'] = plus;
                        if (minus.length > 0) ret[key][k]['-'] = minus;
                    }
                });
            }
            else if (_.isNumber(val))
                ret[key] = val - initial[key];
            else if (_.isBoolean(val))
                ret[key] = val;
                
            if ((_.isNumber(ret[key]) && ret[key] == 0) ||
                (!_.isNumber(ret[key]) && _.isEmpty(ret[key])))
                delete ret[key];
        },this);
        return ret;
    };

module.exports = {
    Context: PhaseContext,
    changes: changes,
}