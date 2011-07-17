jQuery(function ($) {
	// redirect the old bitches
	if(!Modernizr.canvas) {
		jQuery('#tweet').html('<h1>oh noez - please get yourself a sophisticated browser like <a href="http://getfirefox.com">FireFox 3.5</a>, <a href="http://apple.com/safari">Safari</a>, <a href="http://www.opera.com/">Opera</a> or <a href="http://google.com/chrome">Chrome</a> </h1>');
	} else {
		var numParticles = 25;
		var i;
		var el = document.getElementById("theapt");	
		var width = window.innerWidth;
		var height = window.innerHeight;
		var p = Processing(el);
		var mx = 0;
		var my = 0;
		var impulsX = 0;
		var impulsY = 0;
		var impulsToX = 0;
		var impulsToY = 0;
		var startedAt;
		var now;
		var machine = [6094, 13653, 15132, 16624, 18137, 19629, 21172, 22629, 24140, 25631, 27140, 28728, 30108, 31633, 33142, 34656, 36134, 37636, 39152, 40668, 42131, 43596, 45170, 46619, 48147, 49642, 51163, 52626, 54220, 55669, 57149, 58617, 60118, 61572, 63064, 64549, 66134, 67616, 70573, 72115, 73594, 75107, 76604, 78117, 79628, 81125, 82628, 84161, 85644, 87213, 88651, 90194, 91673, 93248, 94668, 96147, 97629, 99173, 100637, 102242, 103692, 105236, 106636, 108182, 109587, 111148, 112630, 114060, 115637, 117069, 118042, 120172, 121676, 123254, 124577, 126202, 127817, 129686, 132052, 133604, 135179, 136652, 138187, 139609, 141084, 142571, 144084, 145603, 147180, 148573, 150142, 151820, 153211, 154567, 156097, 157597, 159110, 160595, 162149, 163617, 165123, 166565, 168089, 169603, 171215, 173446, 175598, 177048, 178490, 180269, 181616, 184604, 189284, 192782, 195827, 198787, 201856, 204867, 207819, 211191, 213709, 216808, 219764, 222804, 225795, 228737, 229605, 231068, 232588, 234106, 235611, 237056, 238591, 240083, 241606, 243091, 244580];
		var machineIndex = 0;
		var events = [];
		var play = false;
		var focusedParticleIndex = null;
		window.cps_pause = false;
		
		components = [];

		// universe
		var pixels = [];
		for(i = 0; i<numParticles; i++ ) {
			pixels[i] = {
				x          : Math.random()*width,
				y          : height/2,
				toX        : 0,
				toY        : height/2,
				color      : Math.random()*200 + 55,
				angle      : Math.random()*Math.PI*2,
				size       : 0,
				toSize     : Math.random()*4+1,
				r		   : 0,
				g		   : 0,
				b          : 0,
				toR 	   : Math.random()*255,
				toG 	   : Math.random()*255,
				toB 	   : Math.random()*255,
				flightMode : 0
			};
			pixels[i].toX = pixels[i].x;
			pixels[i].speedX = 0;
			pixels[i].speedY = 0; 
		}

		var transitions = [
			// random position
			function() {
				for(i = 0; i<pixels.length; i++ ) {
					var p = pixels[i];
					if(p.flightMode != 2) {
						p.toX = Math.random()*width;
						p.toY = Math.random()*height;
						p.speedX = Math.cos(p.angle) * Math.random() * 3;
						p.speedY = Math.sin(p.angle) * Math.random() * 3; 
					}
				}
			},
			// white flash
			function() {
				for(i = 0; i<pixels.length; i++ ) {
					var p = pixels[i];
					if(p.flightMode != 2) {
						p.r = 255;
						p.g = 255;
						p.b = 255;
						p.size = Math.random()*50 + 50;
					}
				}
			},
			// change size
			function() {
				for(i = 0; i<pixels.length; i++ ) {
					var p = pixels[i];
					if(p.flightMode != 2) {
						p.toSize = Math.random()*10+1;
					}
				}
			},
			// circle shape
			function() {
				var r = Math.floor(Math.random()*250 + 100);
				for(i = 0; i<pixels.length; i++ ) {
					var p = pixels[i];
					if(p.flightMode != 2) {
						p.toSize = Math.random()*4+1;
						p.toX = width/2 + Math.cos(i*3.6*Math.PI/45) * r;
						p.toY = height/2 + Math.sin(i*3.6*Math.PI/45) * r;
						impulsX = 0;
						impulsY = 0;
						p.speedX = (Math.random() - 0.5);
						p.speedY = (Math.random() - 0.5); 
						p.toR = Math.random()*255;
						p.toG = Math.random()*255;
						p.toB = Math.random()*255;
					}
				}
			}
		];


		var Universe = function Pixels() {
			return {
				framecount : 0,

				update: function () {
					impulsX = impulsX + (impulsToX - impulsX) / 30;
					impulsY = impulsY + (impulsToY - impulsY) / 30;

					// move to tox
					for(i = 0; i<pixels.length; i++ ) {
						pixels[i].x = pixels[i].x + (pixels[i].toX - pixels[i].x) / 10;
						pixels[i].y = pixels[i].y + (pixels[i].toY - pixels[i].y) / 10;
						pixels[i].size = pixels[i].size + (pixels[i].toSize - pixels[i].size) / 10;

						pixels[i].r = pixels[i].r + (pixels[i].toR - pixels[i].r) / 10;
						pixels[i].g = pixels[i].g + (pixels[i].toG - pixels[i].g) / 10;
						pixels[i].b = pixels[i].b + (pixels[i].toB - pixels[i].b) / 10;
					}

					// update speed
					for(i = 0; i<pixels.length; i++ ) {
						// check for flightmode
						var a = Math.abs(pixels[i].toX - mx) *  Math.abs(pixels[i].toX - mx);
	                    var b = Math.abs(pixels[i].toY - my) *  Math.abs(pixels[i].toY - my);
	                    var c = Math.sqrt(a+b);

						if(pixels[i].flightMode != 2) {
							if(c < 120) {
								if(pixels[i].flightMode == 0) {
				                    var alpha = Math.atan2(pixels[i].y - my, pixels[i].x - mx) * 180 / Math.PI + Math.random()*180-90;
				                    pixels[i].degree = alpha;
									pixels[i].degreeSpeed = Math.random()*1+0.5;
									pixels[i].frame = 0;
								}
								pixels[i].flightMode = 1;
							} else {
								pixels[i].flightMode = 0;
							}
						}

						// random movement
						if(pixels[i].flightMode == 0) {
							// change position
							pixels[i].toX += pixels[i].speedX;
							pixels[i].toY += pixels[i].speedY;

							// check for bounds
							if(pixels[i].x < 0) {
								pixels[i].x = width;
								pixels[i].toX = width;
							}
							if(pixels[i].x > width) {
								pixels[i].x = 0;
								pixels[i].toX = 0;
							}

							if(pixels[i].y < 0) {
								pixels[i].y = height;
								pixels[i].toY = height;
							}
							if(pixels[i].y > height) {
								pixels[i].y = 0;
								pixels[i].toY = 0;
							}
						}

						// seek mouse
						/*if(pixels[i].flightMode == 1) {
							pixels[i].toX = mx + Math.cos((pixels[i].degree + pixels[i].frame ) % 360 * Math.PI /180)*c;
							pixels[i].toY = my + Math.sin((pixels[i].degree + pixels[i].frame ) % 360 * Math.PI /180)*c;
							pixels[i].frame += pixels[i].degreeSpeed;
							pixels[i].degreeSpeed += 0.01;
						}*/

						if(pixels[i].flightMode != 2) {
							// add impuls
							pixels[i].toX += Math.floor(impulsX * pixels[i].size/30);
							pixels[i].toY += Math.floor(impulsY * pixels[i].size/30);
						}
					}

					// set an choord
					var r1 = Math.floor(Math.random() * pixels.length);
					var r2 = Math.floor(Math.random() * pixels.length);

					if(pixels[r1].flightMode != 2) pixels[r1].size = Math.random()*30;
					if(pixels[r2].flightMode != 2) pixels[r2].size = Math.random()*30;

					this.framecount++;

					now = new Date();
					if(now.getTime() - startedAt.getTime() >= 2*machine[machineIndex]) {
						machineIndex++;
						impulsX = Math.random()*800-400;
						impulsY = -Math.random()*400;

						var transIndex = Math.floor(Math.random()*transitions.length);
						transitions[transIndex]();
					}				
				},
				draw: function () {	

					for(i = 0; i<pixels.length; i++ ) {
						p.fill(Math.floor(pixels[i].r), Math.floor(pixels[i].g), Math.floor(pixels[i].b));
						p.ellipse(pixels[i].x, pixels[i].y, pixels[i].size, pixels[i].size);
					}

					if(focusedParticleIndex != null) {
						p.fill(Math.floor(pixels[focusedParticleIndex].r), Math.floor(pixels[focusedParticleIndex].g), Math.floor(pixels[focusedParticleIndex].b));
						p.ellipse(pixels[focusedParticleIndex].x, pixels[focusedParticleIndex].y, pixels[focusedParticleIndex].size, pixels[focusedParticleIndex].size);				
					}
				}
			}
		};
		components.push(new Universe());

		// setup processing object
		p.setup = function() {
			p.size(width, height);
			//p.noStroke();
			p.frameRate( 60 );
			p.fill(0, 0, 0);

			startedAt = new Date();
		}

		/*p.mouseMoved = function(){
	      mx = p.mouseX;
	      my = p.mouseY;
	    }*/

		p.draw=function(){
		  if(window.cps_pause == false) {
  			if(play) {
  				for (var i=0; i<components.length; i++) {
  					components[i].update();
  				}
  				p.background( 0 );
  				for (var i=0; i<components.length; i++) {
  					components[i].draw();
  				}
  			}
		  }
		}

		p.init();
		
		startedAt = new Date();
		play = true;
	}
});
