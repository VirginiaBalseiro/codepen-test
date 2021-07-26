function percentage(total, value) {
  return (value * 100 / total).toFixed() + " %";
}

function pieChart(dataUrl, svgContainer) {
var body = d3.select("body");

var tooltip = body.append("div")
  .attr("class", "tooltip")
  .attr("id", "tooltip")
  .style("opacity", 0)

var width = 960,
    height = 500,
    radius = Math.min(width, height) / 2;

var color = d3.scaleOrdinal()
    .range(["#003f5c","#58508d", "#bc5090", "#ff6361","#ffa600", "#d45087", "#f95d6a", "#ff7c43", "#ffa600"]);

var arc = d3.arc()
    .outerRadius(radius - 10)
    .innerRadius(0);

var labelArc = d3.arc()
    .outerRadius(radius - 40)
    .innerRadius(radius - 40);

var pie = d3.pie()
    .sort(null)
    .value(function(d) { return d.count; });

var svg = d3.select(`#${svgContainer}`).append("svg")
    .attr("width", width)
    .attr("height", height)
  .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

d3.csv(dataUrl, type, function(error, data) {
  if (error) throw error;
 
  const values = data.map(d => d.count)    
  const total = values.reduce((acc, val) => acc + val);

  var g = svg.selectAll(".arc")
      .data(pie(data))
    .enter().append("g")
      .attr("class", "arc");

  g.append("path")
      .attr("d", arc)
      .style("fill", function(d) { return color(d.data.count); })
   .on("mouseover", function(d) {        tooltip.style("opacity", .9)
          .style("left", (d3.event.pageX + 10) + "px")
          .style("top", (d3.event.pageY - 28) + "px")
          .html(function() {
            return d.data.response;
          })
  })
    .on("mouseout", function(d) {
    tooltip.style("opacity", 0)
  });

  g.append("text")
      .attr("transform", function(d) { return "translate(" + labelArc.centroid(d) + ")"; })
      .attr("dy", ".35em")
      .text(function(d) { return percentage(total, d.data.count) + "%"; });
});

function type(d) {
  d.count = +d.count;
  return d;
}
}

function map() {

var body = d3.select("body");
var width = 800;
var height = 800;

var tooltip = body.append("div")
  .attr("class", "tooltip")
  .attr("id", "tooltip")
  .style("opacity", 0)

// The svg
var svg = d3.select("#country")
.append("svg")
  .attr("width", width)
  .attr("height", height);
console.log(svg)
// Map and projection
var path = d3.geoPath();
var projection = d3.geoMercator()
  .scale(150)
  .center([0,0])
  .translate([width / 2, height / 2]);

// Data and color scale
var data = d3.map();
var countries = d3.map();
var colorScale = d3.scaleThreshold()
  .domain([0, 1, 2.5, 5, 10, 20])
  .range(d3.schemeOranges[7]);
// Load external data and boot
d3.queue()
  .defer(d3.json, "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson")
  .defer(d3.csv, "https://raw.githubusercontent.com/VirginiaBalseiro/testdata/main/country.csv", function(d) { data.set(d.code, +d.count); countries.set(d.code, d.country)})
  .await(ready);

function ready(error, topo) {

  // Draw the map
  svg.append("g")
    .selectAll("path")
    .data(topo.features)
    .enter()
    .append("path")
      // draw each country
      .attr("d", d3.geoPath()
        .projection(projection)
      )
      // set the color of each country
      .attr("fill", function (d) {
        d.total = data.get(d.id) || 0;
        return d.total > 0 ? colorScale(d.total) : "#fff";
      })
    .on("mouseover", function(d) {
        tooltip.style("opacity", d.total ? .9 : 0)
          .style("left", (d3.event.pageX + 10) + "px")
          .style("top", (d3.event.pageY - 28) + "px")
          .html(function() {
          var result = data.get([d.id]);
          if(result) {
            return "<b>" + countries.get([d.id]) + ": " + result + "</b>"; 
             }
          })
  })
    .on("mouseout", function(d) {
    tooltip.style("opacity", 0)
  });
    }
}

function barChart(dataUrl, svgContainerId) {
d3.csv(dataUrl, function(originalData) {
  const total = originalData.filter((item) => item.response.toLowerCase() === "total")[0].count
  const data = originalData.filter((item) => item.response.toLowerCase() !== "total").sort((a, b) => b.count - a.count);
  const w = 900;
  const h = data.length * 20;
  const padding = 10;
  const barWidth = 20 ;
    const svgContainer = d3.select(`#${svgContainerId}`)
                .append("svg")
                .attr("width", w)
                .attr("height", h)
    
  const value = data.map(function(item){
    return +item.count;
  });
  const name = data.map(function(item) {
    return item.response;
  })
  const yScale = d3.scaleLinear()
        .domain([d3.min(value), d3.max(value)])
        .range([0, h]);  
  
  let scaledValues = [];
  let valuesMin = d3.min(value);
  let valuesMax = d3.max(value);
  var diff = valuesMax - valuesMin;
  const linearScale = d3.scaleLinear()
        .domain([valuesMin, valuesMax])
       .range([(valuesMin/valuesMax)*w, (diff < 20 ? w-200 : w/2)]);

  scaledValues = value.map(function(item){
    return linearScale(item);
  });
  const xAxisScale = d3.scaleLinear()
      .domain([valuesMin, valuesMax])
      .range([(valuesMin/valuesMax)*w, w/2]);
  svgContainer.selectAll("rect")
     .data(scaledValues)
     .enter()
     .append("rect")
     .attr('data-response', function(d, i) {
        return data[i].response
        })
     .attr('data-count', function(d, i){
        return data[i].count
        })
      .attr('class', 'bar')
      .attr('y', function(d, i){
        return i * barWidth;
        })
      .attr('x', 0)
      .attr('height', barWidth)
      .attr('width', function(d) {
        return d;
  })
      .style('fill', 'orange')
    .style("stroke-width", 2) 
    .style("stroke", "darkslategrey")  
     //Create labels
                svgContainer.selectAll("text")
                    .data(data) 
                    .enter()
                    .append("text")
                    .text(function (d) {
                  const label = d.response;
                  const perc = percentage(total, d.count);
                        return label + " - " + perc;
                    })
                    .attr("text-anchor", "left")
                    .attr("x", function (d, i) {
                        return scaledValues[i] + 2;
                    })
                    .attr("y", function (d, i) {
                        return (i+1) * barWidth - 5;
                    })
                    .attr("font-family", "sans-serif")
                    .attr("font-size", "14px")
                    .attr("fill", "white");
  })
 }

map();

pieChart("https://raw.githubusercontent.com/VirginiaBalseiro/testdata/main/understand_solid.csv","understanding-solid")
pieChart("https://raw.githubusercontent.com/VirginiaBalseiro/testdata/main/code.csv","code")
pieChart("https://raw.githubusercontent.com/VirginiaBalseiro/testdata/main/years_code.csv","years-code")
barChart("https://raw.githubusercontent.com/VirginiaBalseiro/testdata/main/gender_identity.csv", "gender-identity")
barChart("https://raw.githubusercontent.com/VirginiaBalseiro/testdata/main/languages.csv", "languages")
barChart("https://raw.githubusercontent.com/VirginiaBalseiro/testdata/main/ethnic_category.csv", "ethnic-category")
barChart("https://raw.githubusercontent.com/VirginiaBalseiro/testdata/main/participate.csv", "participate")
barChart("https://raw.githubusercontent.com/VirginiaBalseiro/testdata/main/github.csv", "github")
barChart("https://raw.githubusercontent.com/VirginiaBalseiro/testdata/main/forums.csv", "forums")
barChart("https://raw.githubusercontent.com/VirginiaBalseiro/testdata/main/gitter.csv", "gitter")
barChart("https://raw.githubusercontent.com/VirginiaBalseiro/testdata/main/age.csv", "age")
barChart("https://raw.githubusercontent.com/VirginiaBalseiro/testdata/main/education.csv", "education")
barChart("https://raw.githubusercontent.com/VirginiaBalseiro/testdata/main/self_description_total.csv","self-description-total")
barChart("https://raw.githubusercontent.com/VirginiaBalseiro/testdata/main/self_description_academia.csv","self-description-academia")
barChart("https://raw.githubusercontent.com/VirginiaBalseiro/testdata/main/self_description_designers.csv","self-description-designers")
barChart("https://raw.githubusercontent.com/VirginiaBalseiro/testdata/main/self_description_devs.csv","self-description-developers")
barChart("https://raw.githubusercontent.com/VirginiaBalseiro/testdata/main/self_description_product.csv","self-description-product")
barChart("https://raw.githubusercontent.com/VirginiaBalseiro/testdata/main/self_description_writers.csv","self-description-writers")
barChart("https://raw.githubusercontent.com/VirginiaBalseiro/testdata/main/events.csv","events")
barChart("https://raw.githubusercontent.com/VirginiaBalseiro/testdata/main/belong.csv","belong")