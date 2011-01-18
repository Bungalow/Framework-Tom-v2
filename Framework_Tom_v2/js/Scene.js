/*
    Scene.js
    
    Scene class is responsable for creating a new scene in WebGL
    context and dealing with all low-level WebGL commands.
    
    The object needs to be initialized once the document is loaded.
*/
var meshes = [];
Scene = function(canvas_id, framerate_id, meshes_array_passed, textures, zoom)
{
    this.canvas_id = canvas_id;
    this.framerate_id = framerate_id;
    this.meshes_array = meshes_array_passed;
    meshes_array = meshes_array_passed;
    this.textures = textures;
    this.zoom = zoom;
    this.width = -1;
    this.height = -1;
    this.x_rot = 0;
    this.y_rot = 0;
    this.z_rot = 0;
    this.timer;
    this.scene;
    this.meshes = [];
    this.create();
}

Scene.prototype.create = function() {
    canvasObject = $('#'+this.canvas_id).get(0);
    canvasObject.width = $(canvasObject).width();
    canvasObject.height = $(canvasObject).height();
    
    gl = this.initWebGL(
        canvasObject.id,
        // The ids of the vertex and fragment shaders
        "vshader", "fshader", 
        // The vertex attribute names used by the shaders.
        // The order they appear here corresponds to their index
        // used later.
        [ "vNormal", "vColor", "vPosition"], //vColor => vTexCoord
        // The clear color and depth values
        [ 0, 0, 0, .4 ], 10000); // floats
    
    var this_textures = this.textures;
    for(texture in this_textures) {
        window[texture] = eval("this.loadImageTexture(\""+this_textures[texture]+"\")");
    }
    
    gl.uniform3f(gl.getUniformLocation(gl.program, "lightDir"), 1, 1, 1);
    gl.uniform1i(gl.getUniformLocation(gl.program, "sampler2d"), 0);
    gl.uniform1f(gl.getUniformLocation(gl.program, "uAlpha"),.5);
    // initialize major objects for a collection of meshes,
    // framerate calculator, and camera
    meshCollection = new MeshCollection();
    framerate = new Framerate(this.framerate_id);
    camera = new Camera();
    
    // add standard meshes
    gl.grid = meshCollection.grid(nRows);
        
    // go through all meshes and load them
    var meshes_array_length = meshes_array.length;
    for (var i = 0; i < meshes_array_length; i++) {
        meshes[i] = eval('new Mesh('+meshes_array[i]+')');
    }
    
    this.timer = setInterval(this.drawPicture, 10);
}

Scene.prototype.drawPicture = function() {
    scene.time = new Date().getTime();

    canvasObject.width = $(canvasObject).width();
    canvasObject.height = $(canvasObject).height();
    // make sure the canvas is sized correctly.
    scene.reshape(45); // angle as a parameter
    
    // rotate the scene based on x_rot and y_rot variables that change with user input
    gl.perspectiveMatrix.rotate(0, scene.y_rot / 50, 0);
    
    // clear the canvas
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    var meshes_length = meshes.length;
    for(var i = 0; i < meshes_length; i++) {
        meshes[i].redraw();
    }

    // finish up.
    gl.flush();

    // show the framerate
    framerate.snapshot();
}

Scene.prototype.reshape = function(angle) {
    if (canvasObject.width == scene.width && canvasObject.height == scene.height)
        return;

    scene.width = canvasObject.width;
    scene.height = canvasObject.height;

    // Set the viewport and projection matrix for the scene
    gl.viewport(0, 0, scene.width, scene.height);
    gl.perspectiveMatrix = new J3DIMatrix4();
    gl.perspectiveMatrix.perspective(angle, scene.width/scene.height, 0.1, 10000);
    gl.perspectiveMatrix.lookat(0, 0, scene.zoom, 0, 0, 0, 0, 1, 0);
    gl.perspectiveMatrix.rotate(30, 1,0,0);
    gl.perspectiveMatrix.rotate(-30, 0,1,0);
}

Scene.prototype.initWebGL = function(canvasName, vshader, fshader, attribs, clearColor, clearDepth) {
    var canvas = $('#'+canvasName).get(0);
    var gl = canvas.getContext("experimental-webgl");
    if (!gl) {
        alert("No WebGL context found");
        return null;
    }

    // Add a console
    gl.console = ("console" in window) ? window.console : { log: function() { } };

    // create our shaders
    var vertexShader = this.loadShader(gl, vshader);
    var fragmentShader = this.loadShader(gl, fshader);

    if (!vertexShader || !fragmentShader)
        return null;

    // Create the program object
    gl.program = gl.createProgram();

    if (!gl.program)
        return null;

    // Attach our two shaders to the program
    gl.attachShader (gl.program, vertexShader);
    gl.attachShader (gl.program, fragmentShader);

    // Bind attributes
    for (var i in attribs)
        gl.bindAttribLocation (gl.program, i, attribs[i]);

    // Link the program
    gl.linkProgram(gl.program);

    // Check the link status
    var linked = gl.getProgramParameter(gl.program, gl.LINK_STATUS);
    if (!linked) {
        // something went wrong with the link
        var error = gl.getProgramInfoLog (gl.program);
        gl.console.log("Error in program linking:"+error);

        gl.deleteProgram(gl.program);
        gl.deleteProgram(fragmentShader);
        gl.deleteProgram(vertexShader);

        return null;
    }

    gl.useProgram(gl.program);

    gl.clearColor(clearColor[0], clearColor[1], clearColor[2], clearColor[3]);
    gl.clearDepth(clearDepth);

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.BLEND);
    return gl;
}

Scene.prototype.loadShader = function(gl, shader_id)
{
    var shaderScript = document.getElementById(shader_id);
    if (!shaderScript) {
        gl.console.log("*** Error: shader script '"+shader_id+"' not found");
        return null;
    }

    if (shaderScript.type == "x-shader/x-vertex")
        var shaderType = gl.VERTEX_SHADER;
    else if (shaderScript.type == "x-shader/x-fragment")
        var shaderType = gl.FRAGMENT_SHADER;
    else {
        gl.console.log("*** Error: shader script '"+shader_id+"' of undefined type '"+shaderScript.type+"'");
        return null;
    }

    // Create the shader object
    var shader = gl.createShader(shaderType);
    if (shader == null) {
        gl.console.log("*** Error: unable to create shader '"+shader_id+"'");
        return null;
    }

    // Load the shader source
    gl.shaderSource(shader, shaderScript.text);

    // Compile the shader
    gl.compileShader(shader);

    // Check the compile status
    var compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!compiled) {
        // Something went wrong during compilation; get the error
        var error = gl.getShaderInfoLog(shader);
        gl.console.log("*** Error compiling shader '"+shader_id+"':"+error);
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}

Scene.prototype.loadImageTexture = function(url)
{
    var texture = gl.createTexture();
    texture.image = new Image();
    texture.image.onload = function() { 
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        //gl.generateMipmap(gl.TEXTURE_2D)
        gl.bindTexture(gl.TEXTURE_2D, null);
    };
    texture.image.src = url;
    return texture;
}