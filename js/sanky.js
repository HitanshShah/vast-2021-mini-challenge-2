links_original_opacity = 0.7;

function selectLinkByCcNum(cc_num) {
	// Find the link with the matching source cc_num
	if (cc_num == '1') {
		var link_cc = d3.selectAll(".link");
		link_cc.style("opacity", links_original_opacity);
	}
	else {
		var link_cc = d3.selectAll(".link")
			.filter(function (d) {
				return d.source.name === cc_num;
			});

		// Set the opacity of all links to a lower value
		d3.selectAll(".link")
			.style("opacity", 0.1);

		// Set the opacity of the selected link to 1 to make it stand out
		link_cc.style("opacity", links_original_opacity);
	}
}

document.addEventListener('DOMContentLoaded', function () {
	var margin = { top: 10, right: 10, bottom: 10, left: 10 },
		width = 799 - margin.left - margin.right,
		height = 5000 - margin.top - margin.bottom;

	// format variables
	var formatNumber = d3.format(",.0f"), // zero decimal places
		format = function (d) { return formatNumber(d); },
		color = d3.scaleOrdinal(d3.schemeCategory10);

	// append the svg object to the body of the page
	var svg = d3.select("#shankey_svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform",
			"translate(" + margin.left + "," + margin.top + ")");

	// Set the sankey diagram properties
	var sankey = d3.sankey()
		.nodeWidth(20)
		.nodePadding(8)
		.size([width, height])
		.nodeAlign(d3.sankeyRight);

	var path = sankey.links();

	// load the data
	d3.csv("./pre_processed_data/sankey_chart_data(car_cc_loyalty_frequency).csv").then(function (data) {

		//set up graph in same style as original example but empty
		sankeydata = { "nodes": [], "links": [] };

		data.forEach(function (d) {
			sankeydata.nodes.push({ "name": d.cc_num });
			sankeydata.nodes.push({ "name": d.loyalty_num });
			sankeydata.links.push({
				"source": d.cc_num,
				"target": d.loyalty_num,
				"value": +d.frequency
			});
		});

		// return only the distinct / unique nodes
		sankeydata.nodes = Array.from(
			d3.group(sankeydata.nodes, d => d.name),
			([value]) => (value)
		);

		// loop through each link replacing the text with its index from node
		sankeydata.links.forEach(function (d, i) {
			sankeydata.links[i].source = sankeydata.nodes
				.indexOf(sankeydata.links[i].source);
			sankeydata.links[i].target = sankeydata.nodes
				.indexOf(sankeydata.links[i].target);
		});

		// now loop through each nodes to make nodes an array of objects
		// rather than an array of strings
		sankeydata.nodes.forEach(function (d, i) {
			sankeydata.nodes[i] = { "name": d };
		});

		graph = sankey(sankeydata);

		// add in the links
		var link = svg.append("g").selectAll(".link")
			.data(graph.links)
			.enter().append("path")
			.attr("class", "link")
			.attr("d", d3.sankeyLinkHorizontal())
			.attr("stroke-width", function (d) { return d.width; })
			.style("opacity", links_original_opacity);

		// add the link titles
		link.append("title")
			.text(function (d) {
				return d.source.name + " → " +
					d.target.name + "\n" + format(d.value);
			});


		// add in the nodes
		var node = svg.append("g").selectAll(".node")
			.data(graph.nodes)
			.enter().append("g")
			.attr("class", "node");

		// add the rectangles for the nodes
		node.append("rect")
			.attr("x", function (d) { return d.x0; })
			.attr("y", function (d) { return d.y0; })
			.attr("height", function (d) { return d.y1 - d.y0; })
			.attr("width", sankey.nodeWidth())
			.attr("nodeId", function (d) {return d.name;})
			.style("fill", function (d) {
				return d.color = color(d.name.replace(/ .*/, ""));
			})
			.style("stroke", function (d) {
				return d3.rgb(d.color).darker(2);
			})
			.append("title")
			.text(function (d) {
				return d.name + "\n" + format(d.value);
			});

		node.on("mouseover", function (d) {
			var id = d.target.getAttribute("nodeId");
			// Set the opacity of all links to a lower value
			link.style("opacity", 0.1);
			// Set the opacity of the hovered link to 1 to make it stand out
			d3.selectAll('.link').data(graph.links).style("opacity", function(d){
				if (d.source.name == (id) || d.target.name == (id))
				{
					return links_original_opacity;
				}
				return 0.1;
			})
		})
			.on("mouseleave", function (d) {
				// Set the opacity of all links back to the normal value (e.g., 1)
				link.style("opacity", links_original_opacity);
			});

		link.style("stroke", function (d) {
			return d3.rgb(d.source.color).brighter(1);
		});

		link.on("mouseover", function (d) {
			// Set the opacity of all links to a lower value
			link.style("opacity", 0.1);
			// Set the opacity of the hovered link to 1 to make it stand out
			d3.select(this).style("opacity", 1);
		})
		.on("mouseleave", function(d) {
			// Set the opacity of all links back to the normal value (e.g., 1)
			link.style("opacity", links_original_opacity);
		});
	// add in the title for the nodes
	  node.append("text")
		  .attr("x", function(d) { return d.x0 - 6; })
		  .attr("y", function(d) { return (d.y1 + d.y0) / 2; })
		  .attr("dy", "0.35em")
		  .attr("text-anchor", "end")
		  .text(function(d) { return d.name; })
		.filter(function(d) { return d.x0 < width / 2; })
		  .attr("x", function(d) { return d.x1 + 6; })
		  .attr("text-anchor", "start");
	
	  	  
	  node.on("click",function(d){
		console.log(d.srcElement.__data__.name);
		var cc_dropdown = d3.select("#dropdowncc")
		cc_dropdown.property('value',d.srcElement.__data__.name);
		cc_dropdown = document.querySelector("#dropdowncc");
		cc_dropdown.dispatchEvent(new Event('change'));
	  } );
});
});