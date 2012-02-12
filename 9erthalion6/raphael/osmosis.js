//raph vars
var circles = new Array();
var lines = new Array();
var paper;
var player;
var mouseX = -100;
var mouseY = -100;

var numcircles = 30;
var winwidth = 800;
var winheight = 600;
var count=numcircles;

var fillcolors = ["#409933","#9922BB","#CCBB33","#4080BB"];
var strokecolor = "#FFFFFF";

//init
$(document).ready(init);

function init()
{	
	$("#restart_win").hide();
	$("#restart_loose").hide();
	
	//Raph stuff
	paper = Raphael(document.getElementById("raph"), winwidth, winheight);
	
	$("#raph").mousemove(function (ev) {
		mouseX = ev.pageX - this.offsetLeft;
		mouseY = ev.pageY - this.offsetTop;	
	});
	
	$("#raph").click(playerClicked);
	
	//create inital circles
	for (var i=0; i<numcircles; i++){
		var x,y,rad,dx,dy;
		x=Math.random()*winwidth;
		y=Math.random()*winheight;
		rad=Math.random()*20+5;
		otype=Math.floor(Math.random()*4)+1; //1-4
		dx=Math.random()-0.5;
		dy=Math.random()-0.5;
		
		var circle = paper.circle(x,y,rad).attr({opacity: 1, fill: fillcolors[otype-1], "stroke-opacity": 1, stroke: strokecolor, "stroke-width": 2});
		circle.dx = dx;
		circle.dy = dy;
		circle.otype = otype;
		circle.absorbed= false;
		
		circles.push(circle);		
	}

	player = circles[0];
	player.dx=0;
	player.dy=0;
	player.otype=0;
	player.attr({fill: "#CC4444", stroke: "#CC0000"});
	
	setTimeout('doRaph();',50);
}

function playerClicked(ev) {
	mouseX = ev.pageX - this.offsetLeft;
	mouseY = ev.pageY - this.offsetTop;	
	
	//animate player toward...
	var dist = Math.sqrt(sqdist(mouseX,mouseY,player.attr("cx"),player.attr("cy")));
	var lengthOfTime = dist * 5;
	var newrad = player.attr("r")*0.9; //- (dist / 400);
	player.stop();
	player.attr({r: newrad});
	player.animate({cx: mouseX, cy: mouseY}, lengthOfTime, ">");
}

function sqdist(x1,y1,x2,y2)
{
	return Math.pow(x1-x2,2)+Math.pow(y1-y2,2);
}

function doRaph()
{
	if(count==1)
		$("#restart_win").show();

	//check for closeness and create lines
	for (var i=1; i<numcircles; i++){
		//do random movement depending on type
		switch (circles[i].otype)
		{
			case 1:
				if (Math.random()*400 < 1)
				{
					var x=Math.random()*winwidth;
					var y=Math.random()*winheight;
					var lengthOfTime = Math.sqrt(sqdist(x,y,circles[i].attr("cx"),circles[i].attr("cy"))) * 6;
					circles[i].stop();
					circles[i].animate({cx: x, cy: y},lengthOfTime,">");
				}
				break;
			case 2:
				if (Math.random()*400 < 1)
				{
					var target = circles[Math.floor(Math.random()*numcircles)];
					var x=target.attr("cx");
					var y=target.attr("cy");
					var lengthOfTime = Math.sqrt(sqdist(x,y,circles[i].attr("cx"),circles[i].attr("cy"))) * 6;
					circles[i].stop();
					circles[i].animate({cx: x, cy: y},lengthOfTime,">");
				}
				break;
			case 3:
				if (Math.random()*400 < 1)
				{
					circles[i].dx=Math.random()-0.5;
					circles[i].dy=Math.random()-0.5;
				}
				break;
			case 4:
				//do nothing
				break;
		}
		
		//check for absorbtion of player
		if (sqdist(circles[i].attr("cx"),circles[i].attr("cy"),player.attr("cx"),player.attr("cy")) < Math.pow(circles[i].attr("r")+player.attr("r"),2))
		{
			var bigger, smaller, bondedSize = circles[i].attr("r");
			
			for (var n=0; n<lines.length; n++)
				if (lines[n].c1 == circles[i])
					bondedSize += lines[n].c2.attr("r")/2;
				else if (lines[n].c2 == circles[i])
					bondedSize += lines[n].c1.attr("r")/2;
					
			if (circles[i].attr("r")>player.attr("r") || bondedSize > player.attr("r"))
			{
				bigger = circles[i];
				smaller = player;
				//paper.text(375,290,"You've been destroyed!").attr({fill: "#FFFFFF"});
				//window.location.href="http://localhost:8080";
				$("#restart_loose").show('slide');
			}
			else 
			{
				bigger = player;
				smaller = circles[i];
			}			
			if (!smaller.absorbed)
			{
				bigger.animate({r: bigger.attr("r")+smaller.attr("r")/3},100, ">");
				smaller.animate({r: 0},100, ">");
				smaller.absorbed=true;
				bigger.absorbed=false;
			}
		}
	
		//do bonding/ friend absorbtion
		for (var j=1; j<numcircles; j++){
			if (i!=j){
				var theline = null;
				
				//check for absorbtion
				if (sqdist(circles[i].attr("cx"),circles[i].attr("cy"),circles[j].attr("cx"),circles[j].attr("cy")) < Math.pow(circles[i].attr("r")+circles[j].attr("r"),2))
				{
					var bigger, smaller;
					if (circles[i].attr("r")>circles[j].attr("r"))
					{
						bigger = circles[i];
						smaller = circles[j];
					}
					else 
					{
						bigger = circles[j];
						smaller = circles[i];
					}
					if (!smaller.absorbed)
					{
						smaller.absorbed=true;
						bigger.absorbed=false;
						bigger.animate({r: bigger.attr("r")+smaller.attr("r")/3},500, ">");
						smaller.animate({r: 0},250, ">");
					}
				}
				
				//check for preexisting line
				for (var k=0; k<lines.length; k++){
					if ( (lines[k].c1 == circles[i] && lines[k].c2 == circles[j]) ||
						 (lines[k].c2 == circles[i] && lines[k].c1 == circles[j]) )
					{
						theline = lines[k];
						break;
					}
				}
				
				// If the circles are close and not 'dead'...make a line if no line exists (bonded)
				if(circles[i].attr("r") > 0.5 && circles[j].attr("r") > 0.5 && sqdist(circles[i].attr("cx"),circles[i].attr("cy"),circles[j].attr("cx"),circles[j].attr("cy")) < Math.pow(circles[i].attr("r")*4,2) ){
					if (theline==null){
						lines[k] = paper.path("M "+circles[i].attr("cx")+","+circles[i].attr("cy")+" L "+circles[j].attr("cx")+","+circles[j].attr("cy")).attr({stroke: "#40AAAA", opacity: 1});
						lines[k].c1=circles[i];
						lines[k].c2=circles[j];
					}else{
						lines[k].attr({path: "M "+circles[i].attr("cx")+","+circles[i].attr("cy")+" L "+circles[j].attr("cx")+","+circles[j].attr("cy"), stroke: "#40AAAA", opacity: 1});
					}					
				}//break the line
				else if (theline!=null) {
					theline.remove();
					lines.splice(k,1);
				}
			}
		}
	}

	count=numcircles
	//move circles
	for (var i=1; i<numcircles; i++)
	{
		var circle = circles[i];
		
		if(circle.absorbed == true)
			count--
			
		if (circle.attr("r") > 0.5)
		{
			circle.translate(circle.dx,circle.dy);
			
			if (circle.attr("cx")+circle.attr("r") < 0){
				circle.attr({cx: winwidth+circle.attr("r")});
			}
			else if (circle.attr("cx")-circle.attr("r") > winwidth){
				circle.attr({cx: 0-circle.attr("r")});
			}
			
			if (circle.attr("cy")+circle.attr("r") < 0){
				circle.attr({cy: winheight+circle.attr("r")});
			}
			else if (circle.attr("cy")-circle.attr("r") > winheight){
				circle.attr({cy: 0-circle.attr("r")});
			}	
		}
	}
	
	paper.safari();
	setTimeout('doRaph();',50);
}