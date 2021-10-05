/*
*    index.js
*                              
╭━━╮╱╱╱╱╭╮╱╱╱╱╱╭╮╱╭╮╱╱╱╱╱╭╮            ━╮ ╭━
╰┫┣╯╱╱╱╱┃┃╱╱╱╱╭╯╰╮┃┃╱╱╱╱╱┃┃             | |
╱┃┃╭━╮╭━╯┣━━┳━┻╮╭╯┃┃╱╱╭━━┫╰━┳━━╮       ╱   ╲
╱┃┃┃╭╮┫╭╮┃┃━┫━━┫┃╱┃┃╱╭┫╭╮┃╭╮┃━━┫      ╱_____╲
╭┫┣┫┃┃┃╰╯┃┃━╋━━┃╰╮┃╰━╯┃╭╮┃╰╯┣━━┃     ╱       ╲  
╰━━┻╯╰┻━━┻━━┻━━┻━╯╰━━━┻╯╰┻━━┻━━╯    (_________)  

This science experiment provides a gentle visual introduction to 
the many, many components that constitute the Talend Data Fabric.

Recommend viewing in Visual Source Code. 
Learning Comment: most popular code editor.
*/
'use strict';

/* global variables
   Learning comment: should design to not use global variables */
let componentTree //tree graph of components
let titleObject  //title object
let titleData    //title text
let select       //language option selection
let description  //descriptions of the components that appear in tooltips
let data         //names of the components for the data viz
let translations //title text translated
let searchData   //search index for typeahead functionality

// get the data (should have just output it all to one json file, sigh.)
// 1. Component descriptions
// 2. Talend Components and lineage
// 3. Various language tranlations for pull-down menu

/* Learning comment:
 * Promise = a placeholder object for the future result of an asynchronous operation.
 * or
 * Promise = a container for an asynchronously delivered value.
 * or
 * Promise = a container for a future value. (like a response from an AJAX call)
 * or
 * How to escape callback hell (ES6)
 */
    /* Talend branded color palette:
    coral: #ff6d70; indigo gray: #323e48; pale cyan: #91d1ed;  russian violet: #2C1F56; deep blue: #19426c
    */
    const colors = ["#ff6d70", "#323e48", "#91d1ed", "#2c1f56", "#19426c"];
    const width = 1224
    const height = 22000
    const svg = d3.select("#componentTree").append('svg')
                  .attr('width', width)
                  .attr('height', height)
                  // .style('opacity',0)

    const g = svg.append("g").attr("transform", "translate(120,150)")

    const chaos = d3.select('img').attr("transform", "translate(110,150)")

    // Define the div for the tooltip
    // needs to be changed as this grabs all divs
    const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style('opacity', 0);

    const tree = d3.tree()
      .size([height, width]);
// tree.nodeSize([height, width]) may cure clipping.
    const cluster = d3.cluster()
      .size([height, width - 160]);

    var stratify = d3.stratify()
      .parentId(d => { return d.id.substring(0, d.id.lastIndexOf(".")); });

    // get the data (should have just output it all to one json file, sigh.)

    const promises = [
      d3.json('data/ComponentDescriptions.json'),
      d3.csv('data/TalendComponents.csv'),
      d3.json('data/translations.json')
    ]

    Promise.all(promises).then(allData => {

      description  = allData[0] //descriptions of the components that appear in tooltips
      data         = allData[1] //names of the components
      titleData    = allData[2] //translations to various languages
    // always check your data with console.log(data) otherwise things go screwy quickly.
      
      titleObject = new TitleObject('#title-area')
      searchData = Object.keys(description)
      autocomplete(document.getElementById("searchInput"), searchData)

      
      const root = stratify(data)
        .sort(function (a, b) { return (a.height - b.height) || a.id.localeCompare(b.id); });

        //cluster(root);  // dendrogram
        tree(root);  // Tidy tree

      const link = g.selectAll(".link")
        .data(root.descendants().slice(1))
        .enter().append("path")
        .attr("class", "link")
        .attr("stroke", d => colors[d3.randomInt(5)()])
        .attr("d", diagonal);

      const node = g.selectAll(".node")
        .data(root.descendants())
        .enter().append("g")
        .attr("class", function (d) { return "node" + (d.children ? " node--internal" : " node--leaf"); })
        .attr('transform', function (d) { return "translate(" + d.y + "," + d.x + ")"; })
        .attr("cursor", "pointer")
        .attr("pointer-events", "all")

      node.append("circle")
        .attr("r", 3.5)
        .attr("fill", d => { return colors[d3.randomInt(5)()] });

      node.append("text")
        .attr("dy", '0.32em') //was 3
        .attr("x", d => { return d.children ? -8 : 8; })
        .attr("id", function (d) { return d.id.substring(d.id.lastIndexOf(".") + 1); })
        .style("text-anchor", d => { return d.children ? "end" : "start"; })
        .text(d => { return d.id.substring(d.id.lastIndexOf(".") + 1); })
        // cool tooltips appear describing the component
        .on("mouseover", (event, d) => {
          tooltip.transition()
            .duration(200)
            .style("opacity", .9);
          tooltip.html(urlExists(d.id.substring(d.id.lastIndexOf(".") + 1), description[d.id.substring(d.id.lastIndexOf(".") + 1)]))
            .style("left", (event.pageX) + "px")   // d3.event went away at version 6
            .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", d => {
          tooltip.transition()
            .duration(500)
            .style("opacity", 0);
        });

      d3.selectAll("input")
        .on("change", changed)

      // let timeout = setTimeout(function () {
      //   d3.select("input[value=\"tree\"]")
      //     .property("checked", true)
      //     .dispatch("change");
      // }, 3000);

      function changed() {
        timeout = clearTimeout(timeout);
        (this.value === "tree" ? tree : cluster)(root)
        const t = d3.transition().duration(2750)
        node.transition(t).attr("transform", d => `translate(${d.y}, ${d.x})`)
        link.transition(t).attr("d", diagonal);
      }
      // Utility function to check to see if the icon image exists, if not then default to HAL9000 icon and message.
      function urlExists(componentName, description) { // from http://jsfiddle.net/gvf7V/4/
        const url = "img/" + componentName + "_icon32.png"; //assume naming convention
        let htmlCode
        $.ajax({
          async: false, //  yeah, yeah, deprecated but it works! See https://xhr.spec.whatwg.org/ for a supported way.
          type: 'HEAD',
          url: url,
          success: function () {
            htmlCode = "<img style='padding: 10px' src='img/" + componentName + "_icon32.png' />";
            htmlCode = htmlCode + "<span>" + "<b>" + componentName +"</b>: " + description + "</span>";
          },
          error: function () {
            htmlCode = "<img width='64px' style='padding: 10px' src='img/hal9000.svg'/><span>I'm sorry Dave, I'm afraid I can't do that.</span>"
          }

        });
        return (htmlCode)
      } // end of urlExists function

 
    }).catch(error => {
      console.log(error)
    })
// get menu selection for languages
    select = d3.select('#translation-selector')
                .on('change', () => titleObject.updateVis() )

// this function moves to the component and centers it on the page.
    function goToComponent(suggestion) {
        if(suggestion) {
        document.getElementById(suggestion).scrollIntoView({
                behavior: "smooth",
                block: "center",
                inline: "center"
                })
        }
    }
    // I believe this creates a curved (diagonal) path from parent to the child nodes 
    function diagonal(d) {
      return "M" + d.y + "," + d.x
        + "C" + (d.parent.y + 100) + "," + d.x
        + " " + (d.parent.y + 100) + "," + d.parent.x
        + " " + d.parent.y + "," + d.parent.x;
    }
    const xOpacity = 50
    const yOpacity = 500
    const xTitleOpacity = 0
    const yTitleOpacity = 150
    const moreOpacity = d3.scaleLinear()
      .domain([xOpacity, yOpacity])   //screen coordinates
      .range([0, 1])        //increase opacity values
      .clamp(true)          //always in range
    const lessOpacity = d3.scaleLinear()
      .domain([xOpacity, yOpacity])    //screen coordinates
      .range([1,0])         //decrease opacity values
      .clamp(true)          //always in range
// we want the title to disappear faster

    const moreTitleOpacity = d3.scaleLinear()
      .domain([xTitleOpacity, yTitleOpacity])   //screen coordinates
      .range([0, 1])        //increase opacity values
      .clamp(true)          //always in range
    const lessTitleOpacity = d3.scaleLinear()
      .domain([xTitleOpacity, yTitleOpacity])    //screen coordinates
      .range([1,0])         //decrease opacity values
      .clamp(true)          //always in range


    const checkpoint = 300  // point 
    let scrollToViewFlag = false

  /* Learning comment and a Best practice: don't attach handlers to the window scroll event => performance hit
     and always just cache the selector queries
     that you are re-using (just ask Twitter 8) */
     // ToDo - use D3
  // cache query results
    const scrollWrapper = document.querySelector(".scroll-wrapper")
    const titleWrapper  = document.querySelector(".title-wrapper")    
    const imgWrapper    = document.querySelector(".chaos")
    const searchWrapper = document.querySelector(".search-wrapper")
    const treeWrapper   = document.querySelector(".componentTree")
    treeWrapper.style.opacity = 0

//  Change transparency as we scroll    
    let container = d3.select(window)

    container
      .on("scroll.scroller", () => {
         const moreO = moreOpacity(window.scrollY)
         const lessO = lessOpacity(window.scrollY)
         const moreTitleO = moreTitleOpacity(window.scrollY)
         const lessTitleO = lessTitleOpacity(window.scrollY)
        
         if(window.scrollY <= checkpoint) {
          scrollWrapper.style.opacity = lessTitleO
          titleWrapper.style.opacity = lessTitleO
          imgWrapper.style.opacity = lessTitleO
          searchWrapper.style.opacity = moreO
          treeWrapper.style.opacity = moreO
          scrollToViewFlag = false
        } else {
          scrollWrapper.style.opacity = lessTitleO
          titleWrapper.style.opacity = lessTitleO
          imgWrapper.style.opacity = lessTitleO
          searchWrapper.style.opacity = moreO
          treeWrapper.style.opacity = moreO
        }
        if(scrollToViewFlag == false && window.scrollY > checkpoint+100) {
          scrollToViewFlag = true
          // if (navigator.userAgent.match(/Chrome|AppleWebKit/)) { 
          //   window.location.href = "#Talend Studio";
          //   console.log("matched Chrome")
          // } else {
          //   window.location.hash = "Talend Studio";
          // }
          // goToComponent("Talend Studio")
          window.scrollTo(0, 9750) // too fast; need a transition
        }
      })

// Y Brushing
    const hXBrush = 40
    , wYBrush = 40
    , mYBrush = {top: 10, bottom: 15, left: 30, right: 10}
    const margin = {top: 10, bottom: 15, left: 30, right: 10}

    const contextY = svg.append("g")
      .attr("class", "context")
      .attr("transform", `translate(${mYBrush.left},${margin.top})`);

    const yYScaleBrush = d3.scaleLinear()
      .range([height - margin.top - margin.bottom, 0])
      // .domain(d3.extent(data, d => d[yCol])).nice();

    const xYScaleBrush = d3.scaleLinear()
      .range([0, wYBrush])
      // .domain(d3.extent(data, d => d[xCol])).nice();


    // function brushedY() {
    //   let extent = d3.event.selection.map(yYScaleBrush.invert, yYScaleBrush);
    //   yScale.domain([extent[1], extent[0]]);
    //   circles.attr("cy", d => yScale(d[yCol]))
    //   yAxis.call(d3.axisLeft(yScale));
    // }

    // const brushY = d3.brushY().extent([[0, 0],[wYBrush, h - hXBrush]]).on("brush", brushedY);


