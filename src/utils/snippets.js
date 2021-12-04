var arr = [
    {shape: 'square', color: 'red', used: 1, instances: 1},
    {shape: 'square', color: 'red', used: 2, instances: 1},
    {shape: 'circle', color: 'blue', used: 0, instances: 0},
    {shape: 'square', color: 'blue', used: 4, instances: 4},
    {shape: 'circle', color: 'red', used: 1, instances: 1},
    {shape: 'circle', color: 'red', used: 1, instances: 0},
    {shape: 'square', color: 'blue', used: 4, instances: 5},
    {shape: 'square', color: 'red', used: 2, instances: 1}
];
function groupAndSum(arr, groupKeys, sumKeys){
  return Object.values(
    arr.reduce((acc,curr)=>{
      const group = groupKeys.map(k => curr[k]).join('-');
      acc[group] = acc[group] || Object.fromEntries(groupKeys.map(k => [k, curr[k]]).concat(sumKeys.map(k => [k, 0])));
      sumKeys.forEach(k => acc[group][k] += curr[k]);
      return acc;
    }, {})
  );
}

const res = groupAndSum(arr, ['shape', 'color'], ['used', 'instances']);





function groupAndSum2(arr){
    const result = [...arr.reduce((r, o) => {
        const key = o.ancestry + '-' + o.guideId;
        
        const item = r.get(key) || Object.assign({}, o, {
          used: 0,
          instances: 0
        });
        
        item.used += o.used;
        item.instances += o.instances;
      
        return r.set(key, item);
      }, new Map).values()];
      
      console.log(result);
}