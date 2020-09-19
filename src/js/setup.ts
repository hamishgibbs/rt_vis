try {
  var d3 = require('d3')
}
catch(err) {}

interface setup {
  setupLayout(string, any): void;
  margin: any;
}

class setup extends rtVis {
  constructor (x) {
    super(x)

    this.margin = {top: 10, right: 30, bottom: 30, left: 60}
  }
  setupCountryTitle(root_element) {

    var ct = d3.select(root_element)
      .append('div')
      .attr('class', 'country-title-container')
      .attr('id', 'country-title-container')

  }
  setupMap(root_element){

    d3.select(root_element)
      .append('div')
      .attr('class', 'map-container')
      .attr('id', 'map-container')

  }
  setupDropDown(root_element){

    d3.select(root_element)
      .append('div')
      .attr('class', 'dropdown-container')
      .attr('id', 'dropdown-container')

  }
  setupRt(root_element){

    d3.select(root_element)
      .append('div')
      .attr('class', 'r0-title-container')
      .attr('id', 'r0-title-container')

    d3.select(root_element)
      .append('div')
      .attr('class', 'r0-ts-container')
      .attr('id', 'r0-ts-container')

  }
  setupCasesInfection(root_element){

    d3.select(root_element)
      .append('div')
      .attr('class', 'cases-infection-title-container')
      .attr('id', 'cases-infection-title-container')

    d3.select(root_element)
      .append('div')
      .attr('class', 'cases-infection-ts-container')
      .attr('id', 'cases-infection-ts-container')

  }
  setupCasesReport(root_element){

    d3.select(root_element)
      .append('div')
      .attr('class', 'cases-report-title-container')
      .attr('id', 'cases-report-title-container')

    d3.select(root_element)
      .append('div')
      .attr('class', 'cases-report-ts-container')
      .attr('id', 'cases-report-ts-container')

  }
  setupControls(root_element, eventHandlersRef, date_lims){

    d3.select(root_element)
      .append('div')
      .attr('class', 'controls-container')
      .attr('id', 'controls-container')

      //controls containers
      d3.select('#controls-container')
        .append('div')
        .attr('class', 'controls-container-legend')
        .attr('id', 'controls-container-legend')

      d3.select('#controls-container')
        .append('div')
        .attr('class', 'controls-container-time')
        .attr('id', 'controls-container-time')

      //legend item containers
      d3.select('#controls-container-legend')
        .append('div')
        .attr('class', 'legend-e')
        .attr('id', 'legend-e')

      d3.select('#controls-container-legend')
        .append('div')
        .attr('class', 'legend-eb')
        .attr('id', 'legend-eb')

      d3.select('#controls-container-legend')
        .append('div')
        .attr('class', 'legend-f')
        .attr('id', 'legend-f')

      //Legend items
      d3.select('#legend-e')
        .append('div')
        .style('width', '12px')
        .style('height', '12px')
        .attr('class', 'ts-legend-e')

      d3.select('#legend-e')
        .append('div')
        .text('Estimate')
        .attr('class', 'ts-legend-text')

      d3.select('#legend-eb')
        .append('div')
        .style('width', '12px')
        .style('height', '12px')
        .attr('class', 'ts-legend-eb')

      d3.select('#legend-eb')
        .append('div')
        .text('Estimate based on partial data')
        .attr('class', 'ts-legend-text')

      d3.select('#legend-f')
        .append('div')
        .style('width', '12px')
        .style('height', '12px')
        .attr('class', 'ts-legend-f')

      d3.select('#legend-f')
        .append('div')
        .text('Forecast')
        .attr('class', 'ts-legend-text')

      //controls buttons
      this.setupTimeControls(date_lims, '#controls-container-time')

      /*
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
      */

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
        //.attr('href', this.r0Url)
        .attr('target', '_blank')

      this.addButtonSpacer('#download-container')

      d3.select('#download-container')
        .append('a')
        .attr('class', 'download-button')
        .attr('id', 'download-casesInfection')
        .text('Cases by date of infection')
        //.attr('href', this.casesInfectionUrl)
        .attr('target', '_blank')

      this.addButtonSpacer('#download-container')

      d3.select('#download-container')
        .append('a')
        .attr('class', 'download-button')
        .attr('id', 'download-casesReport')
        .text('Cases by date of report')
        //.attr('href', this.casesReportUrl)
        .attr('target', '_blank')
  }
  setupTimeControls(date_lims, container_id){
    var svg_dims = document.getElementById(container_id).getBoundingClientRect()

    svg_dims.width = svg_dims.width - this.margin.left - this.margin.right;
    svg_dims.height = svg_dims.height - this.margin.top - this.margin.bottom;

    console.log(svg_dims)

  }
  setupFooter(root_element){

    d3.select(root_element)
      .append('div')
      .attr('class', 'footer')

  }
  addSourceSelect(root_element, id, elements, eventhandler, fullWidth){

    if (fullWidth === undefined){
      fullWidth = 1000
    }

    var div = d3.select(root_element)
      .append('select')
      .attr('class', id)
      .attr('id', id)
      .style('left', fullWidth + 'px')
      .on('change', eventhandler)

    var i
    for (i = 0; i < elements.length; i++) {
      div.append('option')
        .text(elements[i])
    }


  }
  addButtonSpacer(id) {
    d3.select(id)
      .append('div')
      .attr('class', 'button-spacer')
  }
}
