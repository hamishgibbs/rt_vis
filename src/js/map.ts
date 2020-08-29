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

    var legend = d3.select('#map-container')
      .append('div')
      .attr('class', 'legend-button-container')
      .attr('id', 'legend-button-container')
      .style('top', (map_svg_dims.y + 220) + 'px')
      .style('left', (map_svg_dims.x - 350) + 'px')

    legend.append('button')
      .text('Hide')
      .attr('class', 'legend-button')
      .attr('id', 'legend-button')
      .on('click', function(){
        this.classList.toggle("active")
        var content = this.nextElementSibling;
        if (content.style.display === "block") {
          content.style.display = "none";
          this.innerHTML = 'Legend'
        } else {
          content.style.display = "block";
          this.innerHTML = 'Hide'
        }})

    var legend_contents = legend.append('div')
      .style('display', 'block')


    legend_contents.append('div').text('Expected change in cases')
      .style('font-size', '14px')
      .style('padding-top', '10px')

    var legend_items = legend_contents.append('div')

    var i;
    for (i = 0; i < Object.entries(colour_ref).length; i++) {

      var legend_entry = legend_items.append('div')
          .style('display', 'flex')
          .style('align-items', 'center')
          .style('padding-top', '10px')


      legend_entry.append('div')
        .style("width", '12px')
        .style("height", '12px')
        .style('background-color', Object.entries(colour_ref)[i][1])

      legend_entry.append('text')
        .attr("x", legend_x + 23)
        .attr("y", (legend_y + ((legend_height / 7) * (i + 1))) + 15)
        .text(Object.entries(colour_ref)[i][0])
        .style('font-size', '12px')
        .style('padding-left', '10px')

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
