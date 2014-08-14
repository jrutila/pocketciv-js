watch:
	watchify app/js/*.js advances/*.js actions/*.js events/*.js core/*.js -o app/bundle.js -dv &
	compass watch app
	
test:
	node test/test.js
	
autotest:
	supervisor -q -n exit -x make test
	
run:
	node web.js
        
.PHONY: test