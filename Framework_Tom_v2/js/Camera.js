/*
    Camera.js
    
    Camera class is responsable for initialization of a new camera that
    captures user mouse input and changes y_rot and x_rot variables
    that are responsable for the global perspective matrix.
    
    The object gets initialized in the scene class.
*/
Camera = function()
{
    this.x_offs = 0;
    this.y_offs = 0;
    drag = 0;
    
    // once action mouse button is clicked dragging state gets triggered
    canvasObject.onmousedown = function ( ev ){
        drag = 1;
        this.x_offs = ev.clientX;
        this.y_offs = ev.clientY;
    }
    
    // once action mouse button is up dragging stops
    canvasObject.onmouseup = function ( ev ){
        drag = 0;
        this.x_offs = ev.clientX;
        this.y_offs = ev.clientY;
        scene.x_rot = scene.y_rot = 0;
    }
    
    // if dragging is active and the mouse is moving y_rot and x_rot
    // are getting changed; if shift key is pressed zoom logic gets
    // executed
    canvasObject.onmousemove = function ( ev ) {
        if(drag == 0) return;
        if(ev.shiftKey) {
            scene.zoom += (ev.clientY - ($(window).height() / 2)) / 30;
            if(scene.zoom >= 0) {
                // reinitialize the perspective matrix with new parameters to zoom in/out
                gl.perspectiveMatrix = new J3DIMatrix4();
                gl.perspectiveMatrix.perspective(45, scene.width/scene.height, 0.1, 10000);
                gl.perspectiveMatrix.lookat(0, 0, scene.zoom, 0, 0, 0, 0, 1, 0);
                gl.perspectiveMatrix.rotate(30, 1,0,0);
                gl.perspectiveMatrix.rotate(-30, 0,1,0);
            } else {
                scene.zoom = 0;
            }
         } else {
            scene.y_rot = - this.x_offs + ev.clientX;
            scene.x_rot = - this.y_offs + ev.clientY;
        }
    }
}