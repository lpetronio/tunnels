import * as d3 from "d3";
import {range, extent, mean, median} from "d3-array";
import plotUtils from "../utils/plot-utils.js";


function init(config, data){
  getDimension(config);
  config.plotData = createData(config, data)
  config.scales = createScales(config, data)
  render(config, data)
  
    
}
function getDimension(config){
  if (config.dimension.height == undefined){
      config.dimension.height = d3.select(`#${config.rootId}`).node().clientHeight;
  } 
  if (config.dimension.width == undefined){
      config.dimension.width = d3.select(`#${config.rootId}`).node().clientWidth;
  } 
}
function createData(config, data){
  return data.map(d=> d)
}

function createScales(config, data){

  let flat = [];
  data.forEach((d)=>{
    d.ancestry.forEach((e)=>{
      flat.push({z: e.af, ac: e.ac, an:e.an})
    })
  })

  let y = d3.scaleBand().domain(config.yAxisDomain).rangeRound([0, config.dimension.height]);
  let x = d3.scaleLinear().domain(config.query.positionRange).range([0, config.dimension.width]);

  return {
    x: x,
    y: y,
    z: d3.scaleLinear().domain(d3.extent(flat, function(d){ return d[config.zAxis] })).range([0, y.bandwidth()])
  }
}
function render(config){
  console.log(config.plotData)

  let plot = plotUtils.checkForSVG(config.parentId, config.domId, config.dimension, config.padding);
  plot.selectAll("rect").data(config.plotData)
}
/** based on  */
export async function loadData(config, dataFiles){

  let plotData = [];  

    await Promise.all([
      d3.tsv(`${dataFiles}`)
    ])
    .then(data => {
      const columns = data[0].columns;
      const ancestry = columns.map(function(e){ return e.split("-")[1]}).filter(function(e){ return e != undefined})
      const uniqueAncestry = ancestry.filter(onlyUnique)

      data[0].forEach((d)=>{
        let obj = uniqueAncestry.map((e)=>{
          return {
            ancestry: e,
            af: +d[`AF-${e}`],
            ac: +d[`AC-${e}`],
            an: +d[`AN-${e}`],
            position: +d["location"],
            chr: d["chr"]
          }
        })
     //   plotData.push(obj)
       plotData.push({chr: d.chr, position: d.location, ancestry: obj, AFtotal:+d["AF_total"] })
      })
      config.yAxisDomain = uniqueAncestry;
      // plotData.push({ancestryDomain: uniqueAncestry})

      
    })

   init(config, plotData)
  
  }

  function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
  }
  
