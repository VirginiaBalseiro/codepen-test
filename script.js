function percentage(total, value) {
  return ((value * 100) / total).toFixed() + " %";
}

function pieChart(dataUrl, svgContainer) {
  var body = d3.select("body");

  var tooltip = body
    .append("div")
    .attr("class", "tooltip")
    .attr("id", "tooltip")
    .style("opacity", 0);

  var width = 600,
    height = 600,
    radius = 200;

  var color = d3
    .scaleOrdinal()
    .range([
      "#7C4DFF",
      "#9671FF",
      "#633DCC",
      "#4A2E99",
      "#E5DBFF",
      "#F1EDFF",
      "#BDA6FF"
    ]);

  var arc = d3.arc().outerRadius(radius).innerRadius(100);

  var labelArc = d3.arc().outerRadius(radius).innerRadius(270);

  var pie = d3
    .pie()
    .sort(null)
    .value(function (d) {
      return d.count;
    });

  var svg = d3
    .select(`#${svgContainer}`)
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

  d3.csv(dataUrl, type, function (error, data) {
    if (error) throw error;

    const values = data.map((d) => d.count);
    const total = values.reduce((acc, val) => acc + val);
    const filteredData = data.filter((d) => d.count > 3);

    var g = svg
      .selectAll(".arc")
      .data(pie(filteredData))
      .enter()
      .append("g")
      .attr("class", "arc");

    g.append("path")
      .attr("d", arc)
      .style("fill", function (d) {
        return color(d.data.count);
      })
      .on("mouseover", function (d) {
        tooltip
          .style("opacity", 0.9)
          .style("left", d3.event.pageX + 10 + "px")
          .style("top", d3.event.pageY - 28 + "px")
          .html(function () {
            return d.data.response;
          });
      })
      .on("mouseout", function (d) {
        tooltip.style("opacity", 0);
      });

    g.append("text")
      .attr("transform", function (d) {
        return "translate(" + labelArc.centroid(d).map((x) => x - 20) + ")";
      })
      .attr("dy", 20)
      .text(function (d) {
        return percentage(total, d.data.count);
      })
      .style("fill", "white");
  });

  function type(d) {
    d.count = +d.count;
    return d;
  }
}

function map() {
  var body = d3.select("body");
  var width = 800;
  var height = 500;

  var tooltip = body
    .append("div")
    .attr("class", "tooltip")
    .attr("id", "tooltip")
    .style("opacity", 0);

  // The svg
  var svg = d3
    .select("#country")
    .append("svg")
    .attr("width", width)
    .attr("height", height);
  // Map and projection
  var path = d3.geoPath();
  var projection = d3
    .geoMercator()
    .scale(120)
    .center([0, 0])
    .translate([width / 2, height / 2 + 100]);

  // Data and color scale
  var data = d3.map();
  var countries = d3.map();
  var colorScale = d3
    .scaleThreshold()
    .domain([0, 1, 2.5, 5, 10, 20])
    .range(d3.schemePurples[7]);
  // Load external data and boot
  d3.queue()
    .defer(
      d3.json,
      "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"
    )
    .defer(
      d3.csv,
      "https://raw.githubusercontent.com/VirginiaBalseiro/testdata/main/country.csv",
      function (d) {
        data.set(d.code, +d.count);
        countries.set(d.code, d.country);
      }
    )
    .await(ready);

  function ready(error, topo) {
    // Draw the map
    svg
      .append("g")
      .selectAll("path")
      .data(topo.features)
      .data(topo.features.filter((d) => d.id !== "GRL" && d.id !== "ATA"))
      .enter()
      .append("path")
      // draw each country
      .attr("d", d3.geoPath().projection(projection))
      // set the color of each country
      .attr("fill", function (d) {
        d.total = data.get(d.id) || 0;
        return d.total > 0 ? colorScale(d.total) : "#fff";
      })
      .on("mouseover", function (d) {
        tooltip
          .style("opacity", d.total ? 0.9 : 0)
          .style("left", d3.event.pageX + 10 + "px")
          .style("top", d3.event.pageY - 28 + "px")
          .html(function () {
            var result = data.get([d.id]);
            if (result) {
              return "<b>" + countries.get([d.id]) + ": " + result + "</b>";
            }
          });
      })
      .on("mouseout", function (d) {
        tooltip.style("opacity", 0);
      });
  }
}

function barChart(dataUrl, svgContainerId) {
  d3.csv(dataUrl, function (originalData) {
    const total = originalData.filter(
      (item) => item.response.toLowerCase() === "total"
    )[0].count;
    const data = originalData
      .filter((item) => item.response.toLowerCase() !== "total")
      .sort((a, b) => b.count - a.count);
    const w = 900;
    const barWidth = 60;
    const h = data.length * barWidth;
    const padding = 10;

    let scaledValues = [];
    const value = data.map(function (item) {
      return +item.count;
    });
    let valuesMin = d3.min(value);
    let valuesMax = d3.max(value);
    var diff = valuesMax - valuesMin;
    const linearScale = d3
      .scaleLinear()
      .domain([valuesMin, valuesMax])
      .range([(valuesMin / valuesMax) * w, diff < 20 ? w - 200 : w / 2]);

    scaledValues = data.map(function (item) {
      return {
        scaledValue: linearScale(item.count),
        ...item
      };
    });
    scaledValues.forEach((item) => {
      const container = document.getElementById(svgContainerId);
      const barLegendContainer = document.createElement("div");
      barLegendContainer.setAttribute("class", "bar-chart-container");
      const bar = document.createElement("div");
      const legend = document.createElement("div");
      legend.setAttribute("class", "legend");
      legend.innerHTML = item.response;
      bar.setAttribute("class", "bar");
      bar.setAttribute("style", `width:${item.scaledValue}px;`);
      container.appendChild(barLegendContainer);
      barLegendContainer.appendChild(legend);
      barLegendContainer.appendChild(bar);
    });
  });
}

map();

pieChart(
  "https://raw.githubusercontent.com/VirginiaBalseiro/testdata/main/understand_solid.csv",
  "understanding-solid"
);

pieChart(
  "https://raw.githubusercontent.com/VirginiaBalseiro/testdata/main/code.csv",
  "code"
);
pieChart(
  "https://raw.githubusercontent.com/VirginiaBalseiro/testdata/main/years_code.csv",
  "years-code"
);
pieChart(
  "https://raw.githubusercontent.com/VirginiaBalseiro/testdata/main/gender_identity.csv",
  "gender-identity"
);
pieChart(
  "https://raw.githubusercontent.com/VirginiaBalseiro/testdata/main/languages.csv",
  "languages"
);
barChart(
  "https://raw.githubusercontent.com/VirginiaBalseiro/testdata/main/participate.csv",
  "participate"
);

barChart(
  "https://raw.githubusercontent.com/VirginiaBalseiro/testdata/main/github.csv",
  "github"
);
barChart(
  "https://raw.githubusercontent.com/VirginiaBalseiro/testdata/main/forums.csv",
  "forums"
);
barChart(
  "https://raw.githubusercontent.com/VirginiaBalseiro/testdata/main/gitter.csv",
  "gitter"
);
barChart(
  "https://raw.githubusercontent.com/VirginiaBalseiro/testdata/main/age.csv",
  "age"
);
barChart(
  "https://raw.githubusercontent.com/VirginiaBalseiro/testdata/main/education.csv",
  "education"
);
barChart(
  "https://raw.githubusercontent.com/VirginiaBalseiro/testdata/main/self_description_total.csv",
  "self-description-total"
);
barChart(
  "https://raw.githubusercontent.com/VirginiaBalseiro/testdata/main/self_description_academia.csv",
  "self-description-academia"
);
barChart(
  "https://raw.githubusercontent.com/VirginiaBalseiro/testdata/main/self_description_designers.csv",
  "self-description-designers"
);
barChart(
  "https://raw.githubusercontent.com/VirginiaBalseiro/testdata/main/self_description_devs.csv",
  "self-description-developers"
);
barChart(
  "https://raw.githubusercontent.com/VirginiaBalseiro/testdata/main/self_description_product.csv",
  "self-description-product"
);
barChart(
  "https://raw.githubusercontent.com/VirginiaBalseiro/testdata/main/self_description_writers.csv",
  "self-description-writers"
);
barChart(
  "https://raw.githubusercontent.com/VirginiaBalseiro/testdata/main/events.csv",
  "events"
);
barChart(
  "https://raw.githubusercontent.com/VirginiaBalseiro/testdata/main/belong.csv",
  "belong"
);

function ethnicityChart() {
  function getColorForEthnicity(name) {
    const COLOR_MAP = {
      Asian: "#0e8ebe",
      "Black or African American": "#bb7272",
      "Hispanic, Latino or Spanish origin": "#805aa0",
      White: "#80a68d",
      "Middle Eastern or North African": "#d0b87f"
    };
    return COLOR_MAP[name];
  }
  var dataUrl =
    "https://raw.githubusercontent.com/VirginiaBalseiro/testdata/main/ethnic_category2.csv";
  const svgContainerId = "ethnicity-2";
  d3.csv(dataUrl, function (originalData) {
    const dataWithFill = originalData.map((item) => {
      return {
        color: getColorForEthnicity(item.response),
        ...item
      };
    });
    const mainCategories = dataWithFill.filter((item) => !!item.color);
    const container = document.getElementById("ethnicity-2");
    mainCategories
      .sort((a, b) => b.count - a.count)
      .forEach((item) => {
        for (i = 0; i < item.count; i++) {
          const circle = document.createElement("span");
          const tooltip = document.createElement("span");
          tooltip.innerHTML = item.response;
          tooltip.setAttribute("class", "ethnic-category-tooltip");
          circle.appendChild(tooltip);
          let className = item.response.toLowerCase();
          if (className.indexOf(",") !== -1) {
            className = className.substr(0, className.indexOf(","));
          } else if (className.indexOf(" ") !== -1) {
            className = className.substr(0, className.indexOf(" "));
          }
          circle.setAttribute("class", className);
          container.appendChild(circle);
        }
      });

    const mixedCategories = dataWithFill.filter((item) => item.type === "1");
    mixedCategories.map((item) => {
      for (i = 0; i < item.count; i++) {
        const circle = document.createElement("span");
        const tooltip = document.createElement("span");
        tooltip.innerHTML = item.response;
        tooltip.setAttribute("class", "ethnic-category-tooltip");
        circle.appendChild(tooltip);
        let className = item.response
          .toLowerCase()
          .split(", ")
          .join("-")
          .split(" ")
          .join("-");
        circle.setAttribute("class", className);
        container.appendChild(circle);
      }
    });

    const legendContainer = document.getElementById("ethnicity-legend");
    mainCategories.forEach((item) => {
      const legend = document.createElement("div");
      const title = document.createElement("h4");
      const percentageTitle = document.createElement("h1");
      title.innerHTML = item.response;
      title.setAttribute("class", "legend-title");
      percentageTitle.innerHTML = percentage(
        originalData.filter((item) => item.response === "total")[0].count,
        item.count
      );
      let className = item.response.toLowerCase();
      if (className.indexOf(",") !== -1) {
        className = className.substr(0, className.indexOf(","));
      } else if (className.indexOf(" ") !== -1) {
        className = className.substr(0, className.indexOf(" "));
      }
      percentageTitle.setAttribute("class", `percentage-title-${className}`);
      legend.appendChild(title);
      legend.appendChild(percentageTitle);
      legendContainer.appendChild(legend);
    });
  });
}

ethnicityChart();

function codingExperienceChart() {
  function getColorForResponse(name) {
    const COLOR_MAP = {
      Yes: "#9671ff",
      No: "#494f56"
    };
    return COLOR_MAP[name];
  }
  var dataUrl =
    "https://raw.githubusercontent.com/VirginiaBalseiro/testdata/main/code.csv";
  const svgContainerId = "coding-experience";
  d3.csv(dataUrl, function (originalData) {
    const total = originalData.reduce(
      (acc, val) => parseInt(acc.count) + parseInt(val.count)
    );
    const dataWithFill = originalData.map((item) => {
      return {
        color: getColorForResponse(item.response),
        ...item
      };
    });
    const mainCategories = dataWithFill.filter((item) => !!item.color);
    const container = document.getElementById(svgContainerId);
    mainCategories
      .sort((a, b) => b.count - a.count)
      .forEach((item) => {
        for (i = 0; i < item.count; i++) {
          const icon = document.createElement("span");
          icon.innerHTML = '<i class="fas fa-laptop-code"></i>';
          let className = item.response.toLowerCase();
          if (className.indexOf(",") !== -1) {
            className = className.substr(0, className.indexOf(","));
          } else if (className.indexOf(" ") !== -1) {
            className = className.substr(0, className.indexOf(" "));
          }
          icon.setAttribute("class", className);
          container.appendChild(icon);
        }
      });

    const legendContainer = document.getElementById("code-legend");
    mainCategories.forEach((item) => {
      const legend = document.createElement("div");
      const title = document.createElement("h4");
      const percentageTitle = document.createElement("h1");
      title.innerHTML = item.response;
      title.setAttribute("class", "legend-title-code");
      percentageTitle.innerHTML = percentage(total, item.count);
      const className = item.response.toLowerCase();
      percentageTitle.setAttribute("class", `percentage-title-${className}`);
      legend.appendChild(percentageTitle);
      legend.appendChild(title);
      legendContainer.appendChild(legend);
    });
  });
}

codingExperienceChart();
