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

    this.margin = {top: 0, right: 40, bottom: 10, left: 50}
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

  setupDownload(root_element, downloadUrl, fullWidth) {

    d3.select(root_element)
      .append('div')
      .attr('class', 'download-container')
      .attr('id', 'download-container')
      .style('left', fullWidth + 'px')
      .append('a')
      .attr("href", downloadUrl)
      .attr('target', '_blank')
      .text('Download Data')

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

      //time control
      this.setupTimeControls(date_lims, 'controls-container-time', eventHandlersRef['timeBrush'])

  }
  setupTimeControls(date_lims, container_id, date_handler){

    var svg_dims = document.getElementById(container_id).getBoundingClientRect()

    svg_dims.width = svg_dims.width - this.margin.left - this.margin.right;
    svg_dims.height = svg_dims.height - this.margin.top - this.margin.bottom;

    var svg = d3.select('#' + 'controls-container-time')
      .append('svg')
      .attr('class', container_id + '-svg')
      .attr('id', container_id + '-svg')
      .style("width", '100%')
      .style("height", '100%')
      .append("g")
      .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")")

    var x = d3.scaleTime()
      .domain([date_lims[0], date_lims[1]])
      .range([0, svg_dims.width]);

    var y = d3.scaleLinear()
      .domain([0,1])
      .range([svg_dims.height, 0]);

    svg.append("g")
       .attr("transform","translate(0,"+ svg_dims.height +")")
       .call(d3.axisBottom(x).tickSize([0]))
       .attr("class",'time-xaxis');

    svg.append("g")
      .call(d3.axisLeft(y))
      .attr("class", 'r0-yaxis')
      .style('display', 'none');

    const brush = d3.brushX()
      .extent([[this.margin.left, this.margin.top], [svg_dims.width - this.margin.right, svg_dims.height - this.margin.bottom]])
      .on("start end", brushed);

    svg.call(d3.brushX()
        .extent( [ [0,0], [svg_dims.width, svg_dims.height] ] ).on("start brush end", brushed))

    function brushed(e) {
      var maxDate = d3.select(d3.selectAll('.handle--e')._groups[0][0]).attr('x')
      var minDate = d3.select(d3.selectAll('.handle--w')._groups[0][0]).attr('x')


      if ((maxDate - minDate) <= 4){
        date_handler([date_lims[0], date_lims[1]])
      } else {
        date_handler([x.invert(minDate), x.invert(maxDate)])
      }

    }

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
