all: npm client
.PHONY: npm mdlite clean

ROOT = ../..
OUT = ${ROOT}/out/client
BIN = ${ROOT}/node_modules/.bin
LIB = ${ROOT}/node_modules

npm:
	@npm install

client: npm ${OUT}/index.html

${OUT}/index.html: client.html client.js client.css \
                   ${OUT}/bundle.js ${OUT}/mdlite
	ln -s ${OUT} out
	${BIN}/vulcanize --inline-scripts --inline-css $< > $@
	rm out

${OUT}/bundle.js: client.js
	${BIN}/browserify $< | ${BIN}/uglifyjs - > $@

${OUT}/mdlite: ${LIB}/material-design-lite
	rm -rf $@
	mkdir $@
	cp -a $^/material.min.js $@
	cp -a $^/dist/material.indigo-deep_purple.min.css $@/material.min.css

clean:
	rm -rf ${OUT}/*
	touch ${OUT}/.gitinclude
