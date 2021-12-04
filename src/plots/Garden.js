
import * as d3 from "d3";
import colorUtils from "../utils/color-utils.js";
import plotUtils from "../utils/plot-utils.js";
import PolarArea from "./PolarArea.js";

const   outerRadius = 50, 
        innerRadius = 0,
        trackHeight = 30,
        plotHeight = trackHeight + (outerRadius*2);

export default class Garden {
    constructor(data, 
        plotConfig,
        rootId, 
        domId,
        dimension,
        padding={top: 50, right: 50, bottom:50, left:50},
    ) { 
  //      this.sanityCheck(data); // check data for all necessary attributes 

        this.data = data;
        this.plotConfig = plotConfig;
        this.rootId = rootId;
        this.domId = domId;
        this.dimension = dimension; // if height is not defined, height will be maxRadius * yDomain.length.
        this.padding = padding;      
        this.updateDimension();
        this.createScales(); 
    }
    /** 
     * @param data 
     */
    sanityCheck(data){

    }
    /**
     * TODO: calculate height based on number of y-values * maxRadius
     */
    updateDimension() {
      
        this.dimension.height = d3.max(this.data.map(d=>d.y)) * (plotHeight) + this.padding.top + this.padding.bottom;
        this.dimension.innerHeight = d3.max(this.data.map(d=>d.y)) * (plotHeight);

        this.dimension.width = d3.select(`#${this.rootId}`).node().clientWidth;
        this.dimension.innerWidth = this.dimension.width - this.padding.left - this.padding.right;
  
    }
    createScales(){
        const YLOrRd = d3.interpolateYlOrRd;
        const interpGrey = d3.interpolate("rgb(250,250,250)", "rgb(150,150,150)");

        this.scale = {
            y: d3.scaleLinear().domain(d3.extent(this.data.map(d=>d.y))).range([0, this.dimension.innerHeight]),
            point: {
                x: d3.scaleLinear().range([0, this.dimension.innerWidth]).domain([0, 8]),
                x1: d3.scaleLinear().range([0, this.dimension.innerWidth]),
                outerRadius: d3.scaleLinear().domain([0, 0.001, 1]).range([innerRadius, 8, outerRadius]),
                color: d3.scaleOrdinal().domain(['oth', 'ami', 'sas', 'fin', 'eas', 'amr', 'afr', 'mid', 'asj', 'nfe']).range(colorUtils.categorical)
            }
        };   

    }  
    render(){
        let dimension = this.dimension;
        let data = this.data;
        let scale = this.scale;

        var svg;
        if (!document.getElementById(`${this.rootId}-svg`)) { 
            svg = plotUtils.createSvg(this.rootId, this.padding, this.dimension);
        } else {
            svg = d3.select(`#${this.rootId}-svg`);
        } 
        let group = svg.append("g")
            .attr("class", `${this.domId}`)
            .attr("transform", `translate(${this.padding.left}, ${this.padding.top})`);

        group.selectAll(".plot")
            .data(data)
            .enter()
            .append("g")
            .attr("class", "plot")
            .attr("id",(d)=>{ 
                return `plot-${d.key}`
            })
            .attr("transform", (d)=>{ 
                return `translate(0,${scale.y(d.y)})`
            })
            .each(function(d){
             
                renderTrack(`plot-${d.key}`, d.values, scale.point, dimension)
                renderPoint(`plot-${d.key}`, d.values, scale.point)
        })
    }

}

function renderPoint(domId, data, scale){

    d3.select(`#${domId}`).selectAll(".point")
        .data(data)
        .enter()
        .append("g")
        .attr("class", "point")
        .attr("transform", (d)=>{ 
            return `translate(${scale.x1(d.x1)},${-outerRadius})`
        })
        .each(function(d){
            const renderAxis = (ticks)=>{
                d3.select(this).selectAll(".outerRadius-tick")
                    .data(ticks)
                    .enter()
                    .append("circle")
                    .attr("class", "outerRadius-tick")
                    .attr("cx", 0)
                    .attr("cy", 0)
                    .attr("r", e=> scale.outerRadius(e))
            };
            const renderSeries = ()=>{
                var pie = d3.pie()
                    .sort(null)
                    .value(function (){ return 1; });
                
                var arc = d3.arc()
                    .innerRadius( innerRadius)
                    .outerRadius( (e)=> { 
                        return scale.outerRadius(e.data.outerRadius);
                    });

                var pathG = d3.select(this).selectAll(".series")
                    .data(pie(d.values)
                    .sort(function(a, b) { return d3.ascending(a.data.key, b.data.key ); })
                    );
        
                pathG
                    .enter()
                    .append("g")
                    .each(function(d){
                        let renderPath = ()=>{
                            d3.select(this).append("path")
                            .attr("class", "series")
                            .attr("fill", (e)=> { 
                                return scale.color(e.data.color); // d3.pie stores original attrs in .data attr
                            })
                            .attr("d", arc)
                        }
                        let renderLabel = ()=>{
                            d3.select(this).append("text")
                            .attr("class", "series-label") //add a label to each slice
                            .attr("fill", d=> scale.color(d.data.color))
                            .attr("transform", function(d) {
                                var c = arc.centroid(d),
                                xp = c[0],
                                yp = c[1],
                                // pythagorean theorem for hypotenuse
                                hp = Math.sqrt(xp * xp + yp * yp),
                                labelr = scale.outerRadius(d.data.outerRadius) + 15;
                                return "translate(" + (xp / hp * labelr) + ',' +
                                (yp / hp * labelr) + ")";
                            })
                            .attr("text-anchor", "middle") //center the text on it's origin
                            .text(d.data.outerRadius)
                            .attr("dy", 4)

                            // textEl.append('tspan')
                            // .text(function(d, i) {
                            //     return data[i].label;
                            // });

                            // textEl.append('tspan')
                            // .text(function(d, i) {
                            //     return data[i].value;
                            // })
                            // .attr('x', '0')
                            // .attr('dy', '1.2em');
                        }
                        renderPath();
                        renderLabel();
                       
                    })
                   
                pathG.exit().remove();

            };
            const renderPointLabel = ()=>{
                d3.select(this).append("text")
                .html(`${d.label}`)
                .attr("class", "point-label")
                .attr("x", 0)
                .attr("y", -outerRadius)
                .attr("text-anchor", "middle")
            };
        //  renderAxis([.5])
            renderSeries()
        // renderPointLabel()
        })
}


function renderTrack(domId, data, scale, dimension){

    scale.x1.domain(d3.extent(data.map(d=>d.x1)))
    let renderRect = () =>{
        d3.select(`#${domId}`).append("rect")
        .attr("width", dimension.innerWidth)
        .attr("x", 0)
        .attr("y", 0)
        .attr("height", trackHeight)
        .attr("class", "track")
    }
    
    let renderTicks = ()=>{
        d3.select(`#${domId}`).selectAll(".track-tick")
        .data(data)
        .enter()
        .append("g")
        .attr("class", "track-tick")
        .attr("transform",d=>`translate(${scale.x1(d.x1)},0)`)
        .each(function(d){
            d3.select(this).append("line")
                .attr("class", "track-line")
                .attr("x1",  0)
                .attr("x2",  0)
                .attr("y1", 0)
                .attr("y2", trackHeight)

            d3.select(this).append("line")
                .attr("class", "track-line")
                .attr("x1",  0)
                .attr("x2",  0)
                .attr("y1", 0)
                .attr("y2", -outerRadius)

            d3.select(this).append("text")
                .attr("x", 0)
                .attr("y", trackHeight)
                .attr("dy", 14)
                .attr("text-anchor", "middle")
                .html(function(d){ return d.x1 })
                .attr("class", "track-tick")
                
                
        })

    }
    renderRect()
    renderTicks()

}
