
import * as d3 from "d3";
import colorUtils from "../utils/color-utils.js";
import plotUtils from "../utils/plot-utils.js";
const 
outerPlotSize = 100,
plotPadding = 200,
innerPlotSize = 50;


export default class PolarAreaPoint {
    constructor(data, 
        rootId, 
        domId,
        axis,
        point,
        dimension = {   
            width: d3.select(`#${rootId}`).node().clientWidth, 
            height: d3.select(`#${rootId}`).node().clientHeight,
            innerWidth: d3.select(`#${rootId}`).node().clientWidth - 100,
            innerHeight: d3.select(`#${rootId}`).node().clientHeight - 100
        },
        padding={top: 50, right: 50, bottom:50, left:50}
    ) { 
        this.sanityCheck(data); // check data for all necessary attributes 
        this.data = data;
        this.rootId = rootId;
        this.domId = domId;
        this.axis = axis;
        this.point = point;
        this.dimension = dimension; // if height is not defined, height will be maxRadius * yDomain.length.
        this.padding = padding;      
        this.updateDimension();
        this.createScales(); 
    }
    /** 
     * check data for x, y, and point attributes 
     * @param data formatted via config with: x, y, point, and groupInfo_ (parsed data)
     */
    sanityCheck(data){
        const attr = ["x", "y", "key", "series"];
        let pt = ["outerRadius", "color"];
        data.forEach((d) => {
            attr.forEach((a) => {
                if (d[a] === undefined) throw "Polar Area Plot: input data error.";
                if (d[a] == "key"){
                    pt.forEach((p)=> {
                        if (a[p] === undefined) throw "Polar Area Plot: input POINT error.";
                        else throw "Polar Area Plot: input success";
                    });
                }
            });
        });
    }
    /**
     * TODO: calculate height based on number of y-values * maxRadius
     */
    updateDimension() {
        this.dimension.width = d3.select(`#${this.rootId}`).node().clientWidth;
        this.dimension.height = d3.select(`#${this.rootId}`).node().clientHeight;
        this.dimension.innerWidth = this.dimension.width - this.padding.left - this.padding.right;
        this.dimension.innerHeight = this.dimension.height - this.padding.top - this.padding.bottom;
    }
    createScales(){

        this.scale = {
            x: d3.scaleLinear().domain(d3.extent(this.data.map(d=> d.x))).range([0, config.dimension.innerWidth]),
            y: d3.scaleLinear().domain(d3.extent(this.data.map(d=>d.y))).range([0, config.dimension.innerHeight]),
            outerRadius: d3.scaleSqrt().domain([0, 0.1,1]).range([innerPlotSize, innerPlotSize, outerPlotSize]),
            color: d3.scaleOrdinal().domain(this.data[0].series.map(d=> d.color)).range(colorUtils.categorical)
        };   

    }  
    render(){
        let data = this.data;
        let scale = this.scale;

        var svg;
        if (!document.getElementById(`${this.rootId}-svg`)) { 
            svg = plotUtils.createSvg(this.rootId, this.padding, this.dimension);
        } else {
            svg = d3.select(`#${this.rootId}-svg-g`);
        } 
        let plot = svg.append("g").attr("class", `${this.domId}`);

        plot.selectAll(".point")
        .data(data)
        .enter()
        .append("g")
        .attr("class", "point")
        .attr("transform", (d)=>{ 
            return `translate(${scale.x(d.x)},${scale.y(d.y)})`
          })
        .each(function(d){

          const renderPoint = ()=>{
            var pie = d3.pie()
            .sort(null)
            .value(function (){ return 1; });
            
            var arc = d3.arc()
            .innerRadius(0)
            .outerRadius(function (e) { 
                return scale.outerRadius(e.data.outerRadius); // d3.pie stores original attrs in .data attr
            });
            var path = d3.select(this).selectAll(".series")
                .data(pie(d.series)
                .sort(function(a, b) { return d3.ascending(a.data.key, b.data.key ); })
                );
    
            path
                .enter()
                .append("path")
                .attr("class", "series")
                .attr("fill", (e)=> { 
                    return scale.color(e.data.color); // d3.pie stores original attrs in .data attr
                })
                .attr("d", arc);
            
            path.exit().remove();
        };
        const renderAxis = ()=>{
            var axis = d3.select(this).append("g")
                .attr("class", "axis")
                .selectAll("axis-tick")
                .data([0, .1, 1])
                .enter().append("g").attr("class", "axis-tick");
        
            axis.append("circle")
                .attr("r", (t)=> scale.outerRadius(t))
                .attr("fill", "none")
              //  .attr("stroke", "black")
                .attr("class", "axis-circle")
        
            axis.append("text")
                .attr("class", "tick")
                .attr("y", function(t) { return -scale.outerRadius(t) - 4; })
                .style("text-anchor", "middle")
                .text(function(t) { return t; });
        }
        renderPoint()
        renderAxis()
        d3.select(this).append("text")
            .html(d.key)
            .attr("class", "point-key")
            .attr("x", 0)
            .attr("y", outerPlotSize)
            .attr("dy", 18)
           

    })
}


}


