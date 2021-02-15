.PHONY: test build

start:
	node start.js & http-server build

build: test
	node build.js run

test:
	node --experimental-vm-modules test/test-build.js
	node test/test-router-2.js
