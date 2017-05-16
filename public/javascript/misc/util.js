/**
 * Created by hanwang on 1/23/17.
 */
var title = ["Group","ID","First name","FFreq","Last name","LFreq","Reg No.","DoB(MM/DD/YY)"];
var cwidth = [60,80,160,60,180,60,140,100]; //820
var height = 24; //height per row 0 30 57
var ys = [0,30,77];
var mapping = [0,1,8,3,9,5,10,11,2,4,6,7]; //index mapping from hidden data to visible data per row
var data = {}; // experimentr data

/**
 * draw a cell
 * x,y : position
 * cx,cy : size
 * t : text (string)
 * c : color
 * g : div in HTML
 * j : id
 * k : cell type
 * cell type = {
 *      0:group id hidden
 *      1:title
 *      2:group id visible
 *      3:default data cell
 *      4:merged cell unclickable
 *      5:merged cell hidden
 *      6:clickable data cell
 *      9:hidden data
 *      }
 */
function cell(t,g,j,k){
    // erase title columns
    var index_r = g.attr("id").slice(1)%5;
    var x = 5*(j%cwidth.length)+cwidth.slice(0,j%cwidth.length).reduce((a, b) => a + b, 0),
        y = ys[Math.floor(j/cwidth.length)],
        cx = cwidth[j%cwidth.length],
        cy = height;
    var cel = g.append("g").attr("id","c"+j.toString()).attr("class","cell")
        .attr("transform","translate("+x+","+y+")");
    var rectangle = cel.append("rect").attr("id",j);
    //only show rect on clickable cells
    if(k==6 && j<20){
        rectangle.attr("x",-5).attr("y",-5).attr("width",cx).attr("id","r"+j.toString())
            .attr("height",80).style("fill","#C5E3BF").attr("rx",5).attr("ry",5);
    }
    /*rectangle.attr("x",0).attr("y",0).attr("width",cx).attr("id","r"+j.toString())
        .attr("height",function(){if(k==2||k==4){return cy*2+23;}if(k==0||k==5||(index_r>0 && k==1)){return 0;}return cy;})
        .style("fill","none")
        .style("fill",function(){if(k==1||k==2){return "#68a7ca";}if(k==3||k==4){return "#b2d3e6";}if(k==6){return "#C5E3BF"}})
        .style("opacity",1);*/
    var textbox = cel.append("text").attr("class","tbox").attr("id","t"+j.toString());
    textbox.attr("x",function(){
        //if(k==3 && (title[j%10]=="FFreq"||title[j%10]=="LFreq"||
            //title[j%10]=="ID")){return cx/2;}
        if(k==2){return cx/2;}
    return 0;})
    //if(t.length>0){return cx*(0.02+0.48/t.length)-4;}})
        .attr("y",function(){if(k==2){return cy/2+28;}if(k==1||k==3||k==4||k==5||k==6){return cy/2+5;}})
        .attr("text-anchor",function(){
            //if(k==3 && (title[j%10]=="FFreq"||title[j%10]=="LFreq"||j%10==0||
                //title[j%10]=="ID")){return "middle";}
            if(k==2){return "middle";}
            return "left";})
        .style("font",function(){
        if(experimentr.data()['os']=="MacOS"){return "16px Monaco";}
        if(experimentr.data()['os']=="Linux"){return "16px Lucida Sans Typewriter";}
        return "16px Lucida Console";})//.style("font-weight","bold")
        .text(function(){
            if(k==0||(index_r>0 && k==1)){return " ";}
            if(k==3 && (title[j%cwidth.length]=="FFreq"||title[j%cwidth.length]=="LFreq")){
                if(d3.select(this.parentNode.previousSibling).select("text").text()==""){return "NA";}
                if(+t>2){return "3+";}
            }
            return t;
        });
    // icons
    if(j>cwidth.length){
        if(textbox.text()==""){
            if(title[j%cwidth.length]!="FFreq" && title[j%cwidth.length]!="LFreq"){
                // missing
                cel.append("svg:image").attr("xlink:href","/resources/missing.png").attr("class","icon")
                    .attr("x",0).attr("y",cy/2-9).attr("width",18).attr("height",18);
            }
        }else{
            if(j<cwidth.length*2 && title[j%cwidth.length]!="ID" && title[j%cwidth.length]!="FFreq" && title[j%cwidth.length]!="LFreq"){
                var m = j+cwidth.length,
                    p = g.attr("id").slice(1),
                    dat = experimentr.data()['mat'][Math.floor(p/5)],
                    t_j = j<2*cwidth.length ? dat[p%5][0][mapping[j%cwidth.length]] : dat[p%5][1][mapping[j%cwidth.length]],
                    t_m = m<2*cwidth.length ? dat[p%5][0][mapping[m%cwidth.length]] : dat[p%5][1][mapping[m%cwidth.length]],
                    bin = [];
                //console.log(t_j, t_m);
                if(t_j!="" && t_m!=""){
                    for(var i=0;i<t_j.length;i++){
                        //indel
                        if((t_j[i]==" "&&t_m[i]!=" ")||(t_j[i]!=" "&&t_m[i]==" ")){
                            bin.push(i);
                            g.select("#c"+j.toString()).append("svg:image").attr("xlink:href","/resources/indel.png")
                                .attr("class","icon").attr("x",9*i)
                                .attr("y",cy/2+15).attr("width",16).attr("height",16);
                        }
                        //transpose
                        else if(bin.indexOf(i)==-1 && t_j[i]==t_m[i+1] && t_j[i+1]==t_m[i] && t_j[i]!="*" && t_m[i]!="*" && t_j[i+1]!="*" && t_m[i+1]!="*"){
                            bin.push(i,i+1);
                            g.select("#c"+j.toString()).append("svg:image").attr("xlink:href","/resources/transpose.png")
                                .attr("class","icon").attr("x",9*i+4)
                                .attr("y",cy/2+13).attr("width",18).attr("height",18);
                        }
                        //transpose two
                        else if(bin.indexOf(i)==-1 && t_j[i]==t_m[i+3] && t_j[i+1]==t_m[i+4] && t_j[i+3]==t_m[i] && t_j[i+4]==t_m[i+1]
                            && t_j[i]!="*" && t_j[i+1]!="*" && t_j[i+2]!="*" && t_j[i+3]!="*"){
                            bin.push(i,i+1,i+2,i+3,i+4);
                            g.select("#c"+j.toString()).append("svg:image").attr("xlink:href","/resources/transpose.png")
                                .attr("class","icon").attr("x",9*i+12)
                                .attr("y",cy/2+13).attr("width",18).attr("height",18);
                        }
                        //replace
                        else if (bin.indexOf(i)==-1 && t_j[i] != t_m[i] && t_j[i] != " " && t_m[i] != " ") {
                            bin.push(i);
                            g.select("#c"+j.toString()).append("svg:image").attr("xlink:href","/resources/replace.png")
                                .attr("class", "icon").attr("x", function(){
                                    /*if (d3.select(this.parentNode).text().length==1){
                                        return cx/2-9;
                                    }*/
                                return 9*i;
                            })
                                .attr("y", cy/2+13).attr("width", 18).attr("height", 18);
                        }
                    }
                    /*if(bin.length>0){
                        console.log(bin,j);
                    }*/
                }
            }
        }
    }

    // click event
    if(k==6){
        
        rectangle.on("mouseover",function(){d3.select(this).style("cursor", "pointer");});
        textbox.on("mouseover",function(){d3.select(this).style("cursor", "pointer");});
        rectangle.on("mouseout",function(){d3.select(this).style("cursor", "default");});
        textbox.on("mouseout",function(){d3.select(this).style("cursor", "default");});

        var m = j>=2*cwidth.length ? j-cwidth.length : j+cwidth.length;
        
        rectangle.on("click",function(){
            var p = this.parentNode.parentNode.id.slice(1); //pair id
            var dat = experimentr.data()['mat'][Math.floor(p/5)];
            if(experimentr.data()['mode']=="Partial_Cell"){
                var t_j = j<2*cwidth.length ? dat[p%5][0][j%cwidth.length] : dat[p%5][1][j%cwidth.length];
                var t_m = m<2*cwidth.length ? dat[p%5][0][m%cwidth.length] : dat[p%5][1][m%cwidth.length];
                d3.select(this.parentNode).remove();
                d3.select(this.parentNode.parentNode).select("#c"+j.toString()).remove();
                cell(t_j,g,j,3);
                cell(t_m,g,m,3);
            }
            if(experimentr.data()['mode']=="Partial_Row"){
                d3.select(this.parentNode.parentNode).selectAll(".cell").remove();
                pair(title.concat(dat[p%5][0]).concat(dat[p%5][1]),g,"Full_Partial");
            }
        });
        textbox.on("click",function(){
            var p = this.parentNode.parentNode.id.slice(1); //pair id
            var dat = experimentr.data()['mat'][Math.floor(p/5)];
            if(experimentr.data()['mode']=="Partial_Cell"){
                var t_j = j<2*cwidth.length ? dat[p%5][0][j%cwidth.length] : dat[p%5][1][j%cwidth.length];
                var t_m = m<2*cwidth.length ? dat[p%5][0][m%cwidth.length] : dat[p%5][1][m%cwidth.length];
                d3.select(this.parentNode).remove();
                d3.select(this.parentNode.parentNode).select("#c"+j.toString()).remove();
                cell(t_j,g,j,3);
                cell(t_m,g,m,3);
            }
            if(experimentr.data()['mode']=="Partial_Row"){
                d3.select(this.parentNode.parentNode).selectAll(".cell").remove();
                pair(title.concat(dat[p%5][0]).concat(dat[p%5][1]),g,"Full_Partial");
            }

        });
    }
    // coloring text
    if(experimentr.data()['mode']!="Full"
        &&(k==6||k==3)&&title[j%cwidth.length]!="ID" && title[j%cwidth.length]!="LFreq" && title[j%cwidth.length]!="FFreq"){
        textbox.attr("opacity",0);
        g.select("#c"+j.toString()).select(".span").remove();
        var p = g.attr("id").slice(1), //pair id
            dat = experimentr.data()['mat'][Math.floor(p/5)],
            m = j>=2*cwidth.length ? j-cwidth.length : j+cwidth.length,
            len = textbox.text().length,
            $cel = g.select("#c"+j.toString()),
            $tb = $cel.append("text").attr("class","span"),
            t_j = j<2*cwidth.length ? dat[p%5][0][mapping[j%10]] : dat[p%5][1][mapping[j%10]],
            t_m = m<2*cwidth.length ? dat[p%5][0][mapping[m%10]] : dat[p%5][1][mapping[m%10]],
            t_jj = j<2*cwidth.length ? dat[p%5][0][j%10] : dat[p%5][1][j%10],
            scheme = [];
        for(f=0;f<len;f++){
            if(t_j[f]==t_m[f]){scheme.push(0);}
            else{scheme.push(1);}
        }
        for(l=0;l<len;l++){
            var $tspan = $tb.append('tspan');
            $tspan.attr("x",0.6*l+"em").attr("y",cy/2+5)
                .attr("text-anchor","left")
                .style("font",function(){if(experimentr.data()['os']=="MacOS"){return "16px Monaco";}if(experimentr.data()['os']=="Linux"){return "16px Lucida Sans Typewriter";}return "16px Lucida Console";})
                .attr("fill",function(){
                    if(t_j.length!=t_jj.length){return "black";}
                    if(k==3 && scheme[l]==1 && textbox.text()[l]!="*" && textbox.text()[l]!="/"){return"black";}return "black";})
                .text(t[l]);
            /*
            $tspan.on("mouseover",function(){d3.select(this).style("cursor", "pointer");});
            $tspan.on("mouseout",function(){d3.select(this).style("cursor", "default");});
            */
            //click function not implemented yet.
        }
    }
}
/**
 * draw a row
 * @param t : text list
 * @param g : svg
 * @param j : row number 0/1/2
 * @param k : cell type list
 */
function row(t,g,j,k){
    var l = 0;
    for(i=0;i<cwidth.length;i++){
        if(k[i]!=9){
            cell(t[i],g,j*cwidth.length+l,k[i],t[mapping[i]]);
            l+=1;
        }
    }
}

/**
 * draw a pair
 * @param t:text
 * @param g:svg
 * @param m:mode
 */
function pair(t,g,m){
    var a = cwidth.length,
        b = cwidth.length+mapping.length,
        c = cwidth.length+2*mapping.length;
    var k = new Array(c).fill(1);
    k[a] = 2;
    k[b] = 0;
    var row1 = t.slice(a,b),
        row2 = t.slice(b,c),
        k1 = k.slice(a,b),
        k2 = k.slice(b,c);
    if(m=="Vanilla"){
        for(var j=1;j<mapping.length;j++){
            k[a+j] = j<a ? 3:9; k[b+j] = j<a ? 3:9;
        }
        row1 = t.slice(a,b);row2 = t.slice(b,c);
        k1 = k.slice(a,b);k2 = k.slice(b,c);
        for(var j=1;j<a;j++){
            if(j==3 || j==5){
                t[j] = ' '; row1[j] = ' '; row2[j] = ' ';
            }
        }
    }
    else if(m=="Full"){
        for(var j=1;j<mapping.length;j++){
            k[a+j] = j<a ? 3:9;k[b+j] = j<a ? 3:9;
        }
        row1 = t.slice(a,b);row2 = t.slice(b,c);
        k1 = k.slice(a,b);k2 = k.slice(b,c);
    }else{
        for(var j=0;j<mapping.length;j++){
            row1[j] = t[a+mapping[j]];row2[j] = t[b+mapping[j]];
        }
        k1[0] = 2;k2[0] = 0;
        if(m=="Partial"){
            for(var j=1;j<mapping.length;j++){
                k1[j] = j<a ? 3:9;k2[j] = j<a ? 3:9;
                if(j>0 && j<a && j!=3 && j!=5 && row1[j]==row2[j] && row1[j]!=""){
                    k1[j] = 4;k2[j] = 5;
                }
            }
        }
        if(m=="Full_Partial"){
            for(var j=1;j<mapping.length;j++){
                k1[j] = j<a ? 3:9;k2[j] = j<a ? 3:9;
                if(j>0 && j<a && j!=3 && j!=5 && row1[j]==row2[j] && row1[j]!=""){
                    k1[j] = 4;k2[j] = 5;

                }
                if(row1[j]!=row2[j]){
                    row1[j] = t[a+j];row2[j] = t[b+j];
                }
            }
        }
        if(m=="Partial_Row"||m=="Partial_Cell"){
            for(var j=1;j<mapping.length;j++){
                k1[j] = j<a ? 3:9;k2[j] = j<a ? 3:9;
                if(j>0 && j<a && j!=3 && j!=5 && row1[j]==row2[j] && row1[j]!=""){
                    k1[j] = 4;k2[j] = 5;
                }
                if(j>1 && j<a && j!=3 && j!=5 && row1[j]!=row2[j] && row1[j]!="" && row2[j]!=""){
                    k1[j] = 6;k2[j] = 6;
                }
            }
        }
    }
    row(t.slice(0,a),g,0,k.slice(0,a));
    row(row1,g,1,k1);
    row(row2,g,2,k2);
}
/**
 * draw multiple pairs
 * @param t : data
 * @param s : step
 * @param n : number of pairs
 * @param m : mode
 */
function pairs(t,s,n,m) {
    var num = n;
    for(var i=0;i<n;i++){
        var g = d3.select("#table").append("svg").attr("class","blocks").attr("id","g"+(s*5+i).toString())
            .attr("width", num>1 ? 1200:900).attr("height", 120);
        pair(title.concat(t[i][0]).concat(t[i][1]),g,m);
        if(num>1){
            choices(g,900,1,1);
        }
    }
}

// draw choice panel
// mode: 1=default 2=introduce
function choices(svg,lBound, scale,mode) {
    var options = ["Highly Likely Different",
        "Moderately Likely Different",
        "Less Likely Different",
        "Less Likely Same",
        "Moderately Likely Same",
        "Highly Likely Same"];
    var x = [20, 60, 100, 140, 180, 220];
    var lx = [10, 20, 38, 60, 78, 100, 118, 140, 158, 180, 198, 220, 238, 250];
    var y = 40;
    // add buttons
    var buttons = svg.append("g").attr("transform", "translate(" + lBound + ",20)");
    //buttons.append("rect").attr("x",-10*scale).attr("y",0).attr("width",280*scale).attr("height",85*scale).style("fill","#68a7ca").style("opacity",1);
    if(mode!=2){
        buttons.append("text").attr("x", 220 * scale).attr("y", 78 * scale).text("Same").attr("text-anchor", "middle").style("font", 24 * scale + "px sans-serif");
        buttons.append("text").attr("x", 50 * scale).attr("y", 78 * scale).text("Different").attr("text-anchor", "middle").style("font", 24 * scale + "px sans-serif");
    }
    for (var p = 0; p < options.length; p++) {
        buttons.append("text").attr("id","labelText"+p.toString())
            .attr("x", (x[p] + 8) * scale).attr("y", function(){if(mode==2 && p%2==1){return 66*scale;}return 30 * scale;})
            .text(function(){if(mode==2){return options[p];}return options[p][0];})
            .attr("text-anchor", "middle").style("font", function(){if(mode==2){return 14+"px sans-serif";}return 24 * scale + "px sans-serif";});
    }
    //arrows
    for(var pos=0;pos<7;pos++){
        var lineData = [{"x": lx[2*pos]*scale, "y": 44*scale+4*(scale-1)}, {"x": lx[2*pos+1]*scale, "y": 44*scale+4*(scale-1)}];
        var lineFunction = d3.svg.line()
            .x(function(d) { return d.x; })
            .y(function(d) { return d.y; })
            .interpolate("linear");
        buttons.append("path").attr("d", lineFunction(lineData))
            .attr("stroke", "black")
            .attr("stroke-width", 5)
            .style("fill","none");
    }
    var xScale = d3.scale.linear();
    var yScale = d3.scale.linear();
    var leftTrianglePoints = xScale(0) + ' ' + yScale(48*scale-4) + ', ' + xScale(10*scale) + ' ' + yScale(42*scale-4) +
        ', ' + xScale(10*scale) + ' ' + yScale(54*scale-4) + ' ' + xScale(10*scale) + ', ' + yScale(54*scale-4) + ' ' +
        xScale(0) + ' ' + yScale(48*scale-4);
    var rightTrianglePoints = xScale(260*scale) + ' ' + yScale(48*scale-4) + ', ' + xScale(250*scale) + ' ' +
        yScale(42*scale-4) + ', ' + xScale(250*scale) + ' ' + yScale(54*scale-4) + ' ' + xScale(250*scale) + ', ' +
        yScale(54*scale-4) + ' ' + xScale(260*scale) + ' ' + yScale(48*scale-4);
    buttons.append('polyline')
        .attr('points', leftTrianglePoints).attr("stroke","none").style('fill', 'black');
    buttons.append('polyline')
        .attr('points', rightTrianglePoints).attr("stroke","none").style('fill', 'black');

    for(var m=0;m<6;m++){
        var radioButton = buttons.append("g").attr("transform","translate("+x[m]*scale+","+y*scale+")");
        radioButton.append("svg:image").attr("xlink:href","/resources/0.png").attr("class","choice").attr("id",m)
            .attr("x",0).attr("y",-5).attr("width",18*scale).attr("height",18*scale);
        radioButton.on({"mouseover": function(d) {d3.select(this).style("cursor", "pointer")},
            "mouseout": function(d) {d3.select(this).style("cursor", "default")}})
            .on("click",function(d){
                buttons.select(".no").attr("opacity",0.2);
                buttons.selectAll(".choice").attr("xlink:href","/resources/0.png");
                d3.select(this).select("image").attr("xlink:href","/resources/1.png");
            });
    }
}

// draw choice panel
// mode: 1=default 2=introduce
function alt_choices(svg,lBound,mode) {
    var options = ["Highly Likely Different",
        "Moderately Likely Different",
        "Less Likely Different",
        "Less Likely Same",
        "Moderately Likely Same",
        "Highly Likely Same"];
    var x = [60, 180, 300, 420, 540, 660];
    var lx = [30, 60, 96, 180, 216, 300, 336, 420, 456, 540, 576, 660, 696, 750];
    var y = 140;
    // add buttons
    var buttons = svg.append("g").attr("transform", "translate(" + lBound + ",0)");
    //buttons.append("rect").attr("x",-10*scale).attr("y",0).attr("width",280*scale).attr("height",85*scale).style("fill","#68a7ca").style("opacity",1);
    if(mode!=2){
        buttons.append("text").attr("x", 660).attr("y", 220).text("Same").attr("text-anchor", "middle").style("font", 36 + "px sans-serif");
        buttons.append("text").attr("x", 150).attr("y", 220).text("Different").attr("text-anchor", "middle").style("font", 36 + "px sans-serif");
    }
    for (var p = 0; p < options.length; p++) {
        buttons.append("text").attr("id","labelText"+p.toString())
            .attr("x", x[p] + 18).attr("y", function(){if(mode==2 && p%2==1){return 180;}return 110;})
            .text(function(){if(mode==2){return options[p];}return options[p][0];})
            .attr("text-anchor", "middle").style("font", function(){if(mode==2){return 14+"px sans-serif";}return 40 + "px sans-serif";});
    }
    //arrows
    for(var pos=0;pos<7;pos++){
        var lineData = [{"x": lx[2*pos], "y": y}, {"x": lx[2*pos+1], "y": y}];
        var lineFunction = d3.svg.line()
            .x(function(d) { return d.x; })
            .y(function(d) { return d.y; })
            .interpolate("linear");
        buttons.append("path").attr("d", lineFunction(lineData))
            .attr("stroke", "black")
            .attr("stroke-width", 5)
            .style("fill","none");
    }
    var xScale = d3.scale.linear();
    var yScale = d3.scale.linear();
    var leftTrianglePoints = xScale(0) + ' ' + yScale(140) + ', ' + xScale(30) + ' ' + yScale(122) +
        ', ' + xScale(30) + ' ' + yScale(158) + ' ' + xScale(30) + ', ' + yScale(158) + ' ' +
        xScale(0) + ' ' + yScale(140);
    var rightTrianglePoints = xScale(780) + ' ' + yScale(140) + ', ' + xScale(750) + ' ' +
        yScale(122) + ', ' + xScale(750) + ' ' + yScale(158) + ' ' + xScale(750) + ', ' +
        yScale(158) + ' ' + xScale(780) + ' ' + yScale(140);
    buttons.append('polyline')
        .attr('points', leftTrianglePoints).attr("stroke","none").style('fill', 'black');
    buttons.append('polyline')
        .attr('points', rightTrianglePoints).attr("stroke","none").style('fill', 'black');

    for(var m=0;m<6;m++){
        var radioButton = buttons.append("g").attr("transform","translate("+x[m]+","+y+")");
        radioButton.append("svg:image").attr("xlink:href","/resources/0.png").attr("class","choice").attr("id",m)
            .attr("x",0).attr("y",-16).attr("width",36).attr("height",36);
        radioButton.on({"mouseover": function(d) {d3.select(this).style("cursor", "pointer")},
            "mouseout": function(d) {d3.select(this).style("cursor", "default")}})
            .on("click",function(d){
                buttons.select(".no").attr("opacity",0.2);
                buttons.selectAll(".choice").attr("xlink:href","/resources/0.png");
                d3.select(this).select("image").attr("xlink:href","/resources/1.png");
            });
    }
}

function parsing(route){
    d3.text(route, function (csvdata) {
        var groups = {};
        var parsedCSV = d3.csv.parseRows(csvdata);
        for (j = 1; j < parsedCSV.length; j++) {
            if (!(parsedCSV[j][0] in groups)) {
                groups[parsedCSV[j][0]] = [parsedCSV[j]];
            } else {
                groups[parsedCSV[j][0]] = groups[parsedCSV[j][0]].concat([parsedCSV[j]]);
            }
        }
        var values = Object.keys(groups).map(function (key) {
            return groups[key];
        });
        var raw_binary = values.filter(function (d) {
            return d.length == 2;
        });
        var binary = [];
        var other = [];
        var tmp = [];
        for (i = 0; i < raw_binary.length; i++) {
            if (tmp.length === 5 || i === raw_binary.length - 1) {
                binary.push(tmp);
                tmp = [];
            } else {
                tmp.push(raw_binary[i]);
            }
        }

        if (tmp != []) {
            binary.push(tmp);
        }
        tmp = values.filter(function (d) {
            return d.length == 4;
        });
        for (i = 0; i < tmp.length; i++) {
            var t = [];
            for (j = 0; j < tmp[i].length / 2; j++) {
                t.push([tmp[i][2 * j], tmp[i][2 * j + 1]]);
            }
            other.push(t);
        }
        tmp = values.filter(function (d) {
            return d.length == 6;
        });
        for (i = 0; i < tmp.length; i++) {
            var t = [];
            for (j = 0; j < tmp[i].length / 2; j++) {
                t.push([tmp[i][2 * j], tmp[i][2 * j + 1]]);
            }
            other.push(t);
        }
        data.mat = binary.concat(other);
        experimentr.addData(data);
    });
}
