

var ru_RU = {
  "dateTime": "%A, %e %B %Y г. %X",
  "date": "%d-%m-%Y",
  "time": "%H:%M:%S",
  "periods": ["AM", "PM"],
  "days": ["воскресенье", "понедельник", "вторник", "среда", "четверг", "пятница", "суббота"],
  "shortDays": ["вс", "пн", "вт", "ср", "чт", "пт", "сб"],
  "months": ["январь", "февраль", "март", "апрель", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"],
  "shortMonths": ["янв", "фев", "мар", "апр", "май", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"]
}

var RU = d3.locale(ru_RU);
var margin = { top: 30, right: 120, bottom: 30, left: 70 },
    width = 960 - margin.left - margin.right,
    height = 540 - margin.top - margin.bottom,
    tooltip = { width: 100, height: 100, x: 10, y: -30 };

var parseDate = d3.time.format("%d-%m-%Y").parse,
    bisectDate = d3.bisector(function(d) { return d.date; }).left,
    formatValue = d3.format(","),
    dateFormatter = d3.time.format("%d-%m-%Y");

var x = d3.time.scale()
        .range([0, width]);

var y = d3.scale.linear()
        .range([height, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
    .ticks(5)
    .tickFormat(RU.timeFormat("%B"));;

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .tickFormat(d3.format("s"))
    .ticks(7);

var line = d3.svg.line()
    .x(function(d) { return x(d.date); })
    .y(function(d) { return y(d.close); });

var area = d3.svg.area()
    .x(function(d) { return x(d.date); })
    .y0(height)
    .y1(function(d) { return y(d.close); });

var widthValue = width + margin.left + margin.right;
var heightValue = height + margin.top + margin.bottom;

var svg = d3.select("body").append("svg")
        .attr("viewBox", `0 0 ${widthValue} ${heightValue}`)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


d3.csv("data_masks.csv", function(error, data) {
      if (error) throw error;

      data.forEach(function(d) {
          d.date = parseDate(d.date);
          d.close = +d.close;
      });

    data.sort(function(a, b) {
        return a.date - b.date;
    });

    x.domain([data[0].date, data[data.length - 1].date]);
    y.domain(d3.extent(data, function(d) { return d.close; }));

    svg.append("path")
       .data([data])
       .attr("class", "area")
       .attr("d", area);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr('y', -55)
        .attr("x",0 - (height/3)+20)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Количество созданных сайтов");

    svg.append("path")
        .datum(data)
        .attr("class", "line")
        .attr("d", line);

    var focus = svg.append("g")
        .attr("class", "focus")
        .style("display", "none");

    focus.append("circle")
        .attr("r", 5);

    focus.append("rect")
        .attr("class", "tooltip")
        .attr("width", 100)
        .attr("height", 50)
        .attr("x", 10)
        .attr("y", -22)
        .attr("rx", 4)
        .attr("ry", 4);

    focus.append("text")
        .attr("class", "tooltip-date")
        .attr("x", 18)
        .attr("y", -2);

    focus.append("text")
        .attr("x", 18)
        .attr("y", 18)
        .text("Кол-во:");

    focus.append("text")
        .attr("class", "tooltip-likes")
        .attr("x", 70)
        .attr("y", 18);

    svg.append("rect")
        .attr("class", "overlay")
        .attr("width", width)
        .attr("height", height)
        .on("mouseover", function() { focus.style("display", null); })
        .on("mouseout", function() { focus.style("display", "none"); })
        .on("mousemove", mousemove);

    function mousemove() {
        var x0 = x.invert(d3.mouse(this)[0]),
            i = bisectDate(data, x0, 1),
            d0 = data[i - 1],
            d1 = data[i],
            d = x0 - d0.date > d1.date - x0 ? d1 : d0;
        focus.attr("transform", "translate(" + x(d.date) + "," + y(d.close) + ")");
        focus.select(".tooltip-date").text(dateFormatter(d.date));
        focus.select(".tooltip-likes").text(formatValue(d.close));
    }

});