/*
*    titleObject.js
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
*/

'use strict';

class TitleObject {
  constructor(_parentElement) {
    this.parentElement = _parentElement

    this.initVis()
  }

  initVis() {
    const vis = this
    vis.title = d3.select(vis.parentElement).append('p')
      .attr('class', 'titleObject') // main title
      .html(titleData['English'][0]['title'])

    vis.scroll = d3.select('#scroll') // scroll verb above arrow
      .html(titleData['English'][0]['scroll'])

    vis.searchPlaceholder = d3.select('#searchInput') // search input box
      .attr('placeholder',titleData['English'][0]['searchPlaceholder'])

    vis.searchButton = d3.select('#searchButton') // search button
      .attr('value', titleData['English'][0]['searchButton'])

    // d3.select('#searchInput').attr('placeholder', 'Find component')
    // d3.select('#searchButton').attr('value', 'Go')

    const languages = Object.keys(titleData) // get the options data for select value to make translations

 // add the options to the pull-down
    d3.select("#translation-selector")
      .selectAll('myOptions')
        .data(languages)
      .enter()
        .append('option')
      .text( d => d)
      .attr('value', d => d)

    vis.updateVis()
  
  }

  updateVis() {
    const vis = this

    select = d3.select('select').property('value')

    vis.title // update title
      .html(titleData[select][0].title)
    vis.scroll // update scroll verb
      .html(titleData[select][1].scroll)
    vis.searchPlaceholder // update search input button
      .attr('placeholder', titleData[select][2].searchPlaceholder)
    vis.searchButton // update search button label
      .attr('value', titleData[select][3].searchButton)     
    
    const zero = d3.format("04d");
    const num_components = d3.select('#num_components')
      .text(zero(1))
    num_components.transition()
      .tween("text", function () { // animated counter for number of components.
        let selection = d3.select(this)    // selection of node being transitioned
        let start = d3.select(this).text() // start value prior to transition
        let end = 1113                     // specified end value
        let interpolator = d3.interpolateNumber(start, end) // d3 interpolator
  
        return (t) => { selection.text(zero(Math.round(interpolator(t)))) }  // return value
      })
      .duration(3000) //Why 3000? Line from Marvel Universe.
  }
}

