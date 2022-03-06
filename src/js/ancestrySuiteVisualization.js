import * as d3 from "d3";
import * as THREE from 'three';

import {getProject} from "@theatre/core"
import studio from "@theatre/studio"





export async function loadData(){

  console.log("loaded")
// initialize the studio so the editing tools will show up on the screen
studio.initialize()

// create a project
const proj = getProject(
  // the ID of the project is "My first project"
  "First project"
)

// create a sheet
const sheet = proj.sheet(
  // Our sheet is identified as "Scene"
  "Scene"
)
// create an object
const obj = sheet.object(
  // The object's key is "Fist object"
  "First object",
  // These are the object's default values (and as we'll later learn, its props types)
  {
    // we pick our first props's name to be "foo". It's default value is 0.
    // Theatre will determine that the type of this prop is a number
    foo: 0,
    // Second prop is a boolean called "bar", and it defaults to true.
    bar: true,
    // Last prop is a string
    baz: "A string",
  }
)
// Calls the callback every time the values change
const unsubscribe = obj.onValuesChange(function callback(newValue) {
  console.log(newValue.foo) // prints a number
  console.log(newValue.bar) // prints a boolean
  console.log(newValue.baz) // prints a string
})

// stop listening to changes after 5 seconds:
setTimeout(unsubscribe, 5000)


//   renderPolygons()
// renderSquares()

}


class CustomSinCurve extends THREE.Curve {

	constructor( scale = 1 ) {

		super();

		this.scale = scale;

	}

	getPoint( t, optionalTarget = new THREE.Vector3() ) {

		const tx = t * 3 - 1.5;
		const ty = Math.sin( 2 * Math.PI * t );
		const tz = 0;

		return optionalTarget.set( tx, ty, tz ).multiplyScalar( this.scale );

	}

}

//const path = new CustomSinCurve( 10 );


function renderPolygons(){
  function render(){
    //Get window size
  var ww = window.innerWidth,
  wh = window.innerHeight;

//Create a WebGL renderer
var renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector("canvas")
});
renderer.setSize(ww, wh);

//Create an empty scene
var scene = new THREE.Scene();

//Create a perpsective camera
var camera = new THREE.PerspectiveCamera(45, ww / wh, 0.001, 1000);
camera.position.z = 400;

//Array of points
var points = [
  [68.5,185.5],
  [1,262.5],
  [270.9,281.9],
  [345.5,212.8],
  [178,155.7],
  [240.3,72.3],
  [153.4,0.6],
  [52.6,53.3],
  [68.5,185.5]
];

//Convert the array of points into vertices
for (var i = 0; i < points.length; i++) {
  var x = points[i][0];
  var y = 0;
  var z = points[i][1];
  points[i] = new THREE.Vector3(x, y, z);
}
//Create a path from the points
var path = new THREE.CatmullRomCurve3(points);

//Create the tube geometry from the path
var geometry = new THREE.TubeGeometry( path, 200, 7, 100, true );
let h = 50, s = 80, l = 20;
let color = new THREE.Color(`hsl(${h}, ${s}%, ${l}%)`);

//Basic material
var material = new THREE.MeshBasicMaterial( { color: color, side : THREE.BackSide, wireframe:true } );

//Create a mesh
var tube = new THREE.Mesh( geometry, material );
//Add tube into the scene
scene.add( tube );


var percentage = 0;
function render(){

  percentage += 0.0002;
  h +=.01;
  var p1 = path.getPointAt(percentage%1);
  var p2 = path.getPointAt((percentage + 0.01)%1);
  camera.position.set(p1.x,p1.y,p1.z);
  camera.lookAt(p2);
  
  //Render the scene
  renderer.render(scene, camera);

// requestAnimationFrame(render);
}
requestAnimationFrame(render);

}
  render()
}


function renderSquares(){
//Get window size
var ww = window.innerWidth,
  wh = window.innerHeight;

//Create a WebGL renderer
var renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector("canvas")
});
renderer.setSize(ww, wh);

//Create an empty scene
var scene = new THREE.Scene();
// scene.fog = new THREE.Fog(0x000000, 30, 150);
scene.fog = new THREE.Fog(0x000000, 30, 150);

//Create a perpsective camera
var camera = new THREE.PerspectiveCamera(45, ww / wh, 0.1, 150);
camera.position.y = 400;
camera.position.z = 400;

//Array of points
var points = [
  [68.5, 185.5],
  [1, 262.5],
  [270.9, 281.9],
  [345.5, 212.8],
  [178, 155.7],
  [240.3, 72.3],
  [153.4, 0.6],
  [52.6, 53.3],
  [68.5, 185.5]
];

//Convert the array of points into vertices
for (var i = 0; i < points.length; i++) {
  var x = points[i][0];
  var y = Math.random() * 100;
  var z = points[i][1];
  points[i] = new THREE.Vector3(x, y, z);
}
//Create a path from the points
var path = new THREE.CatmullRomCurve3(points);
path.closed = true;

// Define the precision of the finale tube, the amount of divisions
// var tubeDetail = 500;
var tubeDetail = 500;
// Define the precision of the circles
// var circlesDetail = 10;
var circlesDetail = 50;

// Define the radius of the finale tube
var radius = 8;
// Get all the circles that will compose the tube
var frames = path.computeFrenetFrames(tubeDetail, true);

// Create an empty Geometry where we will put the particles
var geometry = new THREE.BufferGeometry();

// Define a basic color
var color = new THREE.Color(0x000000);
//var color = new THREE.Color( 'skyblue' );

// Seed the perlin noise function with a random value
noise.seed(Math.random());

var cube = new THREE.BoxBufferGeometry(4, 4, 4);
var mat = new THREE.MeshBasicMaterial({color:0xffffff});
var cubeMesh = new THREE.Mesh(cube, mat);
var container = new THREE.Object3D();
scene.add(container);

// First loop through all the circles
for (var i = 0; i < tubeDetail; i++) {
  // Get the normal values for each circle
  var normal = frames.normals[i];
  // Get the binormal values
  var binormal = frames.binormals[i];

  // Calculate the index of the circle (from 0 to 1)
  var index = i / tubeDetail;
  // Get the coordinates of the point in the center of the circle
  var p = path.getPointAt(index);

  // Loop for the amount of particles we want along each circle
  for (var j = 0; j < circlesDetail; j++) {
    // Clone the position of the point in the center
    var position = p.clone();
    // Calculate the angle for each particle along the circle (from 0 to Pi*2)
    var angle = (j / circlesDetail) * Math.PI * 2;
    // Calculate the sine of the angle
    var sin = Math.sin(angle);
    // Calculate the cosine from the angle
    var cos = -Math.cos(angle);

    // Calculate the normal of each point based on its angle
    var normalPoint = new THREE.Vector3(0, 0, 0);
    normalPoint.x = (cos * normal.x + sin * binormal.x);
    normalPoint.y = (cos * normal.y + sin * binormal.y);
    normalPoint.z = (cos * normal.z + sin * binormal.z);
    // Multiple the normal by the radius
    var tempRadius = (Math.random() * 0.2 + 0.8) * radius;
    normalPoint.multiplyScalar(tempRadius);

    // We add the normal values for each point
    position.add(normalPoint);
    //var perlin = Math.abs(noise.simplex3(position.x*0.008, position.y*0.01, position.z*0.005));
    var perlin = Math.abs(position.z*0.005);
   // var perlin = Math.abs(position.x*0.008, position.y*0.01, position.z*0.005);

    //  var color = new THREE.Color("hsl(" + (perlin * 360) + ", 50%, 50%)");


    //var color = new THREE.Color(`hsl(${(.1)}, ${Math.floor(perlin*100)}%, ${perlinLight}%)`);

    var color = new THREE.Color(`hsl(1, 50%, ${1 + Math.floor((perlin*30))}%)`);

   // var color = new THREE.Color(`hsl(${perlin * 360},${perlin * 360}, ${perlin * 360})`);
    
    var mesh = cubeMesh.clone(false);
    mesh.position.set(position.x, position.y, position.z);
    mesh.material = cubeMesh.material.clone(false)
    mesh.material.color = color;
    mesh.rotation.x = Math.random() * Math.PI * 2;
    mesh.rotation.y = Math.random() * Math.PI * 2;
    mesh.rotation.z = Math.random() * Math.PI * 2;
    container.add(mesh);
  }
}

var percentage = 0;

function render() {

  percentage += 0.0005;
  var p1 = path.getPointAt(percentage % 1);
  var p2 = path.getPointAt((percentage + 0.01) % 1);
  camera.position.set(p1.x, p1.y, p1.z);
  camera.lookAt(p2);

  //Render the scene
  renderer.render(scene, camera);

  requestAnimationFrame(render);
}
requestAnimationFrame(render);
}
