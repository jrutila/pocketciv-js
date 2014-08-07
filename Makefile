build:
	browserify app/js/*.js advances/*.js actions/*.js events/*.js core/*.js -o bundle.js
	bower install -q
	export GEM_HOME=$PWD/gems
	mkdir -p $GEM_HOME
	gem install compass
	$GEM_HOME/bin/compass compile app || echo "No compass"
	
watch:
	watchify app/js/*.js advances/*.js actions/*.js events/*.js core/*.js -o bundle.js -dv &
	compass watch app
	
test:
	node test/test.js
	
autotest:
	supervisor -q -n exit -x make test
	
run:
	node web.js
        
.PHONY: test