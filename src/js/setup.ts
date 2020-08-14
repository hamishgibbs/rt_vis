try {
  var d3 = require('d3')
}
catch(err) {}

interface setup {
  setupLayout(any): void;
}

class setup extends rtVis {
  setupLayout(eventHandlersRef){

    //component containers
    d3.select('#root')
      .append('div')
      .attr('class', 'map-container')
      .attr('id', 'map-container')

    d3.select('#map-container')
      .append('div')
      .attr('class', 'dropdown-container')
      .attr('id', 'dropdown-container')

    d3.select('#root')
      .append('div')
      .attr('class', 'title-container')
      .attr('id', 'title-container')

    d3.select('#root')
      .append('div')
      .attr('class', 'ts-container')
      .attr('id', 'ts-container')

    d3.select('#root')
      .append('div')
      .attr('class', 'controls-container')
      .attr('id', 'controls-container')

    //Solves a problem with rendering in Rmd
    d3.select('#root')
      .append('div')
      .attr('class', 'footer')

    d3.select('#root')
      .append('div')
      .attr('class', 'download-container')
      .attr('id', 'download-container')

    //controls containers
    d3.select('#controls-container')
      .append('div')
      .attr('class', 'controls-container-data')
      .attr('id', 'controls-container-data')

    d3.select('#controls-container')
      .append('div')
      .attr('class', 'controls-container-time')
      .attr('id', 'controls-container-time')

    //controls buttons
    d3.select('#controls-container-data')
      .append('button')
      .attr('class', 'control-button')
      .attr('id', 'control-r0')
      .text('R')
      .on('click', eventHandlersRef['r0ButtonClick'])

    this.addButtonSpacer('#controls-container-data')

    d3.select('#controls-container-data')
      .append('button')
      .attr('class', 'control-button')
      .attr('id', 'control-casesInfection')
      .text('Cases by date of infection')
      .on('click',  eventHandlersRef['casesInfectionButtonClick'])

    this.addButtonSpacer('#controls-container-data')

    d3.select('#controls-container-data')
      .append('button')
      .attr('class', 'control-button')
      .attr('id', 'control-casesReport')
      .text('Cases by date of report')
      .on('click',  eventHandlersRef['casesReportButtonClick'])

    d3.select('#controls-container-time')
      .append('button')
      .attr('class', 'control-button')
      .attr('id', 'control-allday')
      .text('All')
      .on('click',  eventHandlersRef['timeAllButtonClick'])

    this.addButtonSpacer('#controls-container-time')

    d3.select('#controls-container-time')
      .append('button')
      .attr('class', 'control-button')
      .attr('id', 'control-30day')
      .text('Previous Month')
      .on('click',  eventHandlersRef['time30ButtonClick'])

    this.addButtonSpacer('#controls-container-time')

    d3.select('#controls-container-time')
      .append('button')
      .attr('class', 'control-button')
      .attr('id', 'control-7day')
      .text('Previous 2 weeks')
      .on('click',  eventHandlersRef['time14ButtonClick'])

    this.addButtonSpacer('#controls-container-time')

    d3.select('#controls-container-time')
      .append('button')
      .attr('class', 'control-button')
      .attr('id', 'control-5day')
      .text('Previous 7 Days')
      .on('click',  eventHandlersRef['time7ButtonClick'])

    //Download buttons
    d3.select('#download-container')
      .append('div')
      .text('Download data:')

    this.addButtonSpacer('#download-container')

    d3.select('#download-container')
      .append('a')
      .attr('class', 'download-button')
      .attr('id', 'download-r0')
      .text('R')
      .attr('href', this.r0Url)
      .attr('target', '_blank')

    this.addButtonSpacer('#download-container')

    d3.select('#download-container')
      .append('a')
      .attr('class', 'download-button')
      .attr('id', 'download-casesInfection')
      .text('Cases by date of infection')
      .attr('href', this.casesInfectionUrl)
      .attr('target', '_blank')

    this.addButtonSpacer('#download-container')

    d3.select('#download-container')
      .append('a')
      .attr('class', 'download-button')
      .attr('id', 'download-casesReport')
      .text('Cases by date of report')
      .attr('href', this.casesReportUrl)
      .attr('target', '_blank')

  }
  addButtonSpacer(id) {
    d3.select(id)
      .append('div')
      .attr('class', 'button-spacer')
  }
}
