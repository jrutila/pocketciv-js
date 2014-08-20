test:
	node test/test.js
	
autotest:
	supervisor -q -n exit -x make test