/*
    Mesh.js
    
    Mesh class is responsable for initialization of a new 3D object with
    properties specified by the user.
    
    The object needs to be initialized in the main init function.
*/
Mesh = function(object, angle, x, y, z, scale, texture, type)
{
    this.object = object; // type of the object that gets rendered
    this.angle = angle; // angle
    this.x = x; // x coordinate
    this.y = y; // y coordinate
    this.z = z; // z coordinate
    this.scale = scale;  // size of the object
    this.texture = texture; // texture aoolied to the object
    this.type = type; // specifies the type of the values in indices;
                      // must be one of UNSIGNED_BYTE, UNSIGNED_SHORT, or UNSIGNED_INT

    // create some matrices to use later and save their locations in the shaders
    this.mvMatrix = new J3DIMatrix4();
    this.normalMatrix = new J3DIMatrix4(this.mvMatrix); // the normal matrix from the model-view matrix
    this.mvpMatrix = new J3DIMatrix4(gl.perspectiveMatrix); // model-view * projection matrix
    
    this.create(); // create the mesh object in the active gl context
}

Mesh.prototype.create = function() {
    // enable all of the vertex attribute arrays
    gl.enableVertexAttribArray(0);
    gl.enableVertexAttribArray(1);
    gl.enableVertexAttribArray(2);

    // set up all the vertex attributes for vertices, normals and texCoords
    gl.bindBuffer(gl.ARRAY_BUFFER, eval("gl."+this.object+".vertexObject"));
    gl.vertexAttribPointer(2, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, eval("gl."+this.object+".normalObject"));
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, eval("gl."+this.object+".texCoordObject"));
    gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 0, 0);

    // bind the index array
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, eval("gl."+this.object+".indexObject"));
    
    this.mvMatrix.translate(this.x, this.y, this.z);
    this.mvMatrix.scale(this.scale, this.scale, this.scale);
    this.mvMatrix.rotate(0, 0, 0, 0);
    this.normalMatrix.invert();
    this.normalMatrix.transpose();
    this.normalMatrix.setUniform(gl, gl.getUniformLocation(gl.program, "u_normalMatrix"), false);
    
    this.mvpMatrix.multiply(this.mvMatrix);
    this.mvpMatrix.setUniform(gl, gl.getUniformLocation(gl.program, "u_modelViewProjMatrix"), false);

    // bind the texture
    gl.bindTexture(gl.TEXTURE_2D, this.texture);

    // draw the object on the scene
    this.draw();
}

Mesh.prototype.redraw = function() {
    // model-view * projection matrix
    this.mvpMatrix = new J3DIMatrix4(gl.perspectiveMatrix);

    // set up all the vertex attributes for vertices, normals and texCoords
    gl.bindBuffer(gl.ARRAY_BUFFER, eval("gl."+this.object+".vertexObject"));
    gl.vertexAttribPointer(2, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, eval("gl."+this.object+".normalObject"));
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, eval("gl."+this.object+".texCoordObject"));
    gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 0, 0);

    // bind the index array
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, eval("gl."+this.object+".indexObject"));

    this.normalMatrix.setUniform(gl, gl.getUniformLocation(gl.program, "u_normalMatrix"), false);
    
    this.mvpMatrix.multiply(this.mvMatrix);
    this.mvpMatrix.setUniform(gl, gl.getUniformLocation(gl.program, "u_modelViewProjMatrix"), false);

    // bind the texture
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    
    // draw the object on the scene
    this.draw();
}

Mesh.prototype.draw = function() {
    gl.drawElements(gl.TRIANGLES, eval("gl."+this.object+".numIndices"), eval("gl."+this.type), 0);
}