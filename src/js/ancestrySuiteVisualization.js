import * as d3 from "d3";
import {range, extent, mean, median} from "d3-array";
import PolarArea from "../plots/PolarArea.js";
import Aster from "../plots/Aster.js";
import Garden from "../plots/Garden.js";
import helperUtils from "../utils/helper-utils.js";


const ancestries = ['oth', 'ami', 'sas', 'fin', 'eas', 'amr', 'afr', 'mid', 'asj', 'nfe'];


function controller(config, data){
  launch(config, data)
}

function launch(config, data){


  d3.select(`#${config.domId}`).remove();


  let jsonForSummary = formatJSONforSummaryView(data)
  let summaryPlotData = createSummaryPlotData(jsonForSummary, config.summaryView.plotConfig)

  const summaryPlot = new Aster(summaryPlotData, config.summaryView.plotConfig, config.summaryView.rootId, config.summaryView.domId,config.summaryView.dimension, config.summaryView.padding)
  summaryPlot.render()


  let formatJSONforDetail = formatJSONforDetailView(data)
  // let detailPlotData = createDetailPlotData(formatJSONforDetail, config.detailView.plotConfig)
  // const detailPlot = new PolarArea(detailPlotData[0].values, config.detailView.plotConfig, config.detailView.rootId, config.detailView.domId, config.detailView.dimension, config.detailView.padding)
  // detailPlot.render()

let gardenPlotData = createGardenPlotData(formatJSONforDetail, config.gardenView.plotConfig)

const gardenPlot = new Garden(gardenPlotData, config.gardenView.plotConfig, config.gardenView.rootId, config.gardenView.domId, config.gardenView.dimension, config.gardenView.padding)
gardenPlot.render()



}



function formatJSONforSummaryView(data){
  let createHeirarchy = () =>{
    let nest = d3.nest()
      .key(d=> d.guideID)
      .key(d=> d.ancestry)
      .entries(data.guides)
    return nest
  }
  let nest = createHeirarchy();
  nest.forEach(guide=>{
    guide.guideID = guide.key;
    guide.mismatchFrequency = data.guidesToMismatchFrequency[`${guide.key}`].total;
    guide.values.forEach(ancestry=>{
      ancestry.ancestry = ancestry.key;
      ancestry.mismatchFrequency = data.guidesToMismatchFrequency[`${guide.key}`][`${ancestry.key}`]
      // ancestry.values.forEach(position=>{
      //   let vals = []
      //   for (let a = 0; a<ancestries.length; a++){
      //     if (position.ancestry != ancestries[a]){
      //       vals.push({ancestry: ancestries[a], mismatchFrequency: 0})
      //     }
      //   }
      //   position.vals = vals
       
      // })
    })
  })

  return nest;

}

function formatJSONforDetailView(data){
  let createHeirarchy = () =>{
    let nest = d3.nest()
      .key(d=> d.guideID)
      .key(d=> d.position)
      .entries(data.guides)
    return nest
  }
  let nest = createHeirarchy();
  nest.forEach(guide=>{
    guide.guideID = guide.key;
    guide.mismatchFrequency = data.guidesToMismatchFrequency[`${guide.key}`].total;
    guide.values.forEach(position=>{
      position.position = position.key; 
      position.guideID = guide.guideID;
     
    })
  })
  console.log(nest)
  return nest;

}

function createSummaryPlotData(data, config){

  let createGrid = ()=>{
    let rows = 6, 
      columns = 6; 
    let grid = [];
    for(var row = 0; row < rows; row++){ 
        for(var column = 0; column < columns; column++){
            grid.push({y: row, x:column})
        }
    }
    return grid;
  }
  let checkX = (axis, d, i)=>{
    let x;
    if (axis.x == undefined){
      x = grid[i].x; 
    } else {
      x = d[`${axis.x}`]
    }
    return x;
  }
  let checkY = (axis, d, i)=>{
    let y;
    if (axis.y == undefined){
      y = grid[i].y; 
    } else {
      y = d[`${axis.y}`]
    }
    return y;
  }

  let grid = createGrid();

  data.forEach((point, i)=>{
      point.x = checkX(config.axis, point, i)
      point.y = checkY(config.axis, point, i)
      point.label = point[`${config.label}`]

      point.node = {
        color: point[`${config.node.color.attr}`],
        label: helperUtils.precise(point[`${config.node.label}`])
      }
      point.values.forEach((series)=>{
        series.customColor = series[`${config.series.customColor.attr}`]; 
        series.color = series[`${config.series.color.attr}`];
        series.outerRadius = series[`${config.series.outerRadius}`];
      })
    });
    return data
}

function createGardenPlotData(data, config){

  data.forEach((plot,i)=>{
    plot.x = 0;
    plot.y = i;
    plot.label = plot[`${config.label}`]
    plot.values.forEach((point, i)=>{
        point.x1 =  +point[`${config.point.axis.x}`],
        point.x2 =  +point[`${config.point.axis.x}`],
        point.x = i,
        point.y = 0,
        point.label = point[`${config.point.label}`],
        point.values.forEach(series=>{
          series.color = series[`${config.point.series.color.attr}`]
          series.customColor = series[`${config.point.series.customColor.attr}`]
          series.outerRadius = series[`${config.point.series.outerRadius}`]
        })
    })
  })
  return data
}

function createDetailPlotData(data, config){
  data.forEach(guide=>{
    guide.values.forEach((point)=>{
      point.x = +point[`${config.axis.x}`]
      point.y = +point[`${config.axis.y}`]
      point.label = point[`${config.label}`]

      point.values.forEach((series)=>{
        series.customColor = series[`${config.series.customColor.attr}`]; 
        series.color = series[`${config.series.color.attr}`];
        series.outerRadius = series[`${config.series.outerRadius}`];
      })
    });
  })
    return data
}


export async function loadData(config){
  console.log(config)
  // let returned = {}
  // await Promise.all([
  //   d3.json(`${dataFiles.guideData}`),
  //   d3.json(`${dataFiles.guidesToMismatchFrequency}`),
  //   d3.json(`${dataFiles.guidesToGenes}`)
  // ])
  // .then(data => {
  //    returned.guides = data[0].filter(d=> { return d.ancestry != "total" })
  //    returned.guidesToMismatchFrequency = data[1]
  //    returned.guidesToGenes = data[2]
  // })
  // controller(config, returned)
}

