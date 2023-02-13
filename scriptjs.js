//========= map projection

var projection = d3.geoMercator()
  .scale(1800)
  .translate([300, 1100])
  .center([0, 5]);

var geoGenerator = d3.geoPath()
  .projection(projection);



//========= draw map from data
function update(geojson) {

     d3.csv("./data/dataDz.csv",function(dataWilaya) {

    
         //scale raduis -- population
         var r = d3.scaleLinear()
            .domain(d3.extent(dataWilaya, function(d) { return +d['nombre_habitants']; }))
            .range([2, 10]);


         var data1 = d3.map();  //map data for dairas
         var data2 = d3.map();  //map data for communes
         var data3 = d3.map();  //map data for superficie
         var data4 = d3.map();  //map data for habitants

   
        dataWilaya.forEach( function(d) {
              data1.set( d['nom'],d['nombre_dairas']); 
        });

        dataWilaya.forEach( function(d) {
              data2.set( d['nom'],d['nombre_communes']); 
        });

        dataWilaya.forEach( function(d) {
            data3.set( d['nom'],d['superficie']); 
        });

        dataWilaya.forEach( function(d) {
            data4.set( d['nom'],d['nombre_habitants']); 
        });
 

            //============= create map
        var u = d3.select('#content g.map')
                  .selectAll('path')
                  .data(geojson.features)
                  .enter()
                  .append('path')
                  .attr("fill","#aaa")
                  .attr('d', geoGenerator);
        d3.select('#content g.map')
        .append('g')
        .attr("transform", "translate(300,150)")
              
          .append("image") 
          .attr('id','lune')
           .attr("xlink:href", "images/lune3.png")
           
        //============= call tooltip throught mouse events
      var m=  d3.selectAll('#content .map path')
          .on("mouseover", function(d){
                  d3.select(this).attr("fill", "green")
                  tooltip.style("display", null);
                  tooltip.select('#tooltip-wilaya').text(d.properties.name);
                  tooltip.select('#tooltip-wilayaAr').text(d.properties.name_ar);
                  tooltip.select('#tooltip-daira').text(data1.get(d.properties.name))
                  tooltip.select('#tooltip-commune').text(data2.get(d.properties.name))
                  tooltip.select('#tooltip-superficie').text(data3.get(d.properties.name))
                  tooltip.select('#tooltip-habitants').text(data4.get(d.properties.name))

                  var ref="./images/"+d.properties.name+".jpeg";
                  tooltip.select('#tito image')
                         .attr("xlink:href", ref)
                         .style("width", "160")
                         .style("height", "90") 
    
          })
          .on("mouseout", function(d){
                  d3.select(this).attr("fill", "#aaa")
                  tooltip.style("display", "none");
          })

          .on("mousemove", function(d) {
                  var mouse = d3.mouse(this);
                  tooltip.attr("transform", "translate(" + (mouse[0]) + "," + (mouse[1] +50) + ")");
          })



          
          var tooltip = addTooltip();
         // draw points (population)
               var n=d3.select('#content g.map');
         n.selectAll("circle")
         .data(dataWilaya) 
         .enter()
         .append("circle")
         .attr("class","circles")
         .attr('fill','red')
         .attr("cx", 400)
         .attr("cy", 300)
         .attr("r", 15)
         .attr('opacity',0)
             // <------- TRANSITION STARTS HERE --------
          d3.select('#lune')
          .transition()
          .delay(2000) 
          .duration(1000)
            .attr('opacity',0)

         d3.selectAll('.circles')
         .transition()
         .delay(2000) 
         .duration(500)
          .attr('opacity',1)
         .attr("cx", function(d) {return projection([d['Longitude'],d['Latitude']])[0];})
         .attr("cy", function(d) {return projection([d['Longitude'],d['Latitude']])[1];})
         .transition()
         .delay(1000) 
         .attr("r", function(d) {return r(d['nombre_habitants']);})
        
        
         d3.selectAll('.circles')
         .append("title")
         .text(function(d) {return  "Populatation de "+ d.nom+": "+ d.nombre_habitants; });
        
     //////////////////////////////// chart


      var xscale = d3.scaleLinear()
                     .domain([0, d3.max(dataWilaya, function(d) { return +d['superficie']; })])
                    .range([30, 280]);//width



       var yscale = d3.scaleBand()
                          .range([568, 0])
                       //   .domain([0, d3.max(dataWilaya, function(d) { return xscale(d.superficie); })])

                          .padding(0.8);
      
         
                          
       var leftAxis = d3.axisLeft(yscale);                    
      yscale.domain(dataWilaya.map(function(d) { return d['nom']; }));
      dataWilaya.sort(function(a,b) { return b.superficie - a.superficie; });
		  var chartBar =  d3.select('svg')
                         .append('g')
                                     
                     .attr("transform", "translate(750,35)")
                     .attr('id','bars')
                    
                     .selectAll('rect')
                     .data(dataWilaya)
                     .enter()
                     
                   //  .append('g')
                    // .attr('class', 'axis')
                    // .attr("transform", "translate(30,0)")
                   //  .call(leftAxis)

                     .append('rect')
                     .attr('height',9)
                     .attr('x',0)
                     .attr('y',function(d,i){ return i*10;})
                     .style('fill',"green")
                     .attr('width',function(d){ return 0; })
                     

          d3.select('svg')
            .append('g')                 
            .attr("transform", "translate(750,20)")
            .append('text')
            .style("fill","green")
            .style("font-weight", "bold")
            .text("Superficie")

                   
      d3.selectAll("rect")
                      .data(dataWilaya)
                      .transition()
                      .duration(5000) 
                     .attr("width", function(d) {return xscale(d.superficie); })
                    // .append("title")
    
                            
         d3.selectAll('rect')
         .append("title")
         .text(function(d) {return  "Superficie de "+ d.nom+": "+ d.superficie+" km²"; });


  
         
 
  
      //======================  Create tooltip
      
      function addTooltip() {
    
          var tooltip = d3.select('svg').append("g")
                          .attr("id", "tooltip")
                          .style("display", 'none')
          

  
          tooltip.append("polyline") // The rectangle containing the text, it is 210px width and 260 height
                 .attr("points","0,0 210,0 210,260 0,260 0,0")
                 .style("stroke","black")
                 .style("opacity","0.9")
                 .style("stroke-width","1")
                 .style("padding", "1em");
    
          tooltip.append("line") // A line inserted between commune name and arabic name
                 .attr("x1", 40)
                 .attr("y1", 25)
                 .attr("x2", 160)
                 .attr("y2", 25)
                 .style("stroke","red")
                 .style("stroke-width","0.5")
                 .attr("transform", "translate(0, 5)");
    
          var text = tooltip.append("text") 
                            .style("font-size", "13px")
                            .style("fill", "#c1d3b8")
                            .attr("transform", "translate(0, 20)");
    
          text.append("tspan") 
              .attr("x", 105)
              .attr("y", 0)
              .attr("id", "tooltip-wilaya")
              .attr("text-anchor", "middle")
              .style("font-weight", "200")
              .style("fill", "green")
              .style("font-weight", "bold")
              .style("font-size", "16px");
    
          text.append("tspan") 
              .attr("x", 105) 
              .attr("y", 30)
              .style("fill", "#00FF00")
              .style("font-weight", "bold")
              .text("");

        
          //======================  nom arabe
          text.append("tspan") 
              .attr("x", 105)
              .attr("y", 30)
              .attr("id", "tooltip-wilayaAr")
              .attr("text-anchor", "middle")
              .style("font-weight", "200")
              .style("fill", "green")
              .style("font-size", "16px");
    
          text.append("tspan") // Fixed text
              .attr("x", 145) 
              .attr("y", 0)
              .style("fill", "green")
              .text("");
          //======================  daïra
          text.append("tspan") 
              .attr("x", 140)
              .attr("y", 160)
              .attr("id", "tooltip-daira")
              .style("fill","#c1d3b8")
              .style("font-weight", "bold");
    
          text.append("tspan") // Fixed text
              .attr("x", 40) 
              .attr("y", 160)
              .attr("text-anchor", "middle")
              .style("fill", "929292")
              .style("font-weight", "bold")
              .text("Daïra");
 
          //======================  communes

           text.append("tspan") 
               .attr("x", 140)
               .attr("y", 180)
               .attr("id", "tooltip-commune")
               .style("fill","#c1d3b8")
               .style("font-weight", "bold");
  
          text.append("tspan") // Fixed text
              .attr("x", 60) 
              .attr("y", 180)
              .attr("text-anchor", "middle")
              .style("fill", "929292")
              .style("font-weight", "bold")
              .text("Communes");

          //======================  Habitants

          text.append("tspan") // value udpated population
              .attr("x", 136)
              .attr("y", 200)
              .attr("id", "tooltip-habitants")
              .style("fill","#c1d3b8")
              .style("font-weight", "bold");

          text.append("tspan") // Fixed text
              .attr("x", 60) 
              .attr("y", 200)
              .attr("text-anchor", "middle")
              .style("fill", "#c1d3b8")
              .style("font-weight", "bold")
              .text("Population");

          //======================  Superficie
          text.append("tspan") // value udpated superficie
              .attr("x", 150)
              .attr("y", 220)
              .attr("id", "tooltip-superficie")
              .style("fill","#c1d3b8")
              .style("font-weight", "bold");

          text.append("tspan") // Fixed text
               .attr("x", 80) 
               .attr("y", 220)
               .attr("text-anchor", "middle")
               .style("fill", "929292")
               .style("font-weight", "bold")
               .text("Superficie en km²");

          //=================== image of wilaya
          tooltip.append("g") 
                 .attr('id','tito')
                 .append("svg:image") 
                 .attr("x", 25) 
                 .attr("y", 60)

    return tooltip;
  }   

});
}




// Load DATA

d3.json('all-wilayas.json', function(err, json) {
  
json.features.forEach(feature => {
  if(feature.geometry.type == "MultiPolygon") {
        feature.geometry.coordinates.forEach( polygon => {
          polygon.forEach( element => {
            element.reverse();
          })
        })
      }
  else if (feature.geometry.type == "Polygon") {
      feature.geometry.coordinates.forEach( element => {
          element.reverse();
        })  
      }
    })
  update(json)
})