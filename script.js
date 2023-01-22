FinalData=""
async function load(link) {
	var image = await fetch(link);
	var buffer = new Uint8Array(await image.arrayBuffer());
	var data = extractChunks(buffer);
	if(!(data.filter(a=>a.name=="dsCr")[0])){
		alert("情報が読み取れませんでした")
		location.reload()
	}
	var string = new TextDecoder('utf-16').decode(data.filter(a=>a.name=="dsCr")[0].data).trim()

	FinalData= parseDonscore(string)
	

}

/***
 * 最小公倍数を求める関数
 * https://tech-blog.s-yoshiki.com/entry/63
 ***/

function lcm(a) {
	var g = (n, m) => m ? g(m, n % m) : n
	var l = (n, m) => n * m / g(n, m)
	var ans = parseInt(a[0])

	for (var i = 1; i < a.length; i++) {
		ans = l(ans, parseInt(a[i]))
	}
	return ans
}

function gcd(a) {
    var f = (a, b) => b ? f(b, a % b) : a
    var ans = a[0]
    for (var i = 1; i < a.length; i++) {
        ans = f(ans, a[i]); 
    }
    return ans 
}

function xnumx(a){
	i=a
	while(Number.isInteger(a)==false){
		a=a+i
	}
	return a
}

function BranchObj(chart, startBar, endBar, barinfo) {
	this.chart = chart;
	this.startBar = startBar;
	this.endBar = endBar;
	this.barinfo = barinfo;
}

function parseDonscore(ds) {
	var bar = 0;
	var Meta1 = [];
	var Meta2 = [];
	var chartline = [];
	var TJA = [];
	var balloon = [];
	var isbranched = [false, false, false]
	var strings = ds.split("\n")
	const difficulties = {
		"かんたん": "0",
		"ふつう": "1",
		"むずかしい": "2",
		"おに": "3"
	};
	const characters = {
		" ": "0",
		"=": "0",
		"o": "1",
		"c": "1",
		"x": "2",
		"O": "3",
		"C": "3",
		"X": "4",
		"<": "5",
		"(": "6",
		"[": "7",
		">": "08",
		")": "08",
		"]": "08"
	}
	const branches = {
		"o": true,
		"x": false
	}
	var beatchar = 4;
	var meter = 4;
	var measure = 4;
	var tab = 4;
	var tempArr1;
	var tempArr2;
	var tempArr3 = [];
	var branchfrag = 1;
	var branchfrag4 = 0;
	var branchArr = [];
	var tempArrNormal = [];
	var tempArrExpert = [];
	var tempArrMaster = [];
	var tempbarinfoNormal = [];
	var tempbarinfoExpert = [];
	var tempbarinfoMaster = [];
	var barinfo = [];
	strings[strings.length-1]=""
	for (i = 0; i <= strings.length - 1; i++) {
		line = strings[i]
		if (line == '') {
			continue;
		}
		if (line[0] == ";") {
			continue;
		}
		if (line[0] == "#") {
			if (line.startsWith("#title")) {
				Meta1.push(`TITLE: ${line.split("#title")[1].trim()}`);
			} else if (line.startsWith("#level")) {
				Meta2.push(`LEVEL: ${line.split("#level")[1].trim()}`);
			} else if (line.startsWith("#difficulty")) {
				Meta2.push(`COURSE: ${difficulties[line.split("#difficulty")[1].trim()]}`);
			} else if (line.startsWith("#newline")) {} else if ((line.startsWith("#bpm"))) {
				TJA.push(`#BPMCHANGE ${line.split("#bpm")[1].trim().split(" ")[0]}:${bar},${line.split("#bpm")[1]?.split(" ")?.[2]},${line.split("#bpm")[1]?.split(" ")?.[3]}`);
			} else if (line.startsWith("#begingogo")) {
				TJA.push(`#GOGOSTART:${bar},${line.split("#begingogo")[1]?.split(" ")?.[2]},${line.split("#begingogo")[1]?.split(" ")?.[3]}`)
			} else if (line.startsWith("#endgogo")) {
				TJA.push(`#GOGOEND:${bar},${line.split("#endgogo")[1]?.split(" ")?.[2]},${line.split("endgogo")[1]?.split(" ")?.[3]}`)
			} else if (line.startsWith("#barlineon")) {
				TJA.push(`#BARLINEON:${bar}`)
			} else if (line.startsWith("#barlineoff")) {
				TJA.push(`#BARLINEOFF:${bar}`)
			} else if (line.startsWith("#beatchar")) {
				beatchar = parseInt(line.split("#beatchar")[1])
			} else if (line.startsWith("#tab")) {
				tab = parseInt(line.split("#tab")[1])
			} else if (line.startsWith("#meter")) {
				TJA.push(`#MEASURE ${line.split("#meter")[1].trim().split(" ")[1]}/${line.split("#meter")[1].trim().split(" ")[0]}:${bar}`)
				measure = parseInt(line.split("#meter")[1].trim().split(" ")[1])
				meter = parseInt(line.split("#meter")[1].trim().split(" ")[0])
			} else if (line.startsWith("#hs")) {
				TJA.push(`#SCROLL ${line.split("#hs")[1].trim().split(" ")[0]}:${bar},${line.split("#hs")[1]?.split(" ")?.[2]},${line.split("#hs")[1]?.split(" ")?.[3]},${line.split("#hs")[1]?.split(" ")?.[4]}`)
			} else if (line.startsWith("#branch")) {
				if (TJA.find(a => a.startsWith("#BRANCHSTART")) != undefined) {
					branchArr[branchArr.length - 1].chart = [tempArrNormal, tempArrExpert, tempArrMaster]
					branchArr[branchArr.length - 1].barinfo = [tempbarinfoNormal, tempbarinfoExpert, tempbarinfoMaster];
					branchArr[branchArr.length - 1].endBar = bar;
					tempArrNormal = []
					tempArrExpert = []
					tempArrMaster = []
					tempbarinfoNormal = []
					tempbarinfoExpert = []
					tempbarinfoMaster = []
					TJA.push(`#BRANCHEND:${bar}`)
				}
				branchArr.push(new BranchObj())
				branchfrag = 1;
				TJA.push(`#BRANCHSTART:${bar}`)
				branchArr[branchArr.length - 1].startBar = bar
				isbranched = [];
				line.split("#branch")[1].trim().split("").forEach((a) => isbranched.push(branches[a]))
			}
		} else {
			tempArr1 = [];
			for (a = 0; a < line.length / (beatchar * measure); a++) {
				tempArr1.push(line.substr(a * (beatchar * measure), (beatchar * meter * measure)));
			}
			if (tempArr1.length > 1) {
				branchfrag4 = tempArr1.length
			}
			tempArr1.forEach((item) => {
				if (/3(?![0-9]|=|])|3(?<![0-9]|@)/.test(item)) {
					flag = 0
					titem = ""
					if (item.includes("k") || item.includes("p") || item.includes("b") || item.includes("d") || item.includes("@")) {
						balloon.push(item.match(/(\d+)/g).flatMap(a => parseInt(a)))
						balloon = balloon.flat()
					}
					item.split("").forEach((char) => {
						if (char == 3) {
							flag = 1;
						} else if (flag == 0) {
							titem = titem + characters[char] + "00"
						} else {
							titem = titem + characters[char] + "000"
							flag++
							if (flag == 4) {
								flag = 0
							}
						}
					})
					item = (titem.replaceAll("\t", " ".repeat(tab)) + "0".repeat(beatchar * measure * 3)).slice(0, beatchar * measure * 3).split("");
					if (isbranched.includes(true)) {
						if (branchfrag == isbranched.flatMap((a, i) => a ? i : []).length + 1) {
							branchfrag = 1
						}
						if (branchfrag4 > 0) {
							branchfrag4 = branchfrag4 - 1
						}
						if (branchfrag == 1) {
							bar++
						}
						if (isbranched.flatMap((a, i) => a ? i : [])[branchfrag - 1] == 0) {
							tempArrNormal.push(item.join(""))
							tempbarinfoNormal.push([meter, measure, beatchar * 3])
						} else if (isbranched.flatMap((a, i) => a ? i : [])[branchfrag - 1] == 1) {
							tempArrExpert.push(item.join(""))
							tempbarinfoExpert.push([meter, measure, beatchar * 3])
						} else if (isbranched.flatMap((a, i) => a ? i : [])[branchfrag - 1] == 2) {
							tempArrMaster.push(item.join(""))
							tempbarinfoMaster.push([meter, measure, beatchar * 3])
						}

						if (branchfrag4 == 0) {
							branchfrag++
							branchfrag4 = 0
						}
					} else {
						bar++
						barinfo.push([meter, measure, beatchar * 3])
						tempArr3.push(item.join(""))
					}

				} else {
					if (item.includes("k") || item.includes("p") || item.includes("b") || item.includes("d") || item.includes("@")) {
						balloon.push(item.match(/(\d+)/g).flatMap(a => parseInt(a)))
						balloon = balloon.flat()
					}
					item = (item.replaceAll("\t", " ".repeat(tab)) + "0".repeat(beatchar * measure)).slice(0, beatchar * measure).split("");
					tempArr2 = []
					item.forEach((char) => {
						characters[char] ? tempArr2.push(characters[char]) : tempArr2.push("0")
					});
					if (isbranched.includes(true)) {
						if (branchfrag == isbranched.flatMap((a, i) => a ? i : []).length + 1) {
							branchfrag = 1
						}
						if (branchfrag4 > 0) {
							branchfrag4 = branchfrag4 - 1
						}
						if (branchfrag == 1) {
							bar++
						}
						//o     x     o  o  x  o  o     o     x    
						//branchfrag 2 1 2 1 
						//[0,2]
						if (isbranched.flatMap((a, i) => a ? i : [])[branchfrag - 1] == 0) {
							tempArrNormal.push((tempArr2.join("") + "0".repeat(beatchar * measure)).slice(0, beatchar * measure))
							tempbarinfoNormal.push([meter, measure, beatchar])
						} else if (isbranched.flatMap((a, i) => a ? i : [])[branchfrag - 1] == 1) {
							tempArrExpert.push((tempArr2.join("") + "0".repeat(beatchar * measure)).slice(0, beatchar * measure))
							tempbarinfoExpert.push([meter, measure, beatchar])
						} else if (isbranched.flatMap((a, i) => a ? i : [])[branchfrag - 1] == 2) {
							tempArrMaster.push((tempArr2.join("") + "0".repeat(beatchar * measure)).slice(0, beatchar * measure))
							tempbarinfoMaster.push([meter, measure, beatchar])
						}

						if (branchfrag4 == 0) {
							branchfrag++
							branchfrag4 = 0
						}
					} else {
						bar++
						barinfo.push([meter, measure, beatchar])
						tempArr3.push((tempArr2.join("") + "0".repeat(beatchar * measure)).slice(0, beatchar * measure))
					}

				}
			});
		}
	}
	if (isbranched.includes(true)) {
		branchArr[branchArr.length - 1].chart = [tempArrNormal, tempArrExpert, tempArrMaster];
		branchArr[branchArr.length - 1].barinfo = [tempbarinfoNormal, tempbarinfoExpert, tempbarinfoMaster];
		branchArr[branchArr.length - 1].endBar = bar;
		TJA.push(`#BRANCHEND:${bar}`)
	}
	TJA = TJA.filter(a => !a.includes("BRANCH"))
	var metaline = [];
	var re;
	var tempArr4;
	var tempNum1 = 0;
	var branchfrag2 = true;
	var branchfrag3 = true;
	var tempNum2 = 0;
	var tempNum3 = 0;
	const branches2 = {
		0: "#N",
		1: "#E",
		2: "#M"
	}
	var isbranched2 = false;
	//ここから書き込み処理
	metaline.push(Meta1.filter(a => a.startsWith("TITLE"))[0])
	metaline.push(" ")
	metaline.push(Meta2.filter(a => a.startsWith("COURSE"))[0])
	metaline.push(Meta2.filter(a => a.startsWith("LEVEL"))[0])
	metaline.push(`BALLOON:${balloon.join(",")}`)
	chartline.push("#START")
	for (i = 0; i <= bar-1; i++) {
		if (branchArr != []) {
			if (branchArr.filter(a => a.endBar == i).length != 0 && branchfrag2) {
				isbranched2 = false;
				tempNum1 = 0;
				tempNum2 = 0;
				tempNum3 = tempNum3 + 1;
				chartline.push("#BRANCHEND")
			}
			if (branchArr.filter(a => a.startBar == i).length != 0 && branchfrag2) {
				isbranched2 = true;
				chartline.push("#SECTION")
				chartline.push("#BRANCHSTART")
			}
		}
		if (isbranched2 == false) {
			if (TJA.filter(a => a.split(":")[1].trim().split(",")[0].trim() == i.toString()).length != 0) {
				chartline.push(parseLine(TJA.filter(a => a.split(":")[1].trim().split(",")[0].trim() == i.toString()), tempArr3[i], barinfo[i]))
				chartline = chartline.flat()
			} else {
				chartline.push(tempArr3[i] + ",")
			}
		} else {
			if (branchArr[tempNum3].chart.filter(a => a.length != 0).length == 1) {
				tempArr4 = []
				if (i == branchArr[tempNum3].startBar) {
					chartline.push(branches2[branchArr[tempNum3].chart.flatMap((a, b) => a.length != 0 ? b : [])[0]])

				}
				if (TJA.filter(a => a.split(":")[1].trim().split(",")[0].trim() == i.toString()).length != 0) {
					if (TJA.filter(a => a.split(":")[1].trim().split(",")[0].trim() == i.toString()).filter(a => a.startsWith("#SCROLL")).length != 0) {
						TJA.filter(a => a.split(":")[1].trim().split(",")[0].trim() == i.toString()).filter(a => a.startsWith("#SCROLL")).forEach((item) => {
							if (item.split(":")[1].split(",")[3] != "undefined") {
								if ((item.split(":")[1].split(",")[1])[branchArr[tempNum3].chart.flatMap((a, b) => a.length != 0 ? b : [])[0]] == "o") {
									tempArr4.push(`${item.split(":")[0].trim()}:${item.split(":")[1].trim().split(",")[1]},${item.split(":")[1].trim().split(",")[1]},undefined`)
								} else {

								}
							} else {
								tempArr4.push(item)
							}
						})
					}
					if (TJA.filter(a => a.split(":")[1].trim().split(",")[0].trim() == i.toString()).filter(a => !a.startsWith("#SCROLL")).length != 0) {
						tempArr4.push(TJA.filter(a => a.split(":")[1].trim().split(",")[0].trim() == i.toString()).filter(a => !a.startsWith("#SCROLL")))
					}

					chartline.push(parseLine(tempArr4.flat(), branchArr[tempNum3].chart[branchArr[tempNum3].chart.flatMap((a, b) => a.length != 0 ? b : [])[0]][i - branchArr[tempNum3].startBar], branchArr[tempNum3]["barinfo"][branchArr, branchArr[tempNum3].chart.flatMap((a, b) => a.length != 0 ? b : [])[0]][i - branchArr[tempNum3].startBar]))
				} else {
					chartline.push(branchArr[tempNum3].chart[branchArr[tempNum3].chart.flatMap((a, b) => a.length != 0 ? b : [])[0]][i - branchArr[tempNum3].startBar] + ",")
				}


			} else if (branchArr[tempNum3].chart.filter(a => a.length != 0).length == 2) {
				if (tempNum1 == 0) {
					if (i == branchArr[tempNum3].startBar && branchfrag3) {
						chartline.push(branches2[branchArr[tempNum3].chart.flatMap((a, b) => a.length != 0 ? b : [])[0]])
						branchfrag3 = false;
					}
					tempArr4 = []
					if (TJA.filter(a => a.split(":")[1].trim().split(",")[0].trim() == (i + tempNum2).toString()).length != 0) {
						if (TJA.filter(a => a.split(":")[1].trim().split(",")[0].trim() == (i + tempNum2).toString()).filter(a => a.startsWith("#SCROLL")).length != 0) {
							TJA.filter(a => a.split(":")[1].trim().split(",")[0].trim() == (i + tempNum2).toString()).filter(a => a.startsWith("#SCROLL")).forEach((item) => {
								if (item.split(":")[1].split(",")[3] != "undefined") {
									if ((item.split(":")[1].split(",")[1])[branchArr[tempNum3].chart.flatMap((a, b) => a.length != 0 ? b : [])[0]] == "o") {
										tempArr4.push(`${item.split(":")[0].trim()}:${item.split(":")[1].trim().split(",")[1]},${item.split(":")[1].trim().split(",")[1]},undefined`)
									} else {

									}
								} else if (item.split(":")[1].split(",")[2] == "undefined" && item.split(":")[1].split(",")[1] != "undefined") {
									if ((item.split(":")[1].split(",")[1])[branchArr[tempNum3].chart.flatMap((a, b) => a.length != 0 ? b : [])[0]] == "o") {
										tempArr4.push(`${item.split(":")[0].trim()}:${item.split(":")[1].trim().split(",")[1]},${item.split(":")[1].trim().split(",")[1]},undefined`)
									} else {

									}
								} else {
									tempArr4.push(item)
								}
							})
						}
						if (TJA.filter(a => a.split(":")[1].trim().split(",")[0].trim() == (i + tempNum2).toString()).filter(a => !a.startsWith("#SCROLL")).length != 0) {
							tempArr4.push(TJA.filter(a => a.split(":")[1].trim().split(",")[0].trim() == (i + tempNum2).toString()).filter(a => !a.startsWith("#SCROLL")))
						}
						chartline.push(parseLine(tempArr4.flat(), branchArr[tempNum3].chart[branchArr[tempNum3].chart.flatMap((a, b) => a.length != 0 ? b : [])[0]][i + tempNum2 - branchArr[tempNum3].startBar], branchArr[tempNum3]["barinfo"][branchArr, branchArr[tempNum3].chart.flatMap((a, b) => a.length != 0 ? b : [])[0]][i + tempNum2 - branchArr[tempNum3].startBar]))
					} else {
						chartline.push(branchArr[tempNum3].chart[branchArr[tempNum3].chart.flatMap((a, b) => a.length != 0 ? b : [])[0]][i + tempNum2 - branchArr[tempNum3].startBar] + ",")
					}
					tempNum2++;
					if (tempNum2 == branchArr[tempNum3].endBar - branchArr[tempNum3].startBar) {
						tempNum1++;
						tempNum2 = 0;
						branchfrag3 = true;
					}
					branchfrag2 = false;
					i = i - 1;
				} else {
					if (i == branchArr[tempNum3].startBar && branchfrag3) {
						chartline.push(branches2[branchArr[tempNum3].chart.flatMap((a, b) => a.length != 0 ? b : [])[1]])
						branchfrag3 = false;
					}
					tempArr4 = []
					if (TJA.filter(a => a.split(":")[1].trim().split(",")[0].trim() == (i + tempNum2).toString()).length != 0) {
						if (TJA.filter(a => a.split(":")[1].trim().split(",")[0].trim() == (i + tempNum2).toString()).filter(a => a.startsWith("#SCROLL")).length != 0) {
							TJA.filter(a => a.split(":")[1].trim().split(",")[0].trim() == (i + tempNum2).toString()).filter(a => a.startsWith("#SCROLL")).forEach((item) => {
								if (item.split(":")[1].split(",")[3] != "undefined") {
									if ((item.split(":")[1].split(",")[1])[branchArr[tempNum3].chart.flatMap((a, b) => a.length != 0 ? b : [])[1]] == "o") {
										tempArr4.push(`${item.split(":")[0].trim()}:${item.split(":")[1].trim().split(",")[1]},${item.split(":")[1].trim().split(",")[1]},undefined`)
									} else {

									}
								} else if (item.split(":")[1].split(",")[2] == "undefined" && item.split(":")[1].split(",")[1] != "undefined") {
									if ((item.split(":")[1].split(",")[1])[branchArr[tempNum3].chart.flatMap((a, b) => a.length != 0 ? b : [])[1]] == "o") {
										tempArr4.push(`${item.split(":")[0].trim()}:${item.split(":")[1].trim().split(",")[1]},${item.split(":")[1].trim().split(",")[1]},undefined`)
									} else {

									}
								} else {
									tempArr4.push(item)
								}
							})
						}
						if (TJA.filter(a => a.split(":")[1].trim().split(",")[0].trim() == (i + tempNum2).toString()).filter(a => !a.startsWith("#SCROLL")).length != 0) {
							tempArr4.push(TJA.filter(a => a.split(":")[1].trim().split(",")[0].trim() == (i + tempNum2).toString()).filter(a => !a.startsWith("#SCROLL")))
						}
						chartline.push(parseLine(tempArr4.flat(), branchArr[tempNum3].chart[branchArr[tempNum3].chart.flatMap((a, b) => a.length != 0 ? b : [])[1]][i + tempNum2 - branchArr[tempNum3].startBar], branchArr[tempNum3]["barinfo"][branchArr, branchArr[tempNum3].chart.flatMap((a, b) => a.length != 0 ? b : [])[1]][i + tempNum2 - branchArr[tempNum3].startBar]))
					} else {
						chartline.push(branchArr[tempNum3].chart[branchArr[tempNum3].chart.flatMap((a, b) => a.length != 0 ? b : [])[1]][i + tempNum2 - branchArr[tempNum3].startBar] + ",")
					}
					if (i + 1 == branchArr[tempNum3].endBar) {
						branchfrag2 = true;
						branchfrag3 = true;
					}
				}

			} else if (branchArr[tempNum3].chart.filter(a => a.length != 0).length == 3) {
				if (tempNum1 == 0) {
					if (i == branchArr[tempNum3].startBar && branchfrag3) {
						chartline.push(branches2[branchArr[tempNum3].chart.flatMap((a, b) => a.length != 0 ? b : [])[0]])
						branchfrag3 = false;
					}
					tempArr4 = []
					if (TJA.filter(a => a.split(":")[1].trim().split(",")[0].trim() == (i + tempNum2).toString()).length != 0) {
						if (TJA.filter(a => a.split(":")[1].trim().split(",")[0].trim() == (i + tempNum2).toString()).filter(a => a.startsWith("#SCROLL")).length != 0) {
							TJA.filter(a => a.split(":")[1].trim().split(",")[0].trim() == (i + tempNum2).toString()).filter(a => a.startsWith("#SCROLL")).forEach((item) => {
								if (item.split(":")[1].split(",")[3] != "undefined") {
									if ((item.split(":")[1].split(",")[1])[branchArr[tempNum3].chart.flatMap((a, b) => a.length != 0 ? b : [])[0]] == "o") {
										tempArr4.push(`${item.split(":")[0].trim()}:${item.split(":")[1].trim().split(",")[1]},${item.split(":")[1].trim().split(",")[1]},undefined`)
									} else {

									}
								} else if (item.split(":")[1].split(",")[2] == "undefined" && item.split(":")[1].split(",")[1] != "undefined") {
									if ((item.split(":")[1].split(",")[1])[branchArr[tempNum3].chart.flatMap((a, b) => a.length != 0 ? b : [])[0]] == "o") {
										tempArr4.push(`${item.split(":")[0].trim()}:${item.split(":")[1].trim().split(",")[1]},${item.split(":")[1].trim().split(",")[1]},undefined`)
									} else {

									}
								} else {
									tempArr4.push(item)
								}
							})
						}
						if (TJA.filter(a => a.split(":")[1].trim().split(",")[0].trim() == (i + tempNum2).toString()).filter(a => !a.startsWith("#SCROLL")).length != 0) {
							tempArr4.push(TJA.filter(a => a.split(":")[1].trim().split(",")[0].trim() == (i + tempNum2).toString()).filter(a => !a.startsWith("#SCROLL")))
						}
						chartline.push(parseLine(tempArr4.flat(), branchArr[tempNum3].chart[branchArr[tempNum3].chart.flatMap((a, b) => a.length != 0 ? b : [])[0]][i + tempNum2 - branchArr[tempNum3].startBar], branchArr[tempNum3]["barinfo"][branchArr, branchArr[tempNum3].chart.flatMap((a, b) => a.length != 0 ? b : [])[0]][i + tempNum2 - branchArr[tempNum3].startBar]))
					} else {
						chartline.push(branchArr[tempNum3].chart[branchArr[tempNum3].chart.flatMap((a, b) => a.length != 0 ? b : [])[0]][i + tempNum2 - branchArr[tempNum3].startBar] + ",")
					}
					tempNum2++;
					if (tempNum2 == branchArr[tempNum3].endBar - branchArr[tempNum3].startBar) {
						tempNum1++;
						tempNum2 = 0;
						branchfrag3 = true;
					}
					branchfrag2 = false;
					i = i - 1;
				} else if (tempNum1 == 1) {
					if (i == branchArr[tempNum3].startBar && branchfrag3) {
						chartline.push(branches2[branchArr[tempNum3].chart.flatMap((a, b) => a.length != 0 ? b : [])[1]])
						branchfrag3 = false;
					}
					tempArr4 = []
					if (TJA.filter(a => a.split(":")[1].trim().split(",")[0].trim() == (i + tempNum2).toString()).length != 0) {
						if (TJA.filter(a => a.split(":")[1].trim().split(",")[0].trim() == (i + tempNum2).toString()).filter(a => a.startsWith("#SCROLL")).length != 0) {
							TJA.filter(a => a.split(":")[1].trim().split(",")[0].trim() == (i + tempNum2).toString()).filter(a => a.startsWith("#SCROLL")).forEach((item) => {
								if (item.split(":")[1].split(",")[3] != "undefined") {
									if ((item.split(":")[1].split(",")[1])[branchArr[tempNum3].chart.flatMap((a, b) => a.length != 0 ? b : [])[1]] == "o") {
										tempArr4.push(`${item.split(":")[0].trim()}:${item.split(":")[1].trim().split(",")[1]},${item.split(":")[1].trim().split(",")[1]},undefined`)
									} else {

									}
								} else if (item.split(":")[1].split(",")[2] == "undefined" && item.split(":")[1].split(",")[1] != "undefined") {
									if ((item.split(":")[1].split(",")[1])[branchArr[tempNum3].chart.flatMap((a, b) => a.length != 0 ? b : [])[1]] == "o") {
										tempArr4.push(`${item.split(":")[0].trim()}:${item.split(":")[1].trim().split(",")[1]},${item.split(":")[1].trim().split(",")[1]},undefined`)
									} else {

									}
								} else {
									tempArr4.push(item)
								}
							})
						}
						if (TJA.filter(a => a.split(":")[1].trim().split(",")[0].trim() == (i + tempNum2).toString()).filter(a => !a.startsWith("#SCROLL")).length != 0) {
							tempArr4.push(TJA.filter(a => a.split(":")[1].trim().split(",")[0].trim() == (i + tempNum2).toString()).filter(a => !a.startsWith("#SCROLL")))
						}
						chartline.push(parseLine(tempArr4.flat(), branchArr[tempNum3].chart[branchArr[tempNum3].chart.flatMap((a, b) => a.length != 0 ? b : [])[1]][i + tempNum2 - branchArr[tempNum3].startBar], branchArr[tempNum3]["barinfo"][branchArr, branchArr[tempNum3].chart.flatMap((a, b) => a.length != 0 ? b : [])[1]][i + tempNum2 - branchArr[tempNum3].startBar]))
					} else {
						chartline.push(branchArr[tempNum3].chart[branchArr[tempNum3].chart.flatMap((a, b) => a.length != 0 ? b : [])[1]][i + tempNum2 - branchArr[tempNum3].startBar] + ",")
					}
					tempNum2++;
					if (tempNum2 == branchArr[tempNum3].endBar - branchArr[tempNum3].startBar) {
						tempNum1++;
						tempNum2 = 0;
						branchfrag3 = true;
					}
					branchfrag2 = false;
					i = i - 1;
				} else if (tempNum1 == 2) {
					if (i == branchArr[tempNum3].startBar && branchfrag3) {
						chartline.push(branches2[branchArr[tempNum3].chart.flatMap((a, b) => a.length != 0 ? b : [])[2]])
						branchfrag3 = false;
					}
					tempArr4 = []
					if (TJA.filter(a => a.split(":")[1].trim().split(",")[0].trim() == (i + tempNum2).toString()).length != 0) {
						if (TJA.filter(a => a.split(":")[1].trim().split(",")[0].trim() == (i + tempNum2).toString()).filter(a => a.startsWith("#SCROLL")).length != 0) {
							TJA.filter(a => a.split(":")[1].trim().split(",")[0].trim() == (i + tempNum2).toString()).filter(a => a.startsWith("#SCROLL")).forEach((item) => {
								if (item.split(":")[1].split(",")[3] != "undefined") {
									if ((item.split(":")[1].split(",")[1])[branchArr[tempNum3].chart.flatMap((a, b) => a.length != 0 ? b : [])[2]] == "o") {
										tempArr4.push(`${item.split(":")[0].trim()}:${item.split(":")[1].trim().split(",")[1]},${item.split(":")[1].trim().split(",")[1]},undefined`)
									} else {

									}
								} else if (item.split(":")[1].split(",")[2] == "undefined" && item.split(":")[1].split(",")[1] != "undefined") {
									if ((item.split(":")[1].split(",")[1])[branchArr[tempNum3].chart.flatMap((a, b) => a.length != 0 ? b : [])[2]] == "o") {
										tempArr4.push(`${item.split(":")[0].trim()}:${item.split(":")[1].trim().split(",")[1]},${item.split(":")[1].trim().split(",")[1]},undefined`)
									} else {

									}
								} else {
									tempArr4.push(item)
								}
							})
						}
						if (TJA.filter(a => a.split(":")[1].trim().split(",")[0].trim() == (i + tempNum2).toString()).filter(a => !a.startsWith("#SCROLL")).length != 0) {
							tempArr4.push(TJA.filter(a => a.split(":")[1].trim().split(",")[0].trim() == (i + tempNum2).toString()).filter(a => !a.startsWith("#SCROLL")))
						}
						chartline.push(parseLine(tempArr4.flat(), branchArr[tempNum3].chart[branchArr[tempNum3].chart.flatMap((a, b) => a.length != 0 ? b : [])[2]][i + tempNum2 - branchArr[tempNum3].startBar], branchArr[tempNum3]["barinfo"][branchArr, branchArr[tempNum3].chart.flatMap((a, b) => a.length != 0 ? b : [])[2]][i + tempNum2 - branchArr[tempNum3].startBar]))
					} else {
						chartline.push(branchArr[tempNum3].chart[branchArr[tempNum3].chart.flatMap((a, b) => a.length != 0 ? b : [])[2]][i + tempNum2 - branchArr[tempNum3].startBar] + ",")
					}
					if (i + 1 == branchArr[tempNum3].endBar) {
						branchfrag2 = true;
						branchfrag3 = true;
					}
				}
			}
		}
	}
	chartline.push("#END")
	return `${metaline.join("\n")}\n\n${chartline.flat().join("\n")}`
}

/**
 * arr1 TJA.filter(a=>a.split(":")[1].trim().split(",")[0].trim()==i.toString())
 * barin meter, measure, beatchar
 */
function parseLine(arr1, line, barin) {
	tempArr6 = []
	tempArr4 = []
	returnarr = []
	lcmv=1;
	arr1.forEach((item) => {
		if (item.startsWith("#SCROLL") || item.startsWith("#BPMCHANGE") || item.startsWith("#GOGOSTART") || item.startsWith("#GOGOEND")) {
			if (item.split(":")[1].trim().split(",")[1] != "undefined" && item.split(":")[1].trim().split(",")[2] != "undefined") {
				tempArr4.push([item.split(":")[0].trim(), item.split(":")[1].trim().split(",")[1], item.split(":")[1].trim().split(",")[2]])
			} else {
				tempArr6.push(item.split(":")[0])
			}
		} else {
			tempArr6.push(item.split(":")[0])
		}
	})

	if (tempArr6.length != 0) {
		for (a = 0; a <= tempArr6.length - 1; a++) {
			returnarr.push(tempArr6[a])
		}
		if (tempArr4.length == 0) {
			returnarr.push(line + ",")
		}
	}
	if (tempArr4.length != 0) {
		tempNum1 = 0
		tempArr4 = tempArr4.sort((a, b) => (parseInt(a[2]) / parseInt(a[1])) - (parseInt(b[2]) / parseInt(b[1])))
			//if(a.length)
		//7*lcm([8,16])/16
		//
		lcmv=lcm(tempArr4.map(a=>a[1]))
		console.log(line)
		if(4*lcm(tempArr4.map(a=>a[1]))/parseInt(barin[0])>1){
			var temp1=[]
			line.split("").forEach((item)=>{
				temp1.push(item+"0".repeat(lcm(tempArr4.map(a=>a[1]))-1))
			})
			line=temp1.join("")
		}
		//parseInt(parseInt(barin[1])*lcm([4*lcm(tempArr4.map(a=>a[1])),parseInt(barin[0])])/parseInt(barin[0])
		re = new RegExp(`.{${lcm([4*lcm(tempArr4.map(a=>a[1])),parseInt(barin[0])])/parseInt(barin[0])}}`, "g")
		tempArr5 = line.match(re)
		bB = 0
		arr = []
		c = 0
		for (d = 0; d <= tempArr4.length - 1; d++) {
			if (d == 0) {
				bB = tempArr4[0][2] / tempArr4[0][1]
				arr.push([])
				arr[c].push(tempArr4[d])
			} else {
				if (tempArr4[d][2] / tempArr4[d][1] == bB) {
					arr[c].push(tempArr4[d])
				} else {
					c++
					bB = tempArr4[d][2] / tempArr4[d][1]
					arr.push([])
					arr[c].push(tempArr4[d])
				}
			}
		}
		tempArr4 = arr;
		tempArr4.forEach((arr, index) => {
			//if(tempArr5.join("").length)
			console.log(barin)
			console.log(arr[0])
			if(4*lcmv/parseInt(barin[0])>1){
				//一拍子をget 4の6等分の場合
				//#MEASURE 5/16のときは
				//4*6=24
				//3*8=24?
				//24部は
				//30で16分の5なら16分の1は、30/5=>6
				//16分の1を3とすると4分の1は、48
				//6分の1は8になる
				//3*5=15,15/8
				//30/6=5,
				//90/5*16/2/4
				//line.length/barin[1]*barin[0]/parseInt(arr[0][1])/4*parseInt(arr[0][2])
				console.log(barin,arr,lcmv,tempArr5)
				console.log(tempArr5.slice(tempNum1, (line.length/barin[1]*barin[0]/parseInt(arr[0][1])/4)*parseInt(arr[0][2])/tempArr5[0].length).join(""))
				returnarr.push(tempArr5.slice(tempNum1, tempNum1=(line.length/barin[1]*barin[0]/parseInt(arr[0][1])/4)*parseInt(arr[0][2])/tempArr5[0].length).join(""))
				console.log((line.length/barin[1]*barin[0]/parseInt(arr[0][1])/4)*parseInt(arr[0][2])/tempArr5[0].length,tempArr5.length)
			}else{
				returnarr.push(tempArr5.slice(tempNum1, tempNum1=(line.length/barin[1]*barin[0]/parseInt(arr[0][1])/4)*parseInt(arr[0][2])/tempArr5[0].length).join(""))
				console.log(parseInt(arr[0][2])*(lcmv/parseInt(arr[0][1]))*barin[0]/(4*parseInt(arr[0][1])))
			}
			arr.forEach((line) => {
				returnarr.push(line[0])
			})
			if (tempArr4.length == index + 1) {
				returnarr.push(tempArr5.slice(tempNum1, tempArr5.length).join("") + ",")
			}
		})
	}
	return returnarr
}

//ここからようやく普通の処理
document.querySelector("#dropzone-file").addEventListener("change",function(e){
	var file = e.target.files[0];
	var reader = new FileReader();
	var image = document.querySelector("img");
	reader.addEventListener("load", function () {
		document.querySelector("#dropzone").classList.add("hidden")
		document.querySelector("#imagezone").classList.remove("hidden")
		image.src = reader.result;
		load((image.src))
		setTimeout(() => {
			document.querySelector("textarea").textContent=FinalData
		}, 100);
	}, false);
	if (file) {
        reader.readAsDataURL(file);
    }
})
var hover = false
document.querySelector("textarea").addEventListener("mouseover",function(){
	document.querySelector("textarea").select()
	hover=true
})

document.querySelector("textarea").addEventListener("mouseleave",function(){
	if (window.getSelection) {window.getSelection().removeAllRanges();}
 	else if (document.selection) {document.selection.empty();}
	hover=false
})

document.querySelector("textarea").addEventListener("click",function(){
	if(hover==true){
		navigator.clipboard.writeText(document.querySelector("textarea").textContent)
	}
})


document.querySelector("#dropzone").addEventListener('dragover', function(e) {
	e.stopPropagation();
	e.preventDefault();
	this.style.background = '#e1e7f0';
}, false);

document.querySelector("#dropzone").addEventListener('dragleave', function(e) {
	e.stopPropagation();
	e.preventDefault();
	this.style.background = '#f3f4f6';
}, false);

document.querySelector("#dropzone").addEventListener('drop', function(e) {
	e.stopPropagation();
	e.preventDefault();
	var files = e.dataTransfer.files;
	this.style.background = '#f3f4f6';
	if (files.length > 1) return alert('アップロードできるファイルは1つだけです。');
	var file =  e.dataTransfer.files[0];
	var reader = new FileReader();
	var image = document.querySelector("img");
	reader.addEventListener("load", function () {
		document.querySelector("#dropzone").classList.add("hidden")
		document.querySelector("#imagezone").classList.remove("hidden")
		image.src = reader.result;
		load((image.src))
		setTimeout(() => {
			document.querySelector("textarea").textContent=FinalData
		}, 100);
	}, false);
	if (file) {
        reader.readAsDataURL(file);
    }
}, false);