try {
  var d3 = require('d3')
}
catch(err) {}

interface map {
  projection: any
  map_svg_dims: any
  summaryData: any
  mapDataClick: any
}

class map extends rtVis {
  constructor (x) {
    super(x)
  }
  setupMap (geoData, summaryData, mapClick, dropdownClick, mapDataClick, activeMapData) {

    d3.select("#map-svg").remove()
    d3.select('#map-container-tooltip').remove()
    d3.select('#map-legend').remove()

    var map_svg = d3.select("#map-container")
      .append('svg')
      .attr('class', 'map-svg')
      .attr('id', 'map-svg')
      .style("width", '100%')
      .style("height", '100%')

    var tooltip = d3.select("#map-container")
      .append("div")
      .style("opacity", 0)
      .attr("class", 'tooltip')
      .attr('id', 'map-container-tooltip')

    var map_svg_dims = document.getElementById('map-container').getBoundingClientRect()

    var projection = d3.geoCylindricalStereographic();

    var path = d3.geoPath().projection(projection);

    var scaleCenter = this.calculateScaleCenter(geoData, map_svg_dims.width, map_svg_dims.height, path);

    var projection = d3.geoCylindricalStereographic()
    					.translate([map_svg_dims.width/2, map_svg_dims.height/2])
    					.scale(scaleCenter.scale)
    					.center(scaleCenter.center);

    this.projection = projection
    this.map_svg_dims = map_svg_dims
    this.summaryData = summaryData
    this.mapDataClick = mapDataClick

    var path = d3.geoPath().projection(projection);

    var colour_ref = {'Expected change in daily cases':{'Decreasing':'#1170aa',
                                      'Likely decreasing':'#5fa2ce',
                                      'Unsure':'#7b848f',
                                      'Likely increasing':'#fd9e49',
                                      'Increasing':'#e75f00',
                                      'No Data':'lightgray'},
                      'New confirmed cases by infection date':{'No Data': 'lightgray',
                                                               'Numeric': d3.scaleLinear().range(["white", "blue"])},
                      'Effective reproduction no.':{'No Data': 'lightgray',
                                                    'Numeric': d3.scaleLinear().range(["white", "red"])},
                      'Rate of growth':{'No Data': 'lightgray',
                                        'Numeric': d3.scaleLinear().range(["white", "green"])},
                      'Doubling/halving time (days)':{'No Data': 'lightgray',
                                                      'Numeric': d3.scaleLinear().range(["white", "purple"])}}


    var map_data_values = this.prepareMapData(summaryData, activeMapData)

    if (typeof(map_data_values[0]) === 'number'){
      var legend_max = d3.max(map_data_values)
      var legend_min = d3.min(map_data_values)
      colour_ref[activeMapData]['Numeric'] = colour_ref[activeMapData]['Numeric'].domain([legend_min,legend_max])
    } else {
      legend_min = 0
      legend_max = 0
    }

    var parseMapData = this.parseMapData
    var pallette = this.pallette

    map_svg.append("g")
      .attr("class", "areas")
    	.selectAll("path")
    	.data(geoData.features)
    	.enter().append("path")
        .attr('class', 'area-poly')
	      .attr("d", path)
      	.attr("stroke", "white")
      	.attr("summary", function(d){try {

          var summary_val = summaryData.filter(a=>a['region']==d.properties.sovereignt)[0][activeMapData]

          if (summary_val === 'NA'){
            throw 'Some summary values are null'
          }

          return summary_val
        } catch {
          return 'No Data'};})
      	.attr("country-name", function(d){ return d.properties.sovereignt; })
        .attr("fill", function(d){

          return(
            pallette(
              parseMapData(
                d3.select(this).attr('summary')
              ),
              colour_ref[activeMapData]
            ));
          }
        )
        .on('mouseenter', this.mapMouseIn.bind(this))
        .on("mouseout", this.mapMouseOut)
        .on("mouseover", this.mapMouseOver)
        .on('click', mapClick)
        .style('stroke', 'black')
        .style('stroke-width', '0.2px');

    this.createLegend(map_svg, map_svg_dims, colour_ref[activeMapData], activeMapData, legend_max, legend_min)

    var areaNames = geoData.features.map(function(d){return(d.properties.sovereignt)}).filter(this.onlyUnique).sort()

    // @ts-ignore
    $('#dropdown-container').append('.js-example-basic-single').select2({placeholder: 'Select an area', data: areaNames}).on('select2:select', dropdownClick);

  }
  prepareMapData(summaryData, variable){

    return(summaryData.map(a => this.parseMapData(a[variable])))

  }
  parseMapData(d){

    try {

      if (['Decreasing', 'Likely decreasing', 'Unsure', 'Likely increasing', 'Increasing', 'No Data'].includes(d)){
        return (d)
      } else {
        return(parseFloat(d.split(' ')[0]))
      }

    } catch {

      return('No Data')

    }


  }
  pallette(d, pal){

    if (typeof(d) === 'number'){

      try {

        return (pal['Numeric'](d))

      } catch {

        return (pal['No Data'])

      }

    } else {
      return(pal[d])
    }
  }
  mapMouseIn(e) {
      var x_coords = e.geometry.coordinates[0][0].map(function(x){return(x[0])})
      var y_coords = e.geometry.coordinates[0][0].map(function(x){return(x[1])})

      var x_coord = d3.mean(x_coords)
      var y_coord = d3.max(y_coords)

      var tooltip = d3.select('#map-container-tooltip')

      tooltip
        .style("opacity", 1)

      var tooltip_position = this.projection([x_coord, y_coord])

      x_coord = tooltip_position[0] + 50
      y_coord = tooltip_position[1] - this.map_svg_dims.height - 50

      tooltip
        .style("left", x_coord + "px")
        .style("top", y_coord + "px")

      var tooltip_data = this.summaryData.filter(a => a.region == e.properties.sovereignt)[0]

      try {
        var tooltip_str = '<b>' + e.properties.sovereignt + '</b>' + '</br>' + 
                Object.keys(tooltip_data).map(function (key) {
                  if (key !== 'region'){
                    return "" + key + ": " + tooltip_data[key];
                  }
                }).join("</br>");
      } catch {
        var tooltip_str = ''
      }

      if (tooltip_str === ''){
        tooltip
          .style("opacity", 0)
      } else {
        tooltip.html(tooltip_str)
      }

  }
  mapMouseOver(e) {

    d3.select(this)
      .style('stroke', 'black')
      .style('stroke-width', '1.5px')
  }
  mapMouseOut(e) {
    d3.select(this)
      .style('stroke', 'black')
      .style('stroke-width', '0.2px')

    var tooltip = d3.select('#map-container-tooltip')

    tooltip
      .style("opacity", 0)
  }
  createLegend(map_svg, map_svg_dims, colour_ref, activeMapData, legend_max, legend_min) {

    var legend_height = 200

    var legend_x = map_svg_dims.width / 30
    var legend_y = map_svg_dims.height / 2

    var legendTitle = function(legend){

      legend.append('text')
        .text('Legend')
        .attr('x', legend_x + 10)
        .attr('y', legend_y - 32.5)
        .style('font-size', '15px')
        .attr('id', 'map-legend-title')
        .style('opacity', 0)
        .transition().duration(250)
        .style('opacity', 1)

    }

    var legendTitleSm = function(legend){
      //Legend title for collapsed legend

      legend.append('text')
        .text('Legend')
        .attr('x', legend_x - 2)
        .attr('y', legend_y - 38)
        .style('font-size', '14px')
        .attr('id', 'map-legend-title-sm')
        .style('opacity', 0)
        .transition().duration(250)
        .style('opacity', 1)

    }

    var dataSelectTitle = function(legend){

      legend.append('text')
        .text('Dataset Selection')
        .attr('x', legend_x + 100)
        .attr('y', legend_y - 32.5)
        .style('font-size', '15px')
        .attr('id', 'map-legend-data')
        .style('opacity', 0)
        .transition().duration(400)
        .style('opacity', 1)

    }

    var expandUnderline = function(element, x, y, width){
      element.append('line')
        .attr('id', 'expand-underline')
        .attr("x1", x)
        .attr("x2", x)
        .attr("y1", y)
        .attr("y2", y)
        .style('stroke-width', '2.5px')
        .style('stroke', 'black')
        .transition()
        .duration(250)
        .attr("x1", x - (width / 2))
        .attr("x2", x + (width / 2))
    }

    var legendClick = function(x){

      if (!d3.select('#map-legend-title-sm').empty()){
        //If closed legend is true
        //make legend

        d3.selectAll('#map-legend-text').transition().duration(250).delay(100).style('opacity', 1)
        d3.selectAll('#map-legend-item').transition().duration(250).delay(100).style('opacity', 1)
        d3.selectAll('#map-legend-rect').transition().duration(250).attr('width', '260px').attr('height', '235px')

        d3.select('#map-legend-title-sm').remove()
        d3.select('#map-legend-title').remove()

        legendTitle(legend)

        d3.select('#map-legend-title').style('font-weight', 'bold')

        d3.select('#map-legend-data').remove()

        dataSelectTitle(legend)

        d3.select('#expand-underline').remove()

        expandUnderline(legend, legend_x + 37, legend_y - 25, 58)

      } else if (d3.selectAll('#map-legend-text').style('opacity') === '1'){
        //if legend is active
        //make dataset select

        //hide legend items
        d3.selectAll('#map-legend-text').style('opacity', 0)
        d3.selectAll('#map-legend-item').style('opacity', 0)

        //resize legend rect
        d3.selectAll('#map-legend-rect').transition().duration(250).attr('width', '260px').attr('height', '235px')

        //show dataset selection
        d3.selectAll('#map-dataset-text').transition().duration(250).delay(100).style('opacity', 1)
        d3.selectAll('#map-dataset-item-active').transition().duration(250).delay(100).style('opacity', 1)
        d3.selectAll('#map-dataset-item').transition().duration(250).delay(100).style('opacity', 1)
        d3.selectAll('#map-dataset-item').style('pointer-events', null)

        //remove previous legend headers
        d3.select('#map-legend-title').remove()
        d3.select('#map-legend-title-sm').remove()

        legendTitle(legend)

        d3.select('#map-legend-data').remove()

        dataSelectTitle(legend)

        d3.select('#map-legend-data').style('font-weight', 'bold')

        d3.select('#expand-underline').remove()

        expandUnderline(legend, legend_x + 160, legend_y - 25, 120)


      } else {
        //close legend

        d3.selectAll('#map-dataset-text').style('opacity', 0)
        d3.selectAll('#map-dataset-item-active').style('opacity', 0)
        d3.selectAll('#map-dataset-item').style('opacity', 0)

        d3.selectAll('#map-legend-rect').transition().duration(250).attr('width', '64px').attr('height', '25px')

        d3.select('#map-legend-title').remove()
        d3.select('#map-legend-data').remove()
        d3.select('#expand-underline').remove()

        legendTitleSm(legend)

      }

    }

    var legend = map_svg.append('g')
      .attr('class', 'map-legend')
      .attr('id', 'map-legend')
      .on('click', legendClick)

    legend.append('rect')
      .attr('x', legend_x - 10)
      .attr('y', legend_y - 55)
      .attr('width', '64px')
      .attr('height', '25px')
      .attr('class', 'map-legend-rect')
      .attr('id', 'map-legend-rect')
      .style('stroke', 'black')
      .style('fill', 'white')
      .style('rx', '8px')

    this.layoutLegend(legend, activeMapData, colour_ref, legend_x, legend_y, legend_height, legend_max, legend_min)
    this.layoutDatasetSelect(map_svg, legend, activeMapData, legend_x, legend_y, legend_height)

  }
  layoutDatasetSelect(map_svg, legend, activeMapData, legend_x, legend_y, legend_height){

    var g = legend.append('g')
      .attr('id', 'map-dataset-content')
      .attr('class', 'map-dataset-content')

    var dataset_labels = map_svg.append('g')
      .attr('id', 'map-dataset-labels')
      .attr('class', 'map-dataset-labels')

    g.append('text').text('Dataset Selection')
      .style('font-size', '14px')
      .style('padding-top', '10px')
      .attr('class', 'map-dataset-text')
      .attr('id', 'map-dataset-text')
      .attr('x', legend_x)
      .attr('y', legend_y)

    var map_datasets = Object.keys(this.summaryData[0]).filter(a => a !== 'region')

    var i;
    for (i = 0; i < map_datasets.length; i++) {

      g.append('rect')
        .attr("x", legend_x)
        .attr("y", (legend_y + ((legend_height / 6.5) * (i + 1))) + 5 - 20)
        .attr('rx', '15')
        .style("width", '240px')
        .style("height", '25px')
        .style('fill', 'lightgrey')
        .attr('class', 'map-dataset-item')
        .attr('id', 'map-dataset-item')

      dataset_labels.append('text')
        .attr("x", legend_x + 8)
        .attr("y", (legend_y + ((legend_height / 6.5) * (i + 1))) + 15 - 14)
        .text(map_datasets[i])
        .style('font-size', '12px')
        .style('padding-left', '10px')
        .attr('class', 'map-dataset-item')
        .attr('id', 'map-dataset-item')
        .on('click', this.mapDataClick)
        .on('mouseenter', function(e){
          d3.select(this).attr('id', 'map-dataset-item-active').style('font-weight', 'bold');
        })
        .on('mouseout', function(e){
          d3.select(this).attr('id', 'map-dataset-item').style('font-weight', 'normal')
        })
    }

    d3.selectAll('#map-dataset-text').style('opacity', 0)
    d3.selectAll('#map-dataset-item').style('opacity', 0)
    d3.selectAll('#map-dataset-item').style('pointer-events', 'none')

  }
  layoutLegend(legend, activeMapData, colour_ref, legend_x, legend_y, legend_height, legend_max, legend_min) {

    var floatFormat = /\B(?=(\d{3})+(?!\d))/g

    var g = legend.append('g')
      .attr('id', 'map-legend-content')
      .attr('class', 'map-legend-content')

    g.append('text')
      .text('Legend')
      .attr('x', legend_x - 2)
      .attr('y', legend_y - 38)
      .style('font-size', '14px')
      .attr('id', 'map-legend-title-sm')

    g.append('text').text(activeMapData)
      .style('font-size', '14px')
      .style('padding-top', '10px')
      .attr('class', 'map-legend-text')
      .attr('id', 'map-legend-text')
      .attr('x', legend_x)
      .attr('y', legend_y)

    if (legend_max > 0){
      var numeric_palette = true
    } else {
      var numeric_palette = false
    }

    var i;
    for (i = 0; i < Object.entries(colour_ref).length; i++) {

      if (numeric_palette){

        if (i === 1){

          //Linear color scale
          var defs = g.append("defs");

          var linearGradient = defs.append("linearGradient")
            .attr("id", "linear-gradient")
            .attr("x1", "0%")
            .attr("y1", "0%")
            .attr("x2", "0%")
            .attr("y2", "100%");

          linearGradient.append("stop")
              .attr("offset", "0%")
              .attr("stop-color", "white");

          linearGradient.append("stop")
              .attr("offset", "100%")
              .attr("stop-color", colour_ref['Numeric'](legend_max));

          g.append('rect')
            .attr("x", legend_x)
            .attr("y", (legend_y + ((legend_height / 7) * (i + 1))) + 5 - 20)
            .style("width", '12px')
            .style("height", '120px')
            .attr('class', 'map-legend-item')
            .attr('id', 'map-legend-item')
            .style("fill", "url(#linear-gradient)")


          var tickRange = this.legendTicks(legend_min, legend_max, 4).concat([legend_max])

          var i;
          for (i = 0; i < 5; i++){

            g.append('text')
              .attr("x", legend_x + 23)
              .attr("y", (legend_y + ((legend_height / 7) * (i + 1))) + 20)
              .text((Math.round(((tickRange[i]) + Number.EPSILON) * 100) / 100).toString().replace(floatFormat, ","))
              .style('font-size', '12px')
              .style('padding-left', '10px')
              .attr('class', 'map-legend-item')
              .attr('id', 'map-legend-item')

          }

        } else {

          //For no data element
          g.append('rect')
            .attr("x", legend_x)
            .attr("y", (legend_y + ((legend_height / 7) * (i + 1))) + 5 - 20)
            .style("width", '12px')
            .style("height", '12px')
            .style('fill', Object.entries(colour_ref)[i][1])
            .attr('class', 'map-legend-item')
            .attr('id', 'map-legend-item')

          g.append('text')
            .attr("x", legend_x + 23)
            .attr("y", (legend_y + ((legend_height / 7) * (i + 1))) + 15 - 20)
            .text(Object.entries(colour_ref)[i][0])
            .style('font-size', '12px')
            .style('padding-left', '10px')
            .attr('class', 'map-legend-item')
            .attr('id', 'map-legend-item')

        }


      } else {

        g.append('rect')
          .attr("x", legend_x)
          .attr("y", (legend_y + ((legend_height / 7) * (i + 1))) + 5 - 20)
          .style("width", '12px')
          .style("height", '12px')
          .style('fill', Object.entries(colour_ref)[i][1])
          .attr('class', 'map-legend-item')
          .attr('id', 'map-legend-item')

        g.append('text')
          .attr("x", legend_x + 23)
          .attr("y", (legend_y + ((legend_height / 7) * (i + 1))) + 15 - 20)
          .text(Object.entries(colour_ref)[i][0])
          .style('font-size', '12px')
          .style('padding-left', '10px')
          .attr('class', 'map-legend-item')
          .attr('id', 'map-legend-item')

      }

      d3.selectAll('#map-legend-text').style('opacity', 0)
      d3.selectAll('#map-legend-item').style('opacity', 0)

    }

  }
  legendTicks(min, max, outlength) {

    var step = (max - min)  / outlength

    return(Array.from({length: outlength}, (x, i) =>  (step * i) + min));

  }
  calculateScaleCenter(features, map_width, map_height, path) {

    var bbox_path = path.bounds(features),
        scale = 120 / Math.max(
          (bbox_path[1][0] - bbox_path[0][0]) / map_width,
          (bbox_path[1][1] - bbox_path[0][1]) / map_height
        );

    var bbox_feature = d3.geoBounds(features),
        center = [
            (bbox_feature[1][0] + bbox_feature[0][0]) / 2,
            (bbox_feature[1][1] + bbox_feature[0][1]) / 2];

    return {
        'scale': scale,
        'center': center
        };
  }
  onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
  }
};
