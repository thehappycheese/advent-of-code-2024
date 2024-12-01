document.body.innerText
.trim()
.split("\n")
.map(item=>item.split("   ").map(parseFloat))
.reduce((acc, curr) => curr.map((item, i) => (acc[i] || []).concat(item)), [])
.map(item=>item.sort())
.reduce((a,b)=>a.map((a,i)=>Math.abs(a-b[i])))
.reduce((a,b)=>a+b)
