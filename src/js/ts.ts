try {
  var d3 = require('d3')
}
catch(err) {}

interface ts {
  margin: any
}

class ts extends rtVis {
  constructor (x) {
    super(x)
    this.margin = {top: 10, right: 30, bottom: 30, left: 60}
  }
  plotTs(rtData, country, time, cases_data, container_id, runDate = undefined, r0 = false) {

    d3.select("#" + container_id + '-svg').remove()
    d3.select('#' + container_id + '-tooltip').remove()

    rtData = rtData.filter(a=>a['region']==country)

    try {
      cases_data = cases_data.filter(a=>a['region']==country)
    } catch {}

    try {
      if (!r0){
          var max_observed_cases = d3.max(cases_data, function(d) { return parseFloat(d.confirm); });
      } else {
          var max_observed_cases = null;
      }
    } catch {
      var max_observed_cases = null;
    }


    var parseTime = d3.timeParse("%Y-%m-%d");

    var ts_svg = d3.select("#" + container_id)
      .append('svg')
      .attr('class', container_id + '-svg')
      .attr('id', container_id + '-svg')
      .style("width", '100%')
      .style("height", '100%')
      .append("g")
      .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")")

    var ts_svg_dims = document.getElementById(container_id).getBoundingClientRect()

    ts_svg_dims.width = ts_svg_dims.width - this.margin.left - this.margin.right;
    ts_svg_dims.height = ts_svg_dims.height - this.margin.top - this.margin.bottom;

    var minDate = d3.min(rtData, function(d) {return parseTime(d.date); });

    if (time === '7d'){
      minDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    } else if (time === '14d') {
      minDate = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    } else if (time === '30d') {
      minDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }

    rtData = rtData.filter(a=>parseTime(a['date'])>=minDate)

    try {
      cases_data = cases_data.filter(a=>d3.timeDay.offset(parseTime(a['date']), -1)>=minDate)
    } catch {}


    if (rtData.length === 0){
      ts_svg.append('text')
        .attr('x', ts_svg_dims.width / 2)
        .attr('y', ts_svg_dims.height / 2)
        .text('No data')
        .style('font-size', '20px')
        .style('stroke-width', 0)
        .style('fill', 'gray')

      return

    }

    var maxDate = d3.max(rtData, function(d) { return parseTime(d.date); });

    try {
      var cases_max = d3.max(cases_data, function(d) { return parseFloat(d.confirm); });
    } catch {}

    var ymax = d3.max(rtData, function(d) { return parseFloat(d.upper_90); });

    if (!r0){
      try {
        ymax = this.gt_max_observed_cases(d3.max([ymax, cases_max]), max_observed_cases)
      } catch {}
    }

    var y = d3.scaleLinear()
                .domain([0,ymax])
                .range([ts_svg_dims.height, 0]);

    var x = d3.scaleTime()
                .domain([minDate,maxDate])
                .range([0, ts_svg_dims.width]);

    var line = d3.line()
      .x(function(d){ return x(parseTime(d['date'])); })
      .y(function(d){ return y(1); })
      .curve(d3.curveCardinal);

    var estimate_data = rtData.filter(a=>a['type']=='estimate')
    var estimate_b_data = rtData.filter(a=>a['type']=='estimate based on partial data')
    var forecast_data = rtData.filter(a=>a['type']=='forecast')



    var poly_90 = this.plotHPoly('date', 'upper_90', 'lower_90', x, y, parseTime, max_observed_cases, this.gt_max_observed_cases)
    var poly_50 = this.plotHPoly('date', 'upper_50', 'lower_50', x, y, parseTime, max_observed_cases, this.gt_max_observed_cases)


    if (!r0){
      try {
        ts_svg.selectAll('rect')
          .data(cases_data)
          .enter()
          .append('rect')
          .attr('x', function(d, i) {return x(d3.timeDay.offset(parseTime(d.date), -0.5));})
          .attr("width", function(d) {return 0.8 * (x(d3.timeDay.offset(parseTime(d.date), 1)) - x(parseTime(d.date)))})
          .attr("height", 0)
          .attr("y", ts_svg_dims.height)
          .transition()
          .duration(250)
          .delay(function (d, i) {
  				  return i * 4;
  			  })
          .attr('height', function(d, i) {return ts_svg_dims.height - y(d.confirm);})
          .attr('y', function(d, i) {return y(d.confirm);})
          .attr('class', 'cases_bar');
      } catch {}
    }

    ts_svg.append("path")
      .datum(estimate_data)
      .attr("d", poly_90)
      .attr("class", 'poly_90_e')

    ts_svg.append("path")
      .datum(estimate_b_data)
      .attr("d", poly_90)
      .attr("class", 'poly_90_eb')

    ts_svg.append("path")
      .datum(forecast_data)
      .attr("d", poly_90)
      .attr("class", 'poly_90_f')

    ts_svg.append("path")
      .datum(estimate_data)
      .attr("d", poly_50)
      .attr("class", 'poly_50_e')

    ts_svg.append("path")
      .datum(estimate_b_data)
      .attr("d", poly_50)
      .attr("class", 'poly_50_eb')

    ts_svg.append("path")
      .datum(forecast_data)
      .attr("d", poly_50)
      .attr("class", 'poly_50_f')

    if (r0) {
      ts_svg.append("path")
        .datum(rtData)
        .attr("d", line)
        .attr("class", 'r0_line')
        .style('stroke', 'black')
        .style('stroke-dasharray', "5,5")
    }

    ts_svg.append("g")
       .attr("transform","translate(0,"+ ts_svg_dims.height +")")
       .call(d3.axisBottom(x))
       .attr("class",'r0-xaxis');

    ts_svg.append("g")
      .call(d3.axisLeft(y))
      .attr("class", 'r0-yaxis');

    ts_svg.append('line')
      .attr('id', container_id + '-hover-line')
      .attr("x1", 20)
      .attr("y1", 0)
      .attr("x2", 20)
      .attr("y2", ts_svg_dims.height)
      .attr('stroke', 'black')
      .attr('stroke-width', '1px')
      .attr('stroke-opacity', 0);

    if(typeof(runDate) !== 'undefined'){
      ts_svg.append('line')
        .attr('id', 'run-date-line')
        .attr("x1", x(parseTime(runDate)))
        .attr("y1", 0)
        .attr("x2", x(parseTime(runDate)))
        .attr("y2", ts_svg_dims.height)
        .attr('stroke', 'lightgrey')
        .style('stroke-dasharray', "5,5")
    }

    var tooltip = d3.select("#" + container_id)
      .append("div")
      .style("opacity", 0)
      .attr("class", container_id + '-tooltip')
      .attr('id', container_id + '-tooltip')
      .style("background-color", "white")
      .style("border", "solid")
      .style("border-width", "2px")
      .style("border-radius", "5px")
      .style("padding", "5px")
      .style('font-size', '9pt')
      .style('overflow', 'visible')
      .style('position', 'relative')
      .style('display', 'inline-block')
      //.style('border-bottom', '2px black')

    function tsMouseIn(e) {

      d3.select('#' + container_id + '-tooltip')
        .style("opacity", 1)

      d3.select('#' + container_id + '-hover-line')
        .attr('stroke-opacity', 1)
    }

    function tsMouseOut(e) {

      d3.select('#' + container_id + '-tooltip')
        .style("opacity", 0)

      d3.select('#' + container_id + '-hover-line')
        .attr('stroke-opacity', 0)
    }

    var floatFormat = /\B(?=(\d{3})+(?!\d))/g
    var gt_max_observed_cases = this.gt_max_observed_cases

    function tsMouseMove(){

      d3.select('#' + container_id + '-hover-line')
        .attr('x1', d3.mouse(this)[0])
        .attr('x2', d3.mouse(this)[0])

      var mousedata = rtData.filter(a=>parseTime(a['date']).toDateString()==x.invert(d3.mouse(this)[0]).toDateString());

      var tooltip_str = '<b>' + parseTime(mousedata[0]['date']).toDateString() + '</b>' +
          '<br>' +
          '50% CI: ' + parseFloat(gt_max_observed_cases(mousedata[0]['lower_50'], max_observed_cases)).toString().replace(floatFormat, ",") + ' to ' + parseFloat(gt_max_observed_cases(mousedata[0]['upper_50'], max_observed_cases)).toString().replace(floatFormat, ",") +
          '<br>' +
          '90% CI: ' + parseFloat(gt_max_observed_cases(mousedata[0]['lower_90'], max_observed_cases)).toString().replace(floatFormat, ",") + ' to ' + parseFloat(gt_max_observed_cases(mousedata[0]['upper_90'], max_observed_cases)).toString().replace(floatFormat, ",")

      var x_offset

      if (ts_svg_dims.width - d3.mouse(this)[0] < 80){
        x_offset = -70
      } else {
        x_offset = 70
      }

      tooltip.html(tooltip_str)
        .style("left", (d3.mouse(this)[0] + x_offset) + "px")
        .style("top", (d3.mouse(this)[1] - 200) + "px")

    }

    ts_svg.append("rect")
      .attr("class", "overlay")
      .attr("width", ts_svg_dims.width)
      .attr("height", ts_svg_dims.height)
      .on('mousemove', tsMouseMove)
      .on('mouseenter', tsMouseIn)
      .on('mouseout', tsMouseOut)
      .attr('fill-opacity', '0')

  }
  plotAllTs(country, time, data, activeSource, runDate = undefined) {

    this.tsCountryTitle(country, 'country-title-container')

    if (data['rtData'][activeSource]['rtData'] !== null){
      this.plotTs(data['rtData'][activeSource]['rtData'], country, time, data['rtData'][activeSource]['obsCasesData'], 'r0-ts-container', runDate, true)
      this.tsDataTitle('R', 'r0-title-container')
    }

    if (data['rtData'][activeSource]['casesInfectionData'] !== null){
      this.plotTs(data['rtData'][activeSource]['casesInfectionData'], country, time, data['rtData'][activeSource]['obsCasesData'], 'cases-infection-ts-container', runDate, false)
      this.tsDataTitle('Cases by date of infection', 'cases-infection-title-container')
    }

    if (data['rtData'][activeSource]['casesReportData'] !== null){
      this.plotTs(data['rtData'][activeSource]['casesReportData'], country, time, data['rtData'][activeSource]['obsCasesData'], 'cases-report-ts-container', runDate, false)
      this.tsDataTitle('Cases by date of report', 'cases-report-title-container')
    }

  }
  tsDataTitle (dataset, container_id) {

    d3.select("#" + container_id).text(dataset)

  }
  tsCountryTitle (country, container_id){

    try {

      if (Object.keys(this._subregional_ref).includes(country)){

        var text = '<a href="' + this._subregional_ref[country] + '" target="_blank" style="font-size:14px;">Detailed estimates available</a>'
      } else {
        text = ''
      }
    } catch {}

    d3.select("#" + container_id).html(country)

    try {
      d3.select("#" + container_id).append('div').attr('id', 'subregional-link').html(text)
    } catch {}


  }
  plotHPoly (x, y0, y1, x_scale, y_scale, parseTime = null, max_observed_cases, gt_max_observed_cases){

      if (parseTime !== null) {
        var poly = d3.area()
            .x(function(d) { return x_scale(parseTime(d[x])) })
            .y0(function(d) { return y_scale(gt_max_observed_cases(d[y0], max_observed_cases)) })
            .y1(function(d) { return y_scale(gt_max_observed_cases(d[y1], max_observed_cases)) })
      } else {
        var poly = d3.area()
            .x(function(d) { return x_scale(d[x]) })
            .y0(function(d) { return y_scale(gt_max_observed_cases(d[y0], max_observed_cases)) })
            .y1(function(d) { return y_scale(gt_max_observed_cases(d[y1], max_observed_cases)) })
      }

      return(poly)
  }
  gt_max_observed_cases(x, max_observed_cases){
    if (max_observed_cases !== null) {
      if (x >=  max_observed_cases * 10){
        return (max_observed_cases * 10)
      } else {
        return (x)
      }
    } else {
      return(x)
    }
  }
};
