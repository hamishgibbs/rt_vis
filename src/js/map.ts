try {
  var d3 = require('d3')
}
catch(err) {}

class map extends rtVis {
  constructor () {
    super()
  }
  setupMap (geoData, summaryData, mapClick, dropdownClick) {

    var map_svg = d3.select("#map-container")
      .append('svg')
      .attr('class', 'map-svg')
      .style("width", '100%')
      .style("height", '100%')

    var map_svg_dims = document.getElementById('map-container').getBoundingClientRect()

    var projection = d3.geoCylindricalStereographic()
    					.translate([map_svg_dims.width/2, map_svg_dims.height/2])
    					.scale(150)
    					.center([0, 10]);

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
        .style('stroke-width', '0.2px');

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

    var legend_height = 200

    var legend_x = map_svg_dims.width / 30
    var legend_y = map_svg_dims.height / 2

    map_svg.append("rect")
      .attr("x", legend_x)
      .attr("y", legend_y)
      .attr("width", 185)
      .attr("height", legend_height)
      .attr('fill', 'white')
      .attr('stroke', 'black')
      .attr('stroke-width', '0.5px')
      .attr('rx', 8);


    map_svg.append('text')
      .attr("x", legend_x + 6)
      .attr("y", legend_y + 20)
      .text('Expected change in cases')
      .style('font-size', '10pt')
      .style('font-weight', 'bold')

    var i;
    for (i = 0; i < Object.entries(colour_ref).length; i++) {

      map_svg.append("rect")
        .attr("x", legend_x + 6)
        .attr("y", (legend_y + ((legend_height / 7) * (i + 1))) + 5)
        .attr("width", 12)
        .attr("height", 12)
        .attr('fill', Object.entries(colour_ref)[i][1]);

      map_svg.append('text')
        .attr("x", legend_x + 23)
        .attr("y", (legend_y + ((legend_height / 7) * (i + 1))) + 15)
        .text(Object.entries(colour_ref)[i][0])
        .style('font-size', '12')

    }

  }
  onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
  }
};
