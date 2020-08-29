try {
  var d3 = require('d3')
}
catch(err) {}

class map extends rtVis {
  constructor (x) {
    super(x)
  }
  setupMap (geoData, summaryData, mapClick, dropdownClick) {

    //figure out where to put dropdown - absolute position in top R is best (regardless of map)

    var map_svg = d3.select("#map-container")
      .append('svg')
      .attr('class', 'map-svg')
      .style("width", '100%')
      .style("height", '100%')

    var map_svg_dims = document.getElementById('map-container').getBoundingClientRect()

    var projection = d3.geoCylindricalStereographic();

    var path = d3.geoPath().projection(projection);

    var scaleCenter = this.calculateScaleCenter(geoData, map_svg_dims.width, map_svg_dims.height, path);

    var projection = d3.geoCylindricalStereographic()
    					.translate([map_svg_dims.width/2, map_svg_dims.height/2])
    					.scale(scaleCenter.scale)
    					.center(scaleCenter.center);

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
          return summaryData.filter(a=>a['Country']==d.properties.sovereignt)[0]['Expected change in daily cases']
        } catch {
          return 'No Data'};})
      	.attr("country-name", function(d){ return d.properties.sovereignt; })
        .attr("fill", function(d){ return colour_ref[d3.select(this).attr('summary')]; })
      	.on("mouseover", this.mapMouseIn)
        .on("mouseout", this.mapMouseOut)
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

    d3.select(this)
      .style('stroke', 'black')
      .style('stroke-width', '1.5px')
  }
  mapMouseOut(e) {
    d3.select(this)
      .style('stroke', 'black')
      .style('stroke-width', '0.5px')
  }
  createLegend(map_svg, map_svg_dims, colour_ref) {

    console.log(map_svg_dims)

    var legend_height = 200

    var legend_x = map_svg_dims.width / 30
    var legend_y = map_svg_dims.height / 2

    var legendClick = function(x){

      console.log(this)
      console.log(d3.selectAll('#map-legend-text').style('opacity'))
      console.log(typeof(d3.selectAll('#map-legend-text').style('opacity')))
      console.log(d3.selectAll('#map-legend-text').style('opacity') === '1')

      if(d3.selectAll('#map-legend-text').style('opacity') === '1'){
        d3.selectAll('#map-legend-text').style('opacity', 0)
        d3.selectAll('#map-legend-item').style('opacity', 0)
        d3.selectAll('#map-legend-rect').attr('width', '68px')
        d3.selectAll('#map-legend-rect').attr('height', '25px')

        legend.append('text').text('Legend').attr('x', legend_x - 2).attr('y', legend_y - 2.5).style('font-size', '14px').attr('id', 'map-legend-title')

      } else {
        d3.selectAll('#map-legend-text').style('opacity', 1)
        d3.selectAll('#map-legend-item').style('opacity', 1)
        d3.selectAll('#map-legend-rect').attr('width', '185px')
        d3.selectAll('#map-legend-rect').attr('height', '200px')
        d3.selectAll('#map-legend-rect').text('Legend')

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
      .attr('width', '185px')
      .attr('height', '200px')
      .attr('class', 'map-legend-rect')
      .attr('id', 'map-legend-rect')
      .style('stroke', 'black')
      .style('fill', 'white')
      .style('rx', '8px')


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
