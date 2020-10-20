#Look for PWD in .env file
ifneq (,$(wildcard ./.env))
    include .env
    export
endif

R = /usr/local/bin/Rscript $^ $@


bump:
	cd /Users/hamishgibbs/Documents/Covid-19/RtD3 && bash bump.sh

check: build_rmd.R
	mkdir tmp
	$(R)

clean:
	rm -rf tmp
