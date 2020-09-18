try {
  var d3 = require('d3')
}
catch(err) {}

interface map {
  projection: any
  map_svg_dims: any
  summaryData: any
}

class map extends rtVis {
  constructor (x) {
    super(x)
  }
  setupMap (geoData, summaryData, mapClick, dropdownClick) {

    //figure out where to put dropdown - absolute position in top R is best (regardless of map)
    d3.select("#map-svg").remove()

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

    var path = d3.geoPath().projection(projection);

    var colour_ref = {'Decreasing':'#1170aa',
                      'Likely decreasing':'#5fa2ce',
                      'Unsure':'#7b848f',
                      'Likely increasing':'#fd9e49',
                      'Increasing':'#e75f00',
                      'No Data':'lightgray'}

    map_svg.append("g")
      .attr("class", "areas")
    	.selectAll("path")
    	.data(geoData.features)
    	.enter().append("path")
        .attr('class', 'area-poly')
	      .attr("d", path)
      	.attr("stroke", "white")
      	.attr("summary", function(d){ try {
          return summaryData.filter(a=>a['region']==d.properties.sovereignt)[0]['Expected change in daily cases']
        } catch {
          return 'No Data'};})
      	.attr("country-name", function(d){ return d.properties.sovereignt; })
        .attr("fill", function(d){ return colour_ref[d3.select(this).attr('summary')]; })
        .on('mouseenter', this.mapMouseIn.bind(this))
        .on("mouseout", this.mapMouseOut)
        .on("mouseover", this.mapMouseOver)
        .on('click', mapClick)
        .style('stroke', 'black')
        .style('stroke-width', '0.2px')
        .style('opacity', 0.5)
        .transition()
        .delay(50)
        .style('opacity', 1);

    this.createLegend(map_svg, map_svg_dims, colour_ref)

    var areaNames = geoData.features.map(function(d){return(d.properties.sovereignt)}).filter(this.onlyUnique).sort()

    // @ts-ignore
    $('#dropdown-container').append('.js-example-basic-single').select2({placeholder: 'Select a country', data: areaNames}).on('select2:select', dropdownClick);

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

      console.log(e.properties.sovereignt)

      var tooltip_data = this.summaryData.filter(a => a.region == e.properties.sovereignt)[0]

      try {
        var tooltip_str = '<b>' + e.properties.sovereignt + '</b>' + '</br>' + '</br>' +
                Object.keys(tooltip_data).map(function (key) {
                  if (key !== 'region'){
                    return "" + key + ": " + tooltip_data[key];
                  }
                }).join("</br> </br>");
      } catch {
        var tooltip_str = ''
      }

      if (tooltip_str === ''){
        tooltip
          .style("opacity", 0)
      } else {
        tooltip.html(tooltip_str)
      }

      console.log(tooltip_str)
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
  createLegend(map_svg, map_svg_dims, colour_ref) {

    var legend_height = 200

    var legend_x = map_svg_dims.width / 30
    var legend_y = map_svg_dims.height / 2

    var legendClick = function(x){

      if(d3.selectAll('#map-legend-text').style('opacity') === '1'){
        d3.selectAll('#map-legend-text').style('opacity', 0)
        d3.selectAll('#map-legend-item').style('opacity', 0)
        d3.selectAll('#map-legend-rect').transition().duration(250).attr('width', '64px').attr('height', '25px')

        legend.append('text')
          .text('Legend')
          .attr('x', legend_x - 2)
          .attr('y', legend_y - 2.5)
          .style('font-size', '14px')
          .attr('id', 'map-legend-title')
          .style('opacity', 0)
          .transition().duration(250)
          .style('opacity', 1)

      } else {
        d3.selectAll('#map-legend-text').transition().duration(250).delay(100).style('opacity', 1)
        d3.selectAll('#map-legend-item').transition().duration(250).delay(100).style('opacity', 1)
        d3.selectAll('#map-legend-rect').transition().duration(250).attr('width', '185px').attr('height', '200px')


        d3.select('#map-legend-title').remove()
      }

    }

    var legend = map_svg.append('g')
      .attr('class', 'map-legend')
      .attr('id', 'map-legend')
      .on('click', legendClick)

    legend.append('rect')
      .attr('x', legend_x - 10)
      .attr('y', legend_y - 20)
      .attr('width', '64px')
      .attr('height', '25px')
      .attr('class', 'map-legend-rect')
      .attr('id', 'map-legend-rect')
      .style('stroke', 'black')
      .style('fill', 'white')
      .style('rx', '8px')

    legend.append('text').text('Legend').attr('x', legend_x - 2).attr('y', legend_y - 2.5).style('font-size', '14px').attr('id', 'map-legend-title')

    legend.append('text')
      .style('font-size', '14px')
      .style('padding-top', '10px')
      .style('color', 'lightgrey')
      .attr('class', 'map-legend-text')
      .attr('id', 'map-legend-text')
      .attr('x', legend_x)
      .attr('y', legend_y - 20)

    legend.append('text').text('Expected change in cases')
      .style('font-size', '14px')
      .style('padding-top', '10px')
      .attr('class', 'map-legend-text')
      .attr('id', 'map-legend-text')
      .attr('x', legend_x)
      .attr('y', legend_y)

    var i;
    for (i = 0; i < Object.entries(colour_ref).length; i++) {

      legend.append('rect')
        .attr("x", legend_x)
        .attr("y", (legend_y + ((legend_height / 7) * (i + 1))) + 5 - 20)
        .style("width", '12px')
        .style("height", '12px')
        .style('fill', Object.entries(colour_ref)[i][1])
        .attr('class', 'map-legend-item')
        .attr('id', 'map-legend-item')

      legend.append('text')
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
