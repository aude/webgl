var canvas = document.getElementById('stage');

var gl     = canvas.getContext('webgl');
if (!gl) { document.body.innerHTML = 'WebGL is unsupported on your device :('; }

function createShader(gl, type, source) {
	var shader = gl.createShader(type);

	// set the source code of the shader
	gl.shaderSource(shader, source);
	// let's compile it :)
	gl.compileShader(shader);

	var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
	// if not successful, log it and delete our compiled shader
	if (!success) {
		console.log(gl.getShaderInfoLog(shader));
		gl.deleteShader(shader);
	}

	return shader;
}

var vertexShaderSource   = `
// attribute that will receive data from a buffer
attribute vec4 a_position;

// all shaders have a main function
void main() {
	// gl_Position is a special var
	// that a vertex shader is responsible for setting
	gl_Position = a_position;
}
`;

var fragmentShaderSource = `
// fragment shaders don't come with a default precision,
// so we need to set one. let's go for mediump (medium precision)
precision mediump float;

void main() {
	// gl_FragColor is a special variable
	// that a fragment shader is responsible for setting
	gl_FragColor = vec4(0.02, 1, 0.894, 1); // rgba
}
`

var vertexShader         = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
var fragmentShader       = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

function createProgram(gl, vertexShader, fragmentShader) {
	// create a WebGL program object
	var program = gl.createProgram();

	// attach the shaders
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);

	// link them!
	gl.linkProgram(program);

	var success = gl.getProgramParameter(program, gl.LINK_STATUS);
	// if not successful, log it and delete our created program
	if (!success) {
		console.log(gl.getProgramInfoLog(program));
	}

	return program;
}

var program = createProgram(gl, vertexShader, fragmentShader);

// okay, done bootstrapping
// now, let's actually do something :D

// get the position of the position attribute
var positionAttributeLocation = gl.getAttribLocation(program, 'a_position');

// remember, attributes get data from buffers
// so create a buffer for the position attribute
var positionBuffer = gl.createBuffer();

// we can actually make "global variables" inside the WebGL context
// it's called binding
// so let's bind the position buffer (as an array buffer?)
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

// now we're ready to put data in it
// we'll put three 2d points in there
var positions = [
	// this could mean that the buffer only supports 1d arrays
	-0.7, 0.7,
	-0.7, -0.5,
	0.5, -0.5,
];
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

// now that there's data in the buffer, let's tell the array how to get it
// firstly, enable the attribute
gl.enableVertexAttribArray(positionAttributeLocation);

// now describe how to retrieve data
var size = 2;		// 2 components per iteration
var type = gl.FLOAT;	// data is 32bit floats
var normalize = false;	// don't normalize the data
var stride = 0;		// start at 0
var offset = 0;		// start at the beginning of the buffer
gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);
// using vertexAttribPointer() has the side effect of binding
// the current ARRAY_BUFFER to the buffer of the first argument,
// which means that 'a_position' will now be bound to positionBuffer

// clear the canvas
gl.clearColor(0, 0, 0, 0); // transparent
gl.clear(gl.COLOR_BUFFER_BIT);

// set which shader program to run
gl.useProgram(program);

// we need to set the canvas width and height to match the actual size
function resize(canvas, gl) {
	// actual size is viewport, set through CSS
	var displayWidth  = canvas.clientWidth;
	var displayHeight = canvas.clientHeight;

	canvas.width  = displayWidth;
	canvas.height = displayHeight;

	gl.viewport(0, 0, displayWidth, displayHeight);
}

// set resolution
resize(canvas, gl);

// finally, run it! \(^-^)/
var primitiveType = gl.TRIANGLES; // but why?
var offset = 0; // start at the beginning
var count = 3; // render 3 points
gl.drawArrays(primitiveType, offset, count);
