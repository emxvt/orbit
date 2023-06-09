// Canvas Div
var screen = document.createElement("div");
screen.id = "screen"; screen.class = "screen";
document.body.appendChild(screen);

// Background canvas (for trails, does not clear)
var bc = document.createElement("canvas");
// Main canvas (for planets, clears every frame)
var c = document.createElement("canvas");
//Add both to div
screen.appendChild(bc);
screen.appendChild(c);


// Gravitational Constant
var g = 0.000000000066743;

// Where to center camera
var camX = 0;
var camY = 0;

// Where to paint on screen as to be centered
var adjX = 0;
var adjY = 0;

// Array of all bodies in the system
var bodies = [];

// Canvas Context Object
var ctx = c.getContext("2d");
var bctx = bc.getContext("2d");

// Make canvas full screen
c.width = window.innerWidth;
c.height = window.innerHeight;
bc.width = window.innerWidth;
bc.height = window.innerHeight;

// FPS
var framerate = 60;

// The simulation will run at this many times faster
var timeMultiplier = 1;

// Seconds to elapse Per Frame (for orbital calculation)


// Amount to zoom out
var zoom = 2000000;

// Amount to adjust by
var zoomMultiplier = 1/zoom;

//Allow scrolling to zoom in
window.addEventListener('wheel', function(event)
    {
        var scrollSens = 1.1;
        //Clear both background layer and main layer
        ctx.clearRect(0,0, c.width, c.height);
        bctx.clearRect(0,0, c.width, c.height);

        //Scroll up
        if (event.deltaY < 0)
        {
            zoom = zoom / scrollSens
            zoomMultiplier = 1/zoom;
        }
        //Scroll Down
        else if (event.deltaY > 0)
        {
            zoom = zoom * scrollSens
            zoomMultiplier = 1/zoom;
        }
    });

// Why the fuck is js this way
function makeBody(id, radius, posX, posY, speedX, speedY, mass, colour) {
    return {
        id: id,
        radius: radius,
        posX: posX,
        posY: posY,
        speedX: speedX,
        speedY: speedY,
        mass: mass,
        colour: colour,
        lastPosX: posX,
        lastPosY: posY,
        static: false
    };
}

// Return an object so i can take scientific data from google easier
function sciNotation(m, x) {
    return m * (10**x);
}

//Test bodies


// zoom = 2000000;
// bodies.push(makeBody("Center", 0, 0, 0, 0, 0, 0, "#ffffff"));
// bodies.push(makeBody("Yellow", 5, 0, 100000000, 3, -2, sciNotation(1,21), "#ffc400"));
// bodies.push(makeBody("Blue", 5, -100000000, -100000000, -4, 5, sciNotation(1,20), "#513dff"));
// bodies.push(makeBody("Pink", 5, 100000000, -100000000, 10, 10, sciNotation(2,21), "#f700ff"));
// bodies.push(makeBody("Red", 5, -10000000, 600000000, 15, 0, sciNotation(1,20), "#f70000"));
// bodies.push(makeBody("Green", 5, 500000000, -500000000, 0, 0, sciNotation(1,21), "#009955"));
// bodies.push(makeBody("Purple", 5, -10000000, -500000000, -10, 1, sciNotation(5,21), "#550055"));
// bodies.push(makeBody("Black", 5, -800000000, 500000000, -1, 1, sciNotation(1,21), "#000000"));
// bodies.push(makeBody("Grey", 5, -700000000, 600000000, 10, -10, sciNotation(1,21), "#888888"));

zoom = 2000000000;

bodies.push(makeBody("Center", 0, 0, 0, 0, 0, 0, "#ffffff"));
bodies.push(makeBody("Sun", 6, 1, 0100000, 0, 0, sciNotation(1.989,30), "#ffc400"));
bodies.push(makeBody("Mercury", 3, 58000000000, 0, 0, 47400, sciNotation(3.285,23), "#a1a1a1"));
bodies.push(makeBody("Venus", 4, 108030000000, 0, 0, 35000, sciNotation(4.867,24), "#d68006"));
bodies.push(makeBody("Earth", 4, 149000000000, 0, 0, 29800, sciNotation(5.97,24), "#0022cf"));
bodies.push(makeBody("Mars", 3, 228000000000, 0, 0, 24100, sciNotation(6.42,23), "#ffae78"));
bodies.push(makeBody("Jupiter", 5, 778500000000, 0, 0, 13100, sciNotation(1898,24), "#ff771c"));
bodies.push(makeBody("Saturn", 5, 1432000000000, 0, 0, 9700, sciNotation(568,24), "#edd86d"));
bodies.push(makeBody("Uranus", 4, 2867000000000, 0, 0, 6800, sciNotation(86.8,24), "#b3f0fc"));
bodies.push(makeBody("Neptune", 4, 4515000000000, 0, 0, 5400, sciNotation(102,24), "#5094fa"));

// Where the camera will center
bodies[0].static = true;
var referenceBody = bodies[0];


//Update Physics
function update() {
    // Make things centered
    adjX = window.innerWidth / 2;
    adjY = window.innerHeight / 2;
    updateBodies();
}

function updateBodies() {
    // Calculate the gravitational force vector for each combination of bodies
    for (let i = 0; i < bodies.length; i++) {
        for (let j = 0; j < bodies.length; j++) {
            if (j != i && bodies[i].static != true) {
                console.log(i + " " + j)
                orbit(bodies[i], bodies[j]);
            }
        }
    }

    // Apply the velocity for the desired amount of time
    for(let i = 0; i < bodies.length; i++) {
        var temp = bodies[i];
        temp.posX += (temp.speedX * timeMultiplier);
        temp.posY += (temp.speedY * timeMultiplier);

    }
}

// Camera position variables only used in this function
var lastCamX = camX;
var lastCamY = camY;
/*
    Drawing Method
*/
function updateScreen() {
    //Update camera based on reference point
    camX = referenceBody.posX;
    camY = referenceBody.posY;
    //Clear Screen
    ctx.clearRect(0,0, c.width, c.height);

    for(let i = 0; i < bodies.length; i++) {
        // Current object
        var temp = bodies[i];
        // Needed for every object
        ctx.beginPath();
        // X, Y, Radius, Start (radians), End (radians)
        // Takes into account the zoom and the cameras current position
        ctx.arc(((temp.posX - camX) * zoomMultiplier) + adjX, ((temp.posY - camY) * zoomMultiplier) + adjY, temp.radius, 0, 2 * Math.PI);
        // Make it solid
        ctx.fillStyle = temp.colour;
        // Apply to canvas
        ctx.fill();
        ctx.stroke();

        // Needed for every line
        bctx.beginPath();
        // Start line at the previous position taking into account the position of the previous camera
        bctx.moveTo(((temp.lastPosX - lastCamX) * zoomMultiplier) + adjX, ((temp.lastPosY - lastCamY) * zoomMultiplier) + adjY);
        // Bring line to the current position taking into account the current camera position
        bctx.lineTo(((temp.posX - camX) * zoomMultiplier) + adjX, ((temp.posY - camY) * zoomMultiplier) + adjY);
        // Canvas
        bctx.strokeStyle = temp.colour;
        bctx.stroke();

        //Remember current position for next time
        temp.lastPosX = temp.posX;
        temp.lastPosY = temp.posY;
    }

    //Remember current camera position for next time
    lastCamX = camX;
    lastCamY = camY;
}

/*
    Given 2 bodies (b1 and b2) this function
    - Calculates the gravitational force between the 2 bodies
    - Calculates the velocity vectors of this force upon b1
    - Applies this velocity to speedX and speedY of b1
*/
function orbit(b1, b2) {
    // https://en.wikipedia.org/wiki/Orbit_modeling Newton Approach
    var f = (g * b1.mass * b2.mass) / (distanceBetweenBodies(b1,b2)**2);
    // Vectors :(
    // F = magnitude
    // Find the distance between b1 and b2
    b1x = b1.posX - b2.posX;
    b1y = b1.posY - b2.posY;
    // cos theta = (X / Magnitude of b1)
    // Angle between 2 vectors where one of the vectors is b1 and the other is the x axis vector
    cosAngle = (b1x) / (Math.sqrt((b1x**2) + (b1y**2)));
    // Find theta using arccos
    angle = Math.acos(cosAngle);

    // JS will only give you the angle up to PI where i want up to 2PI
    if (b1.posY > b2.posY) {
        angle = (2 * Math.PI) - angle;
    }

    // Find the X and Y vectors of the gravitational force
    dx = Math.abs(Math.cos(angle)) * f;
    dy = Math.abs(Math.sin(angle)) * f;

    // V = F/(M * t)
    // Find velocity given force
    vx1 = (dx / (b1.mass * 1)) * timeMultiplier;
    vy1 = (dy / (b1.mass * 1)) * timeMultiplier;

    // Apply appropriate signs as only magnitude was known
    if(angle > (Math.PI) * 3/2) {
        // Bottom Right
        vx1 *= -1; vy1 *= -1;
    } else if(angle > (Math.PI)) {
        //Bottom Left
        vy1 *= -1;
    } else if(angle > (Math.PI) * 1/2) {
        //Top Left (No correction needed)
    } else {
        //Top Right
        vx1 *= -1;
    }

    // Apply gravitational difference to the speed of the body
    b1.speedX += vx1;
    b1.speedY += vy1;
}

// Makes using distance() easier
function distanceBetweenBodies(b1, b2) {
    return distance(b1.posX, b1.posY, b2.posX, b2.posY);
}

// Standard distance formula
function distance(x1,y1,x2,y2) {
    return Math.sqrt(((x2-x1)**2) +((y2-y1)**2));
}

// Loop variables
// How often the physics should be calculated
var timestep = 1000/framerate;
// When was the last frame
var lastFrameTimeMs = 0;
// Distance from last frame to when next frame will be
var delta = 0;
function mainLoop(timestamp) {

    //Figure out when the next frame is needed
    delta += timestamp - lastFrameTimeMs;
    //Save this for next time
    lastFrameTimeMs = timestamp;

    // Do physics until next frame is needed
    while (delta >= timestep) {
        update();
        delta -= timestep;
    }
    //Draw screen exactly once
    updateScreen();

    // Locks this to framerate very easily (thanks js <3)
    requestAnimationFrame(mainLoop);
    
}

// Starts Program
requestAnimationFrame(mainLoop);