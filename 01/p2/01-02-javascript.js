document.body.innerText
.trim()
.split("\n")
.map(item=>item.split("   ").map(parseFloat))
.reduce((acc, cur) => {
    acc[0].push(cur[0])
    acc[1][cur[1]] = (acc[1][cur[1]]??0) + 1
    return acc
}, [[],{}])
.reduce((list, map)=>list.map(item=>item*(map[item]??0)))
.reduce((a,b)=>a+b)