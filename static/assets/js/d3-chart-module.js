angular.module('d3-chart', [])
    .directive('d3barDirective', function() {
        // chart height, width
        var margin = {top: 20, right: 20, bottom: 30, left: 70},
            width = 960 - margin.left - margin.right,
            height = 500 - margin.top - margin.bottom;

        // ordinal scales have a discrete domain
        var x = d3.scale.ordinal()
            .rangeRoundBands([0, width], .1); // set range between bars

        var y = d3.scale.linear()
            .range([height, 0]);

        return {
            restrict: 'E', // directive can be used as a HTML element 
            link: function (scope, element, attrs) {
                scope.get_page(23497828950).then(function () {
                    var data = scope.fb_page.posts;

                    // create new svg element with given height, width inside directive tag
                    var chart = d3.select(element[0]).append("svg")
                        .attr("viewBox", "0 0 1260 650") // min-x, min-y, width and height
                        .attr("preserveAspectRatio", "xMidYMid") // force uniform scaling
                        .attr("shape-rendering", "crispEdges")
                        .append("g")
                            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

                    // x axis interval
                    x.domain(data.map(function(d, i) {return i}));
                    // y axis interval
                    y.domain([0, d3.max(data, function(d) { return d[attrs.metric]; })]);

                    var xAxis = d3.svg.axis()
                        .scale(x)
                        .orient("bottom");

                    var yAxis = d3.svg.axis()
                        .scale(y)
                        .orient("left")

                    // draw x axis
                    chart.append("g")
                        .attr("class", "x axis")
                        .attr("transform", "translate(0," + height + ")") // draw axis on bottom
                        .call(xAxis);

                    // draw y axis
                    chart.append("g")
                        .attr("class", "y axis")
                        .call(yAxis)
                        .append("text")
                            .attr("transform", "rotate(-90)")
                            .attr("y", 5)
                            .attr("dy", "1em")
                            .style("text-anchor", "end")
                            .text(attrs.metric + ":");

                    // draw bars
                    chart.selectAll(".bar").data(data)
                        .enter().append("rect")
                        .attr("class", "bar")
                        .attr("x", function(d, i) {return x(i)})
                        .attr("y", function(d) {return y(0)})
                        .attr("width", x.rangeBand())
                        .attr("height", function(d) {return 0})
                        .transition().delay(function (d,i){ return i * 300;}) // animation
                            .duration(1000)
                            .attr("height", function(d) { return height - y(d[attrs.metric]) })
                            .attr("y", function(d) { return y(d[attrs.metric]) });
                });
            }
        }
    })
    .directive('d3heatmapDirective', function() {
        // chart height, width
        var margin = {top: 20, right: 20, bottom: 30, left: 70},
            width = 960 - margin.left - margin.right,
            height = 500 - margin.top - margin.bottom;
        // create mercatory projection and offset to the [width_mid, 450]
        var projection = d3.geo.mercator().translate([width / 2, 450]);
        var path = d3.geo.path().projection(projection);

        return {
            restrict: 'E', // directive can be used as a HTML element 
            link: function (scope, element, attrs) {
                scope.get_page(23497828950).then(function () {
                    var max_likes = scope.get_max_value_by_region(scope.fb_page.funs_by_region.value);

                    var chart = d3.select(element[0]).append("svg")
                        .attr("viewBox", "0 0 1260 650") // min-x, min-y, width and height
                        .attr("preserveAspectRatio", "xMidYMid") // force uniform scaling
                        .attr("shape-rendering", "crispEdges")
                        .append("g")
                            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

                    d3.json("/static/assets/topojson/world.json", function(error, world) {
                        var countries = topojson.feature(world, world.objects.countries).features;
                        var funs_by_region = scope.fb_page.funs_by_region.value;
                        // draw countries
                        chart.selectAll(".country").data(countries)
                            .enter().append("path")
                            .attr("d", path)
                            .attr("class", function(d) {
                                if(d.id in funs_by_region) {
                                    var index = scope.get_country_likes_class(funs_by_region[d.id], max_likes);
                                    return "country country_funs" + index;
                                }
                                return "country country_funs_none";
                            });

                        var legend = chart.append("g")
                            .attr("class", "legend")
                            .attr("x", width - 65)
                            .attr("y", 25)
                            .attr("height", 100)
                            .attr("width", 100);

                        legend.selectAll('g')
                            .data(Array(6).join(1).split('').map(function(x,i) {return i;}))
                            .enter()
                            .append('g')
                            .each(function(d, i) {
                                var g = d3.select(this);
                                g.append("rect")
                                    .attr("x", i * width/5)
                                    .attr("y", 10 - 30)
                                    .attr("width", 20)
                                    .attr("height", 20)
                                    .attr("class", "country country_funs" + d);
                                
                                g.append("text")
                                    .attr("x", i * width/5 + 30)
                                    .attr("y", 10 - 15)
                                    .attr("height", 30)
                                    .attr("width", 100)
                                    .text("Likes < " + scope.max_likes_by_class(d, max_likes));
                            })
                    });
                });
            }
        };
    })
    .directive('d3gdpDirective', function() {
        // chart height, width
        var margin = {top: 20, right: 20, bottom: 30, left: 70},
            width = 960 - margin.left - margin.right,
            height = 500 - margin.top - margin.bottom;
        // create mercatory projection and offset to the [width_mid, 450]
        var projection = d3.geo.mercator().translate([width / 2, 450]);
        var path = d3.geo.path().projection(projection);

        return {
            restrict: 'E', // directive can be used as a HTML element 
            link: function (scope, element, attrs) {
                scope.get_gdp().then(function () {
                    var chart = d3.select(element[0]).append("svg")
                        .attr("viewBox", "0 0 1260 650") // min-x, min-y, width and height
                        .attr("preserveAspectRatio", "xMidYMid") // force uniform scaling
                        .attr("shape-rendering", "crispEdges")
                        .append("g")
                            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

                    var max_gdp = scope.get_max_value_by_region(scope.gdp.countries);

                    d3.json("/static/assets/topojson/world.json", function(error, world) {
                        var countries = topojson.feature(world, world.objects.countries).features;
                        var gdp_by_region = scope.gdp.countries;

                        chart.selectAll(".country").data(countries)
                            .enter().append("path")
                            .attr("d", path)
                            .attr("class", function(d) {
                                if(d.id in gdp_by_region) {
                                    var index = scope.get_country_gdp_class(gdp_by_region[d.id], max_gdp);
                                    return "country country_gdp" + index;
                                }
                                return "country country_gdp_none";
                            });
                    })      
                })
            }
        }
    })
