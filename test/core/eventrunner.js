/*
describe('EventRunner', function() {
    beforeEach(function() {
        engine = pocketciv.Engine;
        runner = event.runEvent;
        engine.map.areas = {
            5: { id: 5 }
        }
    });
    describe('steps', function() {
        beforeEach(function() {
            engine.acquired = {}
        });
        it('should go through steps', function(done) {
            var ev = new function()
            {
                this.steps = {
                    '1': "{% active_region = 5 %}",
                    '2': "{% change({ 'tribes': '-1' }) %}"
                }
                return this;
            }();
            runner(engine, ev, {}, function(changes) {
                changes.should.deep.equal({ 5: { 'tribes': '-1'}});
                done();
            });
        });
        it('should merge the context', function(done) {
            var ev = new function()
            {
                this.steps = {
                    '1': "{% active_region = 10 %}",
                    '2': "{% run() %}",
                }
                this.run = function() {
                    this.active_region = 5;
                    this.change({ 'tribes': '-2'})
                }
                return this;
            }();
            runner(engine, ev, {}, function(changes) {
                changes.should.deep.equal({ 5: { 'tribes': '-2'}});
                done();
            });
        });
        it('should be able to use engine', function(done) {
            var ev = new function()
            {
                engine.gold = 5;
                this.steps = {
                    '1': "{% active_region = engine.gold %}",
                    '2': "{% change({ 'tribes': '-1' }) %}"
                }
                return this;
            }();
            runner(engine, ev, {}, function(changes) {
                changes.should.deep.equal({ 5: { 'tribes': '-1'}});
                done();
            });
        });
        it('should break if', function(done) {
            var ev = new function()
            {
                this.steps = {
                    '1': "{% active_region = 5 %}",
                    '2': "{% change({ 'tribes': '-1' }) %}",
                    '3': "{% break_if(active_region == 5) %}",
                    '4': "{% change({ 'tribes': '-5' }) %}",
                }
                return this;
            }();
            runner(engine, ev, {}, function(changes) {
                changes.should.deep.equal({ 5: { 'tribes': '-1'}});
                done();
            });
        });
        it('should support variables', function(done) {
            var ev = new function()
            {
                this.steps = {
                    '1': "{% var variable = 3 %}",
                    '2': "{% variable = 5 %}",
                    '3': "{% active_region = variable %}",
                    '4': "{% change({ 'tribes': '-1' }) %}",
                }
                return this;
            }();
            runner(engine, ev, {}, function(changes) {
                changes.should.deep.equal({ 5: { 'tribes': '-1'}});
                done();
            });
        });
        it('should sort the steps', function(done) {
            var ev = new function()
            {
                this.steps = {
                    '1.2': "{% active_region = 5 %}",
                    '1.1': "{% active_region = 3 %}",
                    '4': "{% change({ 'tribes': '-1' }) %}",
                }
                return this;
            }();
            runner(engine, ev, {}, function(changes) {
                changes.should.deep.equal({ 5: { 'tribes': '-1'}});
                done();
            });
        });
        it('should merge the advance steps', function(done) {
            var ev = new function()
            {
                this.name = "event1";
                this.steps = {
                    '1.2': "{% active_region = 4 %}",
                    '1.1': "{% active_region = 3 %}",
                    '4': "{% change({ 'tribes': '-1' }) %}",
                }
                return this;
            }();
            engine.advances = {
                'adv1': {
                    'events': {
                        'event1': {
                            'steps': {
                                '2': "{% active_region = 5 %}",
                            }
                        }
                    }
                }
            }
            engine.acquired = ['adv1']
            runner(engine, ev, {}, function(changes) {
                changes.should.deep.equal({ 5: { 'tribes': '-1'}});
                done();
            });
        });
        it('should support goto clause', function(done) {
            var ev = new function()
            {
                this.steps = {
                    '1.1': "{% active_region = 5 %}",
                    '1.2': "{% if (active_region == 5) goto('4') %}",
                    '1.3': "{% active_region = 3 %}",
                    '4': "{% change({ 'tribes': '-1' }) %}",
                }
                return this;
            }();
            runner(engine, ev, {}, function(changes) {
                changes.should.deep.equal({ 5: { 'tribes': '-1'}});
                done();
            });
        });
        it('should support final clause', function(done) {
            var ev = new function()
            {
                this.steps = {
                    '1.1': "{% active_region = 5 %}",
                    '1.2': "{% break_if(active_region == 5) %}",
                    '1.3': "{% active_region = 3 %}",
                    'final': "{% change({ 'tribes': '-1' }) %}",
                }
                return this;
            }();
            runner(engine, ev, {}, function(changes) {
                changes.should.deep.equal({ 5: { 'tribes': '-1'}});
                done();
            });
            
        })
    });
    it('should have area_card function', function(done) {
        engine.drawer = function(deck, done)
        {
            done({ 'circle': 5 });
        }
        engine.acquired = {}
        var ev = new function()
        {
            this.steps = {
                // {%; means that the step will call done by itself
                '1': "{%; area_card() %}",
                '4': "{% change({ 'tribes': '-1' }) %}",
            }
            return this;
        }();
        runner(engine, ev, {}, function(changes) {
            changes.should.deep.equal({ 5: { 'tribes': '-1'}});
            done();
        });
    });
})
*/