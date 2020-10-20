#Look for PWD in .env file
ifneq (,$(wildcard ./.env))
    include .env
    export
endif

R = /usr/local/bin/Rscript $^ $@

bump:
	cd ${WORK_DIR}/RtD3 && bash bump.sh

check: build_rmd.R
	make bump
	mkdir tmp
	$(R)

clean:
	rm -rf tmp
