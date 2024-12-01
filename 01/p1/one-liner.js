(
    ab=document.body.innerText
        .trim()
        .split("\n")
        .map(item=>item.split("   ").map(parseFloat))
        .reduce((acc,cur)=>[
            [...acc[0], cur[0]],
            [...acc[1], cur[1]]
        ],[[],[]])
		.map(item=>item.sort())
)[0].map((item_a, index)=>Math.abs(item_a-ab[1][index])).reduce((a,b)=>a+b);