import * as d3 from "d3";

 export default {

    createSvg(id, padding, dimension) {
        const root = d3.select(`#${id}`);
        if (root.empty()) {
            console.error(`Element with id ${id} not found`);
            throw `Element with id ${id} not found`;
        }
        return root.append("svg").attr("id", `${id}-svg`)
            .attr("width", dimension.width)
            .attr("height", dimension.height)
            // .append("g")
            // .attr("id", `${id}-svg-g`)
            // .attr("transform", `translate(${padding.left}, ${padding.top})`);
    }
 } 

 
