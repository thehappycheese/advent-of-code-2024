(
    ab=document.body.innerText
        .trim()
        .split("\n")
        .map(item=>item.split("   ").map(parseFloat))
        .reduce((acc,cur)=>({a:[...acc.a, cur[0]].sort(), b:[...acc.b, cur[1]].sort()}),{a:[],b:[]})
).a.map((item_a, index)=>Math.abs(item_a-ab.b[index])).reduce((a,b)=>a+b);