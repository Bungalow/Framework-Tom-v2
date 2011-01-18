/*
    MeshCollection.js
    
    MeshCollection class is responsable storing matrix information about
    objects.
    
    The object needs to be initialized whenever any 3D object needs to be
    created.
*/
MeshCollection = function()
{
    this.grid_vertices;
}
var vNormals = [];
var unpackedvNormals = [];	
var vTexCoords = [];
var vIndices = [];
var normals;
var texCoords;
var indices;
var retval;
var unpackedvgrid;
var vgrid;
MeshCollection.prototype.grid = function() {
	// set up verts
	this.vGrid(nRows);
	
	nVerts = nRows * nRows * 4;

    // normal array
	/*var vNormals = [];
	var normDirec = 0;
	for(var i = 0; i < nVerts*3; i +=3){
		vNormals[i]   = 0;
		vNormals[i+1] = 1;
		vNormals[i+2] = 0;
	}
	var normals = new Float32Array(vNormals);*/
	//var vNormals = [];
	for(var i = 0; i < nVerts; i++){
		vNormals[i] = new Array(3);
	}
	for(var i = 0; i < nVerts; i+=4){
		if(i == 0){
			vNormals[i][0] = Z[i][0]-Z[i+1][0];
			vNormals[i][1] = Z[i][1]-Z[i+1][1];
			vNormals[i][2] = 1//Z[i][2]-Z[i+1][2];
		}
		else if(i == nVerts-1){
			vNormals[i][0] = Z[i-1][0]-Z[i][0];
			vNormals[i][1] = Z[i-1][1]-Z[i][1];
			vNormals[i][2] = 1//Z[i-1][2]-Z[i][2];
		}
		else{
			vNormals[i][0] = Z[i-1][0]-Z[i+1][0];
			vNormals[i][1] = Z[i-1][1]-Z[i+1][1];
			vNormals[i][2] = 1//Z[i-1][2]-Z[i+1][2];
		}
		vNormals[i+1][0] = vNormals[i][0];
		vNormals[i+1][1] = vNormals[i][1];
		vNormals[i+1][2] = vNormals[i][2];
		vNormals[i+2][0] = vNormals[i][0];
		vNormals[i+2][1] = vNormals[i][1];
		vNormals[i+2][2] = vNormals[i][2];
		vNormals[i+3][0] = vNormals[i][0];
		vNormals[i+3][1] = vNormals[i][1];
		vNormals[i+3][2] = vNormals[i][2];
	}
	//var unpackedvNormals = [];	
    for (var i in vNormals) {
		for (var j=0; j < 3; j++) {
			unpackedvNormals[(i*3)+j] = vNormals[i][j];
		}
    }
	normals = new Float32Array(unpackedvNormals);
	
    // texCoord array
	//var vTexCoords = [];
	var tXCoord = 0;
	var tYCoord = 0;
	for(var i = 0; i < nVerts*2 ; i+=8 ){
		vTexCoords[i+4] = 0+tXCoord;
		vTexCoords[i+5] = (1-(1/nRows))-tYCoord;
		vTexCoords[i+6] = (1/nRows)+tXCoord;
		vTexCoords[i+7] = (1-(1/nRows))-tYCoord;
		vTexCoords[i+2] = (1/nRows)+tXCoord;
		vTexCoords[i+3] = 1-tYCoord;
		vTexCoords[i] = 0+tXCoord;
		vTexCoords[i+1] = 1-tYCoord;
		if((i+8)%(nRows*8)==0){
			tXCoord=0;
			tYCoord+=(1/nRows);
		}
		else{
			tXCoord+=(1/nRows);
		}
	}
	texCoords = new Float32Array(vTexCoords);
    /*var texCoords = new Float32Array(
        [
           1, 0,   1, 1,   0, 1,   0, 0,    // v0-v5-v6-v1 top
        ]
       );*/


    // index array
    // take the 4 verticies for a tile, and make 2 triangles
	var gVISize = nRows * nRows * 6;
	//var vIndices = [];
	var index = 0;
	for( var i = 0; i < gVISize; i+=6){
		vIndices[i] =   index;
		vIndices[i+1] = index+2;
		vIndices[i+2] = index+3;
		vIndices[i+3] = index;
		vIndices[i+4] = index+1;
		vIndices[i+5] = index+3;
		index += 4;
	}
	indices = new Uint16Array(vIndices);    // FUCK UINT8!!!
    /*var indices = new Uint8Array(
        [  0, 1, 2,   0, 2, 3,
          ]
      );*/

    retval = { };

    retval.vertexObject = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, retval.vertexObject);
    gl.bufferData(gl.ARRAY_BUFFER, this.grid_vertices, gl.STATIC_DRAW);

    retval.texCoordObject = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, retval.texCoordObject);
    gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);

    retval.normalObject = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, retval.normalObject);
    gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    retval.indexObject = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, retval.indexObject);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

    retval.numIndices = indices.length;

    return retval;
}
MeshCollection.prototype.vGrid = function(nrows) {
	//time = scene.time / 1000;

	verts = nRows * nRows * 4;
	vgrid=[];
	/*for(i = 0; i < verts; i++) {
		vgrid[i] = new Array(3);
    }*/
	for(var i = 0; i < verts ; i++){
		vgrid[i] = new Array(3);
	}
	var rowIndex = 0;
	var row = 0;
	var zRowAdd = 0;
	
	while(row != nrows){
	//set x's
		for( var i = 0; i < verts/nrows; i+=4){
			if( i < 4){
				vgrid[i+rowIndex][0] =  	-64;//-1;
				vgrid[i+1+rowIndex][0] = 	 -62;//1;
				vgrid[i+2+rowIndex][0] = 	-64;//-1;
				vgrid[i+3+rowIndex][0] = 	 -62;//1;
			}
			else{
				vgrid[i+rowIndex][0]   = vgrid[i-3+rowIndex][0];
				vgrid[i+1+rowIndex][0] = vgrid[i-4+rowIndex][0]+4;
				vgrid[i+2+rowIndex][0] = vgrid[i-3+rowIndex][0];
				vgrid[i+3+rowIndex][0] = vgrid[i-4+rowIndex][0]+4;
			}
		}
		//set y's
		for( var i = 0; i < verts/nrows; i+=4){
				vgrid[i+rowIndex][1] = 0 + Z[i+rowIndex][1];
				vgrid[i+1+rowIndex][1] = 0 + Z[i+1+rowIndex][1];
				vgrid[i+2+rowIndex][1] = 0 + Z[i+2+rowIndex][1];
				vgrid[i+3+rowIndex][1] = 0 + Z[i+3+rowIndex][1];
		}	
		//set z's
		for( var i = 0; i < verts/nrows; i+=4){
				vgrid[i+rowIndex][2]   = -64 + zRowAdd;
				vgrid[i+1+rowIndex][2] = -64 + zRowAdd;
				vgrid[i+2+rowIndex][2] =  -62 + zRowAdd;
				vgrid[i+3+rowIndex][2] =  -62 + zRowAdd;	
		}
		rowIndex += verts/nrows;
		zRowAdd += 2;
		row += 1;
	}
	unpackedvgrid = [];	
    for (var i in vgrid) {
		for (var j=0; j < 3; j++) {
			unpackedvgrid[(i*3)+j] = vgrid[i][j];
		}
    }
	this.grid_vertices = new Float32Array(unpackedvgrid);
}

/*
    MeshCollection.prototype.box

    Create a box with vertices, normals and texCoords. Create VBOs for each as well as the index array.
    Return an object with the following properties:

    normalObject        WebGLBuffer object for normals
    texCoordObject      WebGLBuffer object for texCoords
    vertexObject        WebGLBuffer object for vertices
    indexObject         WebGLBuffer object for indices
    numIndices          The number of indices in the indexObject
*/
MeshCollection.prototype.box = function() {
    // box
    //    v6----- v5
    //   /|      /|
    //  v1------v0|
    //  | |     | |
    //  | |v7---|-|v4
    //  |/      |/
    //  v2------v3
    //
    // vertex coords array
    var vertices = new Float32Array(
        [  1, 1, 1,  -1, 1, 1,  -1,-1, 1,   1,-1, 1,    // v0-v1-v2-v3 front
           1, 1, 1,   1,-1, 1,   1,-1,-1,   1, 1,-1,    // v0-v3-v4-v5 right
           1, 1, 1,   1, 1,-1,  -1, 1,-1,  -1, 1, 1,    // v0-v5-v6-v1 top
          -1, 1, 1,  -1, 1,-1,  -1,-1,-1,  -1,-1, 1,    // v1-v6-v7-v2 left
          -1,-1,-1,   1,-1,-1,   1,-1, 1,  -1,-1, 1,    // v7-v4-v3-v2 bottom
           1,-1,-1,  -1,-1,-1,  -1, 1,-1,   1, 1,-1 ]   // v4-v7-v6-v5 back
    );

    // normal array
    var normals = new Float32Array(
        [  0, 0, 1,   0, 0, 1,   0, 0, 1,   0, 0, 1,     // v0-v1-v2-v3 front
           1, 0, 0,   1, 0, 0,   1, 0, 0,   1, 0, 0,     // v0-v3-v4-v5 right
           0, 1, 0,   0, 1, 0,   0, 1, 0,   0, 1, 0,     // v0-v5-v6-v1 top
          -1, 0, 0,  -1, 0, 0,  -1, 0, 0,  -1, 0, 0,     // v1-v6-v7-v2 left
           0,-1, 0,   0,-1, 0,   0,-1, 0,   0,-1, 0,     // v7-v4-v3-v2 bottom
           0, 0,-1,   0, 0,-1,   0, 0,-1,   0, 0,-1 ]    // v4-v7-v6-v5 back
       );


    // texCoord array
    var texCoords = new Float32Array(
        [  1, 1,   0, 1,   0, 0,   1, 0,    // v0-v1-v2-v3 front
           0, 1,   0, 0,   1, 0,   1, 1,    // v0-v3-v4-v5 right
           1, 0,   1, 1,   0, 1,   0, 0,    // v0-v5-v6-v1 top
           1, 1,   0, 1,   0, 0,   1, 0,    // v1-v6-v7-v2 left
           0, 0,   1, 0,   1, 1,   0, 1,    // v7-v4-v3-v2 bottom
           0, 0,   1, 0,   1, 1,   0, 1 ]   // v4-v7-v6-v5 back
       );

    // index array
    var indices = new Uint8Array(
        [  0, 1, 2,   0, 2, 3,    // front
           4, 5, 6,   4, 6, 7,    // right
           8, 9,10,   8,10,11,    // top
          12,13,14,  12,14,15,    // left
          16,17,18,  16,18,19,    // bottom
          20,21,22,  20,22,23 ]   // back
      );

    var retval = { };

    retval.normalObject = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, retval.normalObject);
    gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);

    retval.texCoordObject = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, retval.texCoordObject);
    gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);

    retval.vertexObject = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, retval.vertexObject);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    retval.indexObject = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, retval.indexObject);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

    retval.numIndices = indices.length;

    return retval;
}

/*
    MeshCollection.prototype.sphere

    Create a sphere with the passed number of latitude and longitude bands and the passed radius.
    Sphere has vertices, normals and texCoords. Create VBOs for each as well as the index array.
    Return an object with the following properties:

    normalObject        WebGLBuffer object for normals
    texCoordObject      WebGLBuffer object for texCoords
    vertexObject        WebGLBuffer object for vertices
    indexObject         WebGLBuffer object for indices
    numIndices          The number of indices in the indexObject
*/
MeshCollection.prototype.sphere = function(radius, lats, longs) {
    var geometryData = [ ];
    var normalData = [ ];
    var texCoordData = [ ];
    var indexData = [ ];

    for (var latNumber = 0; latNumber <= lats; ++latNumber) {
        for (var longNumber = 0; longNumber <= longs; ++longNumber) {
            var theta = latNumber * Math.PI / lats;
            var phi = longNumber * 2 * Math.PI / longs;
            var sinTheta = Math.sin(theta);
            var sinPhi = Math.sin(phi);
            var cosTheta = Math.cos(theta);
            var cosPhi = Math.cos(phi);

            var x = cosPhi * sinTheta;
            var y = cosTheta;
            var z = sinPhi * sinTheta;
            var u = 1-(longNumber/longs);
            var v = latNumber/lats;

            normalData.push(x);
            normalData.push(y);
            normalData.push(z);
            texCoordData.push(u);
            texCoordData.push(v);
            geometryData.push(radius * x);
            geometryData.push(radius * y);
            geometryData.push(radius * z);
        }
    }

    for (var latNumber = 0; latNumber < lats; ++latNumber) {
        for (var longNumber = 0; longNumber < longs; ++longNumber) {
            var first = (latNumber * (longs+1)) + longNumber;
            var second = first + longs + 1;
            indexData.push(first);
            indexData.push(second);
            indexData.push(first+1);

            indexData.push(second);
            indexData.push(second+1);
            indexData.push(first+1);
        }
    }

    var retval = { };

    retval.normalObject = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, retval.normalObject);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalData), gl.STATIC_DRAW);

    retval.texCoordObject = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, retval.texCoordObject);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoordData), gl.STATIC_DRAW);

    retval.vertexObject = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, retval.vertexObject);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(geometryData), gl.STATIC_DRAW);

    retval.numIndices = indexData.length;
    retval.indexObject = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, retval.indexObject);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexData), gl.STREAM_DRAW);

    return retval;
}