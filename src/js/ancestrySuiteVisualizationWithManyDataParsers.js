import * as d3 from "d3";
import {range, extent, mean, median} from "d3-array";
import snps from "../models/GuidesToSNPs.js";
import PolarAreaPoint from "../plots/PolarAreaPoint.js";
import Aster from "../plots/Aster.js";





function controller(config, data){

  $("#af").on("click", d=>{
    config.yAxis = "af"
    launch(config, data)
  })
  $("#an").on("click", d=>{
    config.yAxis = "an"
    launch(config, data)
  })
  $("#ac").on("click", d=>{
    config.yAxis = "ac"
    launch(config, data)
  })
  launch(config, data)
}

function launch(config, data){
  d3.select(`#${config.domId}`).remove();



  let jsonForSummary = parseFlatJSONToSummary(data.snps, config.summaryConfig[config.summaryConfig.type])
  console.log(jsonForSummary)


let summaryData = formatGuideSummaryData(data.guides)
let detailData = formatSNPDetailData(data.snps)

let summaryPlotData = createSummaryPlotData(summaryData, config.summaryConfig.axis, config.summaryConfig.points)

  const summaryPlot = new Aster(summaryPlotData, config.rootId, config.domId, config.summaryConfig.axis, config.summaryConfig.point, config.dimension, config.padding)
  summaryPlot.render()



}

function parseFlatJSONToSummary(data, point){
  let createHeirarchy = () =>{
    let nest = d3.nest()
      .key(d=> d[`${point.key}`])
      .key(d=> d[`${point.series.key}`])
      .entries(data)

      return nest
  }
  let nest = createHeirarchy();
  let calcSums = () => {
    nest.forEach(d=>{
      d.values.forEach(e=>{
        let arr = [];
        e.values.forEach(f=>{
          arr.push(1-f.total)
        })
        e.total = 1 - arr.reduce((arr, n) => arr * n, 1);
      })
    })
    return nest
  }
    return calcSums()
}





/** should the input be in a nested structure????  */
function createSummaryPlotData(nest, axis, points){
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
  let grid = createGrid();

  let checkX = ()=>{
    if (axis.x == undefined){
      point.x = grid[i].x; 
    } else {
      point.x = point[`${axis.x}`]
    }
  }

    nest.forEach((point, i)=>{
      point.color = point[`${axis.color}`]
      point.key = point[`${points.key}`]
    
      if (axis.x == undefined){
        point.x = grid[i].x; 
      } else {
        point.x = point[`${axis.x}`]
      }
      if (axis.y == undefined){
        point.y = grid[i].y; 
      } else {
        point.y = point[`${axis.y}`]
      }
    
      point[`${points.series}`].forEach((series)=>{
        series.customColor = series[`${points.customColor}`];
        series.color = series[`${points.color}`];
        series.outerRadius = series[`${points.outerRadius}`];
      })
      point.series = point[`${points.series}`]
      delete point[`${points.series}`];
    });
    return nest
}
function formatGuideSummaryData(data){
  return Object.keys(data).map(d=>{ 
    return {
      guideId: d,
      ancestries: Object.keys(data[`${d}`]).map(e=>{
          return {
            ancestry: e,
            total: data[`${d}`][`${e}`]
          } 
      }).filter((e)=> {return e.ancestry!="total"}),
      total: data[`${d}`].total
    }
  })
}
function formatSNPDetailData(data){
  let nest = d3.nest()
    .key(d=> d.guideId)
    .key(d=> d.position)
    .key(d=> d.ancestry)
    .entries(data)

  nest.forEach(guide=>{
    guide.values.forEach(position=>{
      position.values.forEach(ancestry=>{
        ancestry.total = ancestry.values[0].total
      })
    })
  })
  return nest
}


// function createPolarAreaPoint(data, axis, point, sortBy){
//   let createDataStructure = ()=>{
//     let nest = d3.nest()
//     .key(d=> d[`${point.point}`])
//     .key(d=> d[`${point.series}`])
//     .entries(data)

//     /** this function is specific to the ancestry data, it calculates mismatchFrequency for each ancestry (series), as well as each guide (point) */
//     let calcOuterRadius = ()=>{
//       nest.forEach(d=>{
//         let arr = [];
//         d.values.forEach(e=>{
//           e.values.forEach(f=>{
//             arr.push(1-f[`${point.outerRadius}`])
//           })
//           e[`${point.outerRadius}`] = 1 - arr.reduce((arr, n) => arr * n, 1);
//         })
//         d[`${point.outerRadius}`] = 1 - arr.reduce((arr, n) => arr * n, 1);
//       })
//     }
//     calcOuterRadius()

//     return nest.sort(function(a,b){
//       return d3.ascending(a[`${sortBy}`], b[`${sortBy}`])
//     }) 

//   }
//   let createGrid = ()=>{
//     let rows = 6, 
//       columns = 6; /** TODO: determine how many rows/columns we need based on length of data and plot size */
//     let grid = [];
//     for(var row = 0; row < rows; row++){ //this loops over the rows
//         for(var column = 0; column < columns; column++){ //this loops over the columns
//             grid.push({y: row, x:column})
//         }
//     }
//     return grid;
//   }
//   let createPlotData = ()=>{
//     nest.forEach((key, i)=>{
//       key.x = grid[i].x; 
//       key.y = grid[i].y;
//       key.values.forEach((series)=>{
//         series.color = series[`${point.color}`],
//         series.outerRadius = series[`${point.outerRadius}`]
//       })
//       key.series = key.values;
//       delete key.values;
//     });
//     return nest
//   }
//   let nest = createDataStructure();
//   let grid = createGrid();
//     return createPlotData();
// }

// function createAncestryDataModel(config, data){
//   var groups = groupBy(data, function (item) {
//     return [item[`${config.xGroup}`], item[`${config.yGroup}`]];
//   });

//   let result = groups.map(group=>{
//     let afArray = group.map(d=> 1 - d.af)
//     return {
//       ancestry: group[0].ancestry,
//       guideId: group[0].guideId,
//       failureRate: 1 - afArray.reduce((afArray, n) => afArray * n, 1),
//       yGroup: group[0][`${config.yGroup}`],
//       xGroup: group[0][`${config.xGroup}`],
//       values: group.map(item=> {
//         return {
//           position: item.position,
//           af: item.af,
//           x1: item[`${config.xAxis}`],
//           x2: item[`${config.xAxis}`],
//           y1: 0,
//           y2: item[`${config.yAxis}`]
//         }
//       })
//     }
//   })
//   return result
// }
// function formatGuideSummaryData(data){
//   return Object.keys(data).map(d=>{ 
//     return {
//       guideId: d,
//       ancestries: Object.keys(data[`${d}`]).map(e=>{
//         if (e != "total"){
//           return {
//             ancestry: e,
//             total: data[`${d}`][`${e}`]
//           }
//         }
//       }),
//       total: data[`${d}`].total
//     }
//   })
// }
// function formatGuideSummaryData(data){
//   let nest = d3.nest()
//     .key(d=> d.guideId)
//     .key(d=> d.ancestry)
//     .entries(data)

//     nest.forEach(d=>{
//       let arr = [];
//       d.values.forEach(e=>{
//         e.values.forEach(f=>{
//           arr.push(1-f.mismatchFrequency)
//         })
//         e.sumMismatchFrequency = 1 - arr.reduce((arr, n) => arr * n, 1);
//       })
//       d.sumMismatchFrequency = 1 - arr.reduce((arr, n) => arr * n, 1);
//     })
//     return nest
// }
export async function loadData(config, dataFiles){
  let returned = {}
  let parsedSNPs, parsedGuides;
  await Promise.all([
    d3.json(`${dataFiles.Guides}`)
  ])
  .then(data => {
      returned.snps = parseSNPs(snps)
      returned.guides = data[0]
  })
  controller(config, returned)
}

function parseSNPs(data){
  let arr = []
      
  data.forEach(d=>{
    let guideId = Object.keys(d)[0]
    let positions = Object.keys(d[`${guideId}`])
    positions.forEach(e=>{
        let ancestry;
        let entry = d[`${guideId}`][`${e}`]
        entry.guideId = guideId;
        entry.position = e;
        Object.keys(entry).forEach(f=>{
            if (f.startsWith("AF")){
                ancestry = f.split("-")[1]
            }
        })
        entry.ancestry = ancestry;
        arr.push({
                    ancestry: ancestry,
                    total: +entry[`AF-${ancestry}`],
                    position: +e,
                    chr: entry["chr"],
                    guideId: +guideId
                  })
    }) 
  })
  return arr;
}

function parseCVS(data, array){
  const columns = data.columns;
  const ancestry = columns.map(function(e){ return e.split("-")[1]}).filter(function(e){ return e != undefined})
  const uniqueAncestry = ancestry.filter(onlyUnique)

  data.forEach((d)=>{
    uniqueAncestry.forEach((e)=>{
      array.push({
        ancestry: e,
        af: +d[`AF-${e}`],
        ac: +d[`AC-${e}`],
        an: +d[`AN-${e}`],
        position: +d["location"],
        chr: d["chr"],
        guideId: d["guideId"]
      })
    })
  }) 
}



/** helper functions */
  function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
  }
  function precise(x) {
    return Number.parseFloat(x).toPrecision(1);
  }
  function getNestedExtent( data, prop ) {
    var arr = [];
    data.map(function(value) {
        arr = arr.concat.apply(arr, value);
    });
    return d3.extent(arr.map(d=> d[prop]));
  }
  function groupBy(array, f) {
    let groups = {};
    array.forEach(function (o) {
      var group = JSON.stringify(f(o));
      groups[group] = groups[group] || [];
      groups[group].push(o);
  
    });
    return Object.keys(groups).map(function (group) {
    return groups[group]
    })
  }