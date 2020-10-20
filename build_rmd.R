Sys.setenv(RSTUDIO_PANDOC = "/Applications/RStudio.app/Contents/MacOS/pandoc")
rmarkdown::render('test.Rmd', output_file = 'tmp/test.html')
