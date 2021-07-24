function percentage(total, value) {
  return (value * 100 / total).toFixed() + " %";
}

function barChart(dataUrl, svgContainerId) {
d3.csv(dataUrl, function(originalData) {
  const total = originalData.filter((item) => item.response=== "Total")[0].count
  const data = originalData.filter((item) => item.response !== "Total").sort((a, b) => b.count - a.count);
  const w = 800;
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
  const linearScale = d3.scaleLinear()
        .domain([valuesMin, valuesMax])
       .range([(valuesMin/valuesMax)*w, w-120]);

  scaledValues = value.map(function(item){
    return linearScale(item);
  });
  const xAxisScale = d3.scaleLinear()
      .domain([valuesMin, valuesMax])
      .range([(valuesMin/valuesMax)*w, w-120]);
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
    .style("stroke", "white")  
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
                    .attr("fill", "black");
  })
 }

barChart("https://raw.githubusercontent.com/VirginiaBalseiro/testdata/main/gender_identity.csv", "gender-identity")
barChart("https://raw.githubusercontent.com/VirginiaBalseiro/testdata/main/languages.csv", "languages")
barChart("https://raw.githubusercontent.com/VirginiaBalseiro/testdata/main/ethnic_category.csv", "ethnic-category")