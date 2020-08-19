try {
  var d3 = require('d3')
}
catch(err) {}

interface ts {
  margin: any
}

class ts extends rtVis {
  constructor () {
    super()
    this.margin = {top: 10, right: 30, bottom: 30, left: 60}
  }
  plotTs(rtData, country, time, cases_data, container_id, r0 = false) {

    d3.select("#" + container_id + '-svg').remove()
    d3.select('#' + container_id + '-tooltip').remove()

    rtData = rtData.filter(a=>a['country']==country)
    cases_data = cases_data.filter(a=>a['region']==country)

    var parseTime = d3.timeParse("%Y-%m-%d");

    var ts_svg = d3.select("#" + container_id)
      .append('svg')
      .attr('class', container_id + '-svg')
      .attr('id', container_id + '-svg')
      .style("width", '100%')
      .style("height", '100%')
      .append("g")
      .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

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
    cases_data = cases_data.filter(a=>d3.timeDay.offset(parseTime(a['date']), -1)>=minDate)

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

    var ymax = d3.max(rtData, function(d) { return parseFloat(d.upper_90); });

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

    var poly_90 = this.plotHPoly('date', 'upper_90', 'lower_90', x, y, parseTime)
    var poly_50 = this.plotHPoly('date', 'upper_50', 'lower_50', x, y, parseTime)


    if (!r0){
      ts_svg.selectAll('rect')
        .data(cases_data)
        .enter()
        .append('rect')
        .attr('height', function(d, i) {return ts_svg_dims.height - y(d.confirm);})
        .attr('y', function(d, i) {return y(d.confirm);})
        .attr("width", function(d) {return x(d3.timeDay.offset(parseTime(d.date), 1)) - x(parseTime(d.date))})
        .attr('x', function(d, i) {return x(d3.timeDay.offset(parseTime(d.date), -0.5));})
        .attr('class', 'cases_bar');
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

    function tsMouseMove(){

      d3.select('#' + container_id + '-hover-line')
        .attr('x1', d3.mouse(this)[0])
        .attr('x2', d3.mouse(this)[0])

      var mousedata = rtData.filter(a=>parseTime(a['date']).toDateString()==x.invert(d3.mouse(this)[0]).toDateString());

      var tooltip_str = '<b>' + parseTime(mousedata[0]['date']).toDateString() + '</b>' +
          '<br>' +
          '50% CI: ' + parseFloat(mousedata[0]['lower_50']) + ' to ' + parseFloat(mousedata[0]['upper_50']) +
          '<br>' +
          '90% CI: ' + parseFloat(mousedata[0]['lower_90']) + ' to ' + parseFloat(mousedata[0]['upper_90'])


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
  plotAllTs(country, time, data) {

    var newData = this.preprocessDataSets(country, data)

    console.log(newData)

    this.tsCountryTitle(country, 'country-title-container')

    this.plotTs(newData[2], country, time, newData[5], 'r0-ts-container', true)
    this.tsDataTitle('R', 'r0-title-container')

    this.plotTs(newData[3], country, time, newData[5], 'cases-infection-ts-container', false)
    this.tsDataTitle('Cases by date of infection', 'cases-infection-title-container')

    this.plotTs(newData[4], country, time, newData[5], 'cases-report-ts-container', false)
    this.tsDataTitle('Cases by date of report', 'cases-report-title-container')

  }
  preprocessDataSets(country, data){

    //wrap this with other plot init functions and pass NewData not data

    var parseTime = d3.timeParse("%Y-%m-%d");

    var r0Data = data[2].filter(a=>a['country']==country)
    var casesInfectionData = data[3].filter(a=>a['country']==country)
    var casesReportData = data[4].filter(a=>a['country']==country)
    var casesObservedData = data[5].filter(a=>a['region']==country)

    var max_observed_cases = d3.max(casesObservedData, function(d) { return parseFloat(d.confirm); });

    var threshold_date = d3.min(casesInfectionData.filter(a=>a['upper_90']>=max_observed_cases * 10), function(d) { return parseTime(d.date)})

    if (typeof(threshold_date) !== 'undefined'){
      r0Data = r0Data.filter(a=>parseTime(a['date'])<=threshold_date)
      casesInfectionData = casesInfectionData.filter(a=>parseTime(a['date'])<=threshold_date)
      casesReportData = casesReportData.filter(a=>parseTime(a['date'])<=threshold_date)
      casesObservedData = casesObservedData.filter(a=>parseTime(a['date'])<=threshold_date)

      var newData = [data[0], data[1], r0Data, casesInfectionData, casesReportData, casesObservedData]
    } else {
      var newData = [data[0], data[1], r0Data, casesInfectionData, casesReportData, casesObservedData]
    }

    return(newData)

  }
  tsDataTitle (dataset, container_id) {

    d3.select("#" + container_id).text(dataset)
  }
  tsCountryTitle (country, container_id){

    if (Object.keys(this._subregional_ref).includes(country)){
      var text = '<a href="' + this._subregional_ref[country] + '" target="_blank">' + country + '</a>'
    } else {
      text = country
    }

    d3.select("#" + container_id).html(text)

  }
  plotHPoly (x, y0, y1, x_scale, y_scale, parseTime = null){

      if (parseTime !== null) {
        var poly = d3.area()
            .x(function(d) { return x_scale(parseTime(d[x])) })
            .y0(function(d) { return y_scale(d[y0]) })
            .y1(function(d) { return y_scale(d[y1]) })
      } else {
        var poly = d3.area()
            .x(function(d) { return x_scale(d[x]) })
            .y0(function(d) { return y_scale(d[y0]) })
            .y1(function(d) { return y_scale(d[y1]) })
      }

      return(poly)
  }
};
