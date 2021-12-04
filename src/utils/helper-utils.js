import * as d3 from "d3";

 export default {
        onlyUnique(value, index, self) {
        return self.indexOf(value) === index;
      },
       precise(x) {
        return Number.parseFloat(x).toPrecision(1);
      },
       getNestedExtent( data, prop ) {
        var arr = [];
        data.map(function(value) {
            arr = arr.concat.apply(arr, value);
        });
        return d3.extent(arr.map(d=> d[prop]));
      },
       groupBy(array, f) {
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
 } 

 
