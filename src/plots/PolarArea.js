
import * as d3 from "d3";
import colorUtils from "../utils/color-utils.js";
import plotUtils from "../utils/plot-utils.js";
const   outerRadius = 50, 
        innerRadius = 0, 
        asterPadding = 50;


export default class PolarArea {
    constructor(data, 
        plotConfig,
        rootId, 
        domId,
        dimension = {   
            width: d3.select(`#${rootId}`).node().clientWidth, 
            height: d3.select(`#${rootId}`).node().clientHeight,
            innerWidth: d3.select(`#${rootId}`).node().clientWidth - 100,
            innerHeight: d3.select(`#${rootId}`).node().clientHeight - 100
        },
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
        const attr = ["x", "y", "key", "node", "values"];
        let pt = ["outerRadius", "color"];
        data.forEach((d) => {
            attr.forEach((a) => {
                if (d[a] === undefined) throw "Aster Plot: input data error.";
                if (d[a] == "key"){
                    pt.forEach((p)=> {
                        if (a[p] === undefined) throw "Aster Plot: input POINT error.";
                        else throw "Aster Plot: input success";
                    });
                }
            });
        });
    }
    /**
     * TODO: calculate height based on number of y-values * maxRadius
     */
    updateDimension() {
        if (this.dimension.width == undefined){
            this.dimension.width = d3.select(`#${this.rootId}`).node().clientWidth;
        }
        if (this.dimension.height == undefined){
            this.dimension.height = d3.select(`#${this.rootId}`).node().clientHeight;
        }
        this.dimension.innerWidth = this.dimension.width - this.padding.left - this.padding.right;
        this.dimension.innerHeight = this.dimension.height - this.padding.top - this.padding.bottom;

    }
    createScales(){
        const YLOrRd = d3.interpolateYlOrRd;
        const interpGrey = d3.interpolate("rgb(250,250,250)", "rgb(150,150,150)");

        const getColor = (type, attr) =>{
            let colorScale;
            if (type== "ORDINAL"){
                colorScale = d3.scaleOrdinal().domain(this.data[0].values.map(d=> d[`${attr}`])).range(colorUtils.categorical)
            } else {
                colorScale = d3.scaleSequential().domain([0, 1]).interpolator(interpGrey)
            }
            return colorScale
        }

        this.scale = {
            x: d3.scaleLinear().domain(d3.extent(this.data.map(d=> d.x))).range([0, this.dimension.innerWidth]),
            y: d3.scaleLinear().domain(d3.extent(this.data.map(d=>d.y))).range([0, this.dimension.innerHeight]),
            outerRadius: d3.scaleLinear().domain([0, 1]).range([innerRadius, outerRadius]),
            series: {
                color: getColor(this.plotConfig.series.color.type, "color"),
                customColor: getColor(this.plotConfig.series.customColor.type, "customColor")
            }
        };   

    }  
    render(){
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

        group.selectAll(".point")
            .data(data)
            .enter()
            .append("g")
            .attr("class", "point")
            .attr("transform", (d)=>{ 
                return `translate(${scale.x(d.x)},${scale.y(d.y)})`
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
                }
                const renderSeries = ()=>{
                    var pie = d3.pie()
                        .sort(null)
                        .value(function (){ return 1; });
                    
                    var arc = d3.arc()
                        .innerRadius( innerRadius)
                        .outerRadius( (e)=> { 
                            return ((outerRadius - innerRadius) * (e.data.outerRadius) + innerRadius);
                        });

                    var path = d3.select(this).selectAll(".series")
                        .data(pie(d.values)
                        .sort(function(a, b) { return d3.ascending(a.data.key, b.data.key ); })
                        );
            
                    path
                        .enter()
                        .append("path")
                        .attr("class", "series")
                        .attr("fill", (e)=> { 
                            return scale.series.color(e.data.color); // d3.pie stores original attrs in .data attr
                        })
                        .attr("d", arc)
                    
                    path.exit().remove();

                };
                const renderCustom = ()=>{
                    var pie = d3.pie()
                        .sort(null)
                        .value(function (){ return 1; });
                
                    var arc = d3.arc()
                        .innerRadius( innerRadius)
                        .outerRadius( (e)=> { 
                            return (outerRadius - innerRadius) * (e.data.outerRadius) + innerRadius;
                        });

                    var path = d3.select(this).selectAll(".series-custom")
                        .data(pie(d.values)
                        .sort(function(a, b) { return d3.ascending(a.data.key, b.data.key ); })
                        );
            
                    path
                        .enter()
                        .append("path")
                        .attr("class", "series-custom")
                        .attr("fill", (e)=> { 
                            return scale.series.customColor(e.data.customColor);; // d3.pie stores original attrs in .data attr
                        })
                        .attr("d", arc)
                    
                    path.exit().remove();

                };
                const renderPointLabel = ()=>{
                    d3.select(this).append("text")
                    .html(`${d.label}`)
                    .attr("class", "point-label")
                    .attr("x", 0)
                    .attr("y", -outerRadius)
                    .attr("text-anchor", "middle")
                };

                renderAxis([.5, 1])
               // renderCustom()
                renderSeries()
                renderPointLabel()

        })
    }


}


