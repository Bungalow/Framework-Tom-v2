// varianles that are used right in the index.html file
var light_x = new Number(-1); // light x coordinate
var light_z = new Number(0); // light y coordinate
var light_increment = new Number(0.1); // light increment

var my_textures = {}; // array of user textures
var my_objects = []; // array of user 3D objects

var nRows = 64;
var Z;
var p = 0;
var d = .15;
var colors;
var unpackedColors;

$(document).ready(function() {
    var moving_light = false;
	colors = rgba;
    // stretch WebGL canvas and its parent across the whole screen
    $(window).resize(function() {
        $('div.wrapper').css({'height':(($(window).height()))+'px'});
        $('div.wrapper').css({'width':(($(window).width()))+'px'});
        $('div.wrapper').find('canvas#canvas').css({'height':(($(window).height()))+'px'});
        $('div.wrapper').find('canvas#canvas').css({'width':(($(window).width()))+'px'});
    });
    // trigger initial resize
    $(window).trigger('resize');
    nVerts = nRows * nRows * 4;
	//Z height field 
	Z = [];
	for(var i = 0; i < nVerts; i++){
		Z[i] = new Array(3);
	}
	for(var i = 0; i < nVerts; i++){
		Z[i][0] = 0;
		Z[i][1] = 0;
		Z[i][2] = 0;
    }
	// inflate customized functionality for two buttons
    $('#buttonInflate').click(function(e) {
        p += 0.2;
		inflate();
        e.preventDefault();
    });
	
	

	// deflate customized functionality for two buttons
    $('#buttonDeflate').click(function(e) {
        p -= 0.2;
		inflate();
        e.preventDefault();
    });
    // zoom customized functionality for two buttons
    $('#buttonZoomIn').click(function(e) {
        scene.zoom -= 5;
        gl.perspectiveMatrix = new J3DIMatrix4();
        gl.perspectiveMatrix.perspective(45, scene.width/scene.height, 0.1, 10000);
        gl.perspectiveMatrix.lookat(0, 0, scene.zoom, 0, 0, 0, 0, 1, 0);
        gl.perspectiveMatrix.rotate(30, 1,0,0);
        gl.perspectiveMatrix.rotate(-30, 0,1,0);
        e.preventDefault();
    });
    
    $('#buttonZoomOut').click(function(e) {
        scene.zoom += 5;
        gl.perspectiveMatrix = new J3DIMatrix4();
        gl.perspectiveMatrix.perspective(45, scene.width/scene.height, 0.1, 10000);
        gl.perspectiveMatrix.lookat(0, 0, scene.zoom, 0, 0, 0, 0, 1, 0);
        gl.perspectiveMatrix.rotate(30, 1,0,0);
        gl.perspectiveMatrix.rotate(-30, 0,1,0);
        e.preventDefault();
    });
    
    // moving light logic: there are 4 key "sections" in the scene where light
    // coordinates have to switch from incrementing to decrementing and vice versa
    $('#buttonStartMovingLight').click(function(e) {
        if(moving_light) {
            moving_light = false;
            clearTimeout(light_timer);
            $('#buttonStartMovingLight').html('Start Moving Light');
        } else {
            moving_light = true;
            $('#buttonStartMovingLight').html('Stop Moving Light');
            
            //start moving light every 10 milliseconds
            light_timer = setInterval(function() {
                // reset light
                gl.uniform3f(gl.getUniformLocation(gl.program, "lightDir"), light_x, 1, light_z);
                // if-else logic for light coordinates
                if(light_x < 0 && (light_z >= -0.11 && light_z < 1.1)) {
                    light_x = light_x + light_increment;
                    light_z = light_z + light_increment;
                }else if((light_x >= 0 && light_x <= 1) && (light_z >= 0.1)) {
                    light_x = light_x + light_increment;
                    light_z = light_z - light_increment;
                }else if((light_x >= 0) && (light_z >= -1.1 && light_z <= 0.11)) {
                    light_x = light_x - light_increment;
                    light_z = light_z - light_increment;
                }else if((light_x >= -1 && light_x <= 0) && (light_z <= 0)) {
                    light_x = light_x - light_increment;
                    light_z = light_z + light_increment;
                }

            }, 10);
        }

        e.preventDefault();
    });
    
    // perspective projection, view from 30 degrees
    $('#buttonPerspectiveNormal').click(function(e) {
        mouse_rotate = true;
        gl.perspectiveMatrix = new J3DIMatrix4();
        gl.perspectiveMatrix.perspective(45, scene.width/scene.height, 0.1, 10000);
        gl.perspectiveMatrix.lookat(0, 0, 20, 0, 0, 0, 0, 1, 0);
        gl.perspectiveMatrix.rotate(30, 1,0,0);
        gl.perspectiveMatrix.rotate(-30, 0,1,0);
        e.preventDefault();
    });
    
    // orthogonal projection, view from the top
    $('#buttonPerspectiveTop').click(function(e) {
        mouse_rotate = false;
        gl.perspectiveMatrix = new J3DIMatrix4();
        gl.perspectiveMatrix.perspective(1, scene.width/scene.height, 0.1, 10000);
        gl.perspectiveMatrix.lookat(0, 0, 600, 0, 0, 0, 0, 1, 0);
        gl.perspectiveMatrix.rotate(90, 1,0,0);
        e.preventDefault();
    });
    
    // orthogonal projection, view from the side
    $('#buttonPerspectiveSide').click(function(e) {
        mouse_rotate = false;
        gl.perspectiveMatrix = new J3DIMatrix4();
        gl.perspectiveMatrix.perspective(1, scene.width/scene.height, 0.1, 10000);
        gl.perspectiveMatrix.lookat(0, 0, 600, 0, 0, 0, 0, 1, 0);
        gl.perspectiveMatrix.rotate(-90, 0,1,0);
        e.preventDefault();
    });
    
    // remove last object from the objects array
    $('#buttonRemoveOneObject').click(function(e) {
        my_objects.pop()
        e.preventDefault();
    });
    
        // manually add objects to the objects array
    my_objects = [
        "'grid', 45, 0, 2, 0, 1, buildingTexture,'UNSIGNED_SHORT'"
    ];
    
    // add textures to the textures associative array
    my_textures = {
        buildingTexture : "textures/logo3.gif"
    };
    
    // create a new scene with the canvas object id, framerate div id,
    // array of 3D objects, associative array of textures, and default zoom
    scene = new Scene('canvas', 'framerate', my_objects, my_textures, 150);
    // add customized meshes
    //gl.smallSphere = meshCollection.sphere(0.5, 30, 30);
    gl.grid = meshCollection.grid(nRows);
});

function itInflate(){
    var row = 0;
	var rowIndex = 0;
	while(row != nRows*2){
		if( row%2 == 0){
			for(var i = 0; i < nRows*4; i+=4){
				if( row == 0){
					Z[i+rowIndex][1] = 0;
					Z[i+1+rowIndex][1] = 0;
				}
				else {
					Z[i+rowIndex][1] = Z[i+2+rowIndex-(nRows*4)][1];
					Z[i+1+rowIndex][1] = Z[i+3+rowIndex-(nRows*4)][1];
				}
			}
		}
		else {
			for(var i = 0; i < nRows*4; i+=4){
				if( row == (nRows*2)-1){
					Z[i+2+rowIndex][1] = 0;
					Z[i+3+rowIndex][1] = 0;	
				}
				else{
					if(i+rowIndex == rowIndex){
						Z[i+2+rowIndex][1] = 	0;
						if(colors[(i+rowIndex)/4][3] == 0){
							Z[i+3+rowIndex][1] = 0;
						}
						else {
							Z[i+3+rowIndex][1] = (
								d*(Z[i+3+rowIndex - 1][1] 
								+ Z[i+3+rowIndex + 4][1]
								+ 0 
								+ Z[i+3+rowIndex + (nRows*4)][1]  
								- (4*Z[i+3+rowIndex][1]) 
								+ p)
								+ Z[i+3+rowIndex][1]
							);
						}
					}
					else if(i == 252){
						if(colors[(i+rowIndex)/4][3] == 0){
							Z[i+2+rowIndex][1] = 0;
						}
						Z[i+2+rowIndex][1] = (
							d*(Z[i+2+rowIndex - 4][1] 
							+ Z[i+2+rowIndex + 1][1]
							+ Z[i+2+rowIndex + (nRows*4)][1] 
							+ 0  
							- (4*Z[i+2+rowIndex][1]) 
							+ p)
							+ Z[i+2+rowIndex][1]
						);
						Z[i+3+rowIndex][1] =  	0;
						Z[i+2+rowIndex][1] = Z[i+2+rowIndex-3][1];
					}
					else {
						if(i+2+rowIndex - (nRows*4) < 0 ){
							if(colors[(i+rowIndex)/4][3] == 0){
								Z[i+2+rowIndex][1] = 0;
							}
							else {
								Z[i+2+rowIndex][1] = (
									d*(Z[i+2+rowIndex - 4][1] 
									+ Z[i+2+rowIndex + 4][1]
									+ 0  
									+ Z[i+2+rowIndex + (nRows*4)][1]  
									- (4*Z[i+2+rowIndex][1]) 
									+ p)
									+ Z[i+2+rowIndex][1]
								);
							}									 
						}
						else {
							if(colors[(i+rowIndex)/4][3] == 0){
								Z[i+2+rowIndex][1] = 0;
							}
							else {
								Z[i+2+rowIndex][1] = (
									d*(Z[i+2+rowIndex - 4][1] 
									+ Z[i+2+rowIndex + 4][1]
									+ Z[i+2+rowIndex - (nRows*4)][1]  
									+ Z[i+2+rowIndex + (nRows*4)][1]  
									- (4*Z[i+2+rowIndex][1]) 
									+ p)
									+ Z[i+2+rowIndex][1]
								);
							}
						}
						if(i+3+rowIndex - (nRows*4) < 0 ){
							if(colors[(i+rowIndex)/4][3] == 0){
								Z[i+3+rowIndex][1] = 0;
							}
							else {
								Z[i+3+rowIndex][1] = (
									d*(Z[i+3+rowIndex - 4][1] 
									+ Z[i+3+rowIndex + 4][1]
									+ 0   
									+ Z[i+3+rowIndex + (nRows*4)][1]  
									- (4*Z[i+3+rowIndex][1]) 
									+ p)
									+ Z[i+3+rowIndex][1]
								);
							}
						}
						else {
							if(colors[(i+rowIndex)/4][3] == 0){
								Z[i+3+rowIndex][1] = 0;
							}
							else {
								Z[i+3+rowIndex][1] = (
									d*(Z[i+3+rowIndex - 4][1] 
									+ Z[i+3+rowIndex + 4][1]
									+ Z[i+3+rowIndex - (nRows*4)][1]   
									+ Z[i+3+rowIndex + (nRows*4)][1]  
									- (4*Z[i+3+rowIndex][1]) 
									+ p)
									+ Z[i+3+rowIndex][1]
								);
							}									 
						}
						Z[i+2+rowIndex][1] = Z[i+2+rowIndex-3][1];
					}
				}
			}
			rowIndex += nRows*4;
		}
		row+= 1;
	}
}

function inflate(){
     for(var i = 0; i < 15; i++){
         itInflate();
    }
	gl.grid = meshCollection.grid();
}
