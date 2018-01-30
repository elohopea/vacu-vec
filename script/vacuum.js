/*
    This game is part of Aalto Web software development course.
    It is based on an example game presented on the course and on
    W3C HTML game example from: https://www.w3schools.com/graphics/game_intro.asp
*/


// Environment parameters
var windowWidth = 700;
var windowHeight = 800;

// Game variables
var robotVacuum = new component(25, 25, "grey", 225, 225, "player");
var dustParticles = [];
var floorRugs = [];
var obstacles = [];
var gameOver = false;
var points = 0;


// This is the game world for objects to roam.
// It is started when game starts and stopped when game ends.
var gameWorld = {
    canvas : document.createElement("canvas"),
    start : function() {
        launchTimerStop();
        gameOver = false;
        this.canvas.width = windowWidth;
        this.canvas.height = windowHeight - 400;
        this.context = this.canvas.getContext("2d");
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
        this.frameNo = 0;
        this.intervalPlayer = setInterval(updateGameArea, 10);
        this.intervalDust = setInterval(randomlyAddDust, 100);
        this.intervalRug = setInterval(randomlyAddRug, 2000);
        this.intervalObstacle = setInterval(randomlyAddObstacle, 6000);
    },
    stop : function() {
        gameOver = true;
        clearInterval(this.intervalPlayer);
        clearInterval(this.intervalDust);
        clearInterval(this.intervalRug);
        clearInterval(this.intervalObstacle);

        drawMessage("Game over", windowWidth/2-150, windowHeight/2-200);
        gameOver = true;
        launchTimerStop();
    },
    clear : function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

// Every element in the game is a component.
function component(width, height, color, x, y, type) {
    this.type = type;
    this.width = width;
    this.height = height;
    this.speed = 0;
    this.angle = 0;
    this.moveAngle = 0;
    this.x = x;
    this.y = y;
    this.color = color;
    this.sucking = false;
}

// Objects are cleared from canvas and the redrawing is done by this update function.
function updateObject(object) {
    var ctx = gameWorld.context;
    ctx.save();
    ctx.translate(object.x, object.y);
    ctx.rotate(object.angle);
    ctx.fillStyle = object.color;
    ctx.fillRect(object.width / -2, object.height / -2, object.width, object.height);
    ctx.restore();
}

// This calculates the objects new position according to objects variable values
// moving objects are not allowed to go outside of the world or canvas.
function newPos(object) {
    object.angle += object.moveAngle * Math.PI / 180;

    var xCandidate = object.x + object.speed * Math.sin(object.angle)
    var yCandidate = object.y - object.speed * Math.cos(object.angle);

    if (xCandidate >= 0 && xCandidate < windowWidth ) {
        object.x = xCandidate;
    }
    if (yCandidate >= 0 && yCandidate < windowHeight - windowHeight/2) {
        object.y = yCandidate;
    }
}

// This function checks if two objects (object and that) are in the same place
// on the canvas and returns true or false.
function collisionWith(object, that) {
    var myleft = object.x;
    var myright = object.x + (object.width);
    var mytop = object.y;
    var mybottom = object.y + (object.height);
    var otherleft = that.x;
    var otherright = that.x + (that.width);
    var othertop = that.y;
    var otherbottom = that.y + (that.height);
    var collision = true;
    if ((mybottom < othertop) ||
           (mytop > otherbottom) ||
           (myright < otherleft) ||
           (myleft > otherright)) {
       collision = false;
    }
    return collision;
}


/*
    Loop through all the objects in the world and
    check if the player collides with any ot them.
    Collision with:
    dust -> remove dust & add point
    rug & if suction on -> game over
    obstacle -> game over.
*/
function collisionWithPlayer(objects){
    var object;
    for (var i = 0; i < objects.length; i++) {
        object = objects[i]
        var collides = collisionWith(robotVacuum, object);
        if (collides){
            if (object.type=="obstacle") {
                gameOver = true;
                gameWorld.stop();
            }else if (robotVacuum.sucking){
                if(object.type=="rug"){
                    gameOver = true;
                    gameWorld.stop();
                    launchTimerStop();
                }else if(object.type=="dust"){
                    dustParticles.splice(i, 1);
                    points = points +1;
                }
            }
        }
    }
};

// loop through objects and call update.
function updateObjects(objects){
    for (var i = 0; i < objects.length; i++) {
        updateObject(objects[i]);
    }
};

// The next functions alter player values according to events fired by
// the UI.
function moveUp()    {
    clearGameArea();
    robotVacuum.speed = 1;
    redrawGameArea();
}
function moveDown()  {
    clearGameArea();
    robotVacuum.speed = -1;
    redrawGameArea();
}
function moveLeft()  {
    clearGameArea();
    robotVacuum.moveAngle = -1;
    redrawGameArea();
}
function moveRight() {
    clearGameArea();
    robotVacuum.moveAngle = 1;
    redrawGameArea();
}
function moveToTouchLocation(touchLocation) {
    $("#debugconsole").html(touchLocation.x +" "+touchLocation.y);
}

/*
    The button press is a single event. A timer is used to call the movement
    function if a button is being held down. Once lifted the timer is cleared.
    If user presses the button down and moves the mouse away from the button
    the timer is not cleared.
*/
var launchedTimer;

function launchTimer(func) {
    launchTimerStop();
    launchedTimer = setInterval(func, 1);
}

function launchTimerStop() {
    clearInterval(launchedTimer);
}


// This empties the canvas for the elements to be redrawn on it.
function clearGameArea() {
    gameWorld.clear();
    updateObjects(floorRugs);
    updateObjects(dustParticles);
    updateObjects(obstacles);
    robotVacuum.moveAngle = 0;
    robotVacuum.speed = 0;
}

// This function is called by intervalPlayer to allow game progression.
function updateGameArea() {
    clearGameArea();
    if (!gameOver){

        if (gameWorld.keys && gameWorld.keys[37]) { moveLeft();  }
        if (gameWorld.keys && gameWorld.keys[39]) { moveRight(); }
        if (gameWorld.keys && gameWorld.keys[38]) { moveUp();    }
        if (gameWorld.keys && gameWorld.keys[40]) { moveDown();  }
        if (gameWorld.keys && gameWorld.keys[81]) { gameOver = true; gameWorld.stop(); }
    }
    redrawGameArea();
}

// actual drawing to canvas is done with this function.
function redrawGameArea(){
    if (!gameOver){
        newPos(robotVacuum);
        updateObject(robotVacuum);
        collisionWithPlayer(floorRugs);
        collisionWithPlayer(obstacles);
        collisionWithPlayer(dustParticles);
    }else{
        drawMessage("Game over", windowWidth/2-150, windowHeight/2-200);
    }
        drawStatsOnCanvas();
}

// This draws the texts and points to the canvas.
function drawStatsOnCanvas(){
    var ctx = gameWorld.context;
    ctx.save();
    ctx.font = "20px Comic Sans MS";
    ctx.fillStyle = "red";
    ctx.fillText("Vacuum", 10, 30);
    ctx.fillText("Dust: "+points, 10, windowHeight - 420);
    if (robotVacuum.sucking){
        ctx.fillText("Suction on", windowWidth-150, windowHeight - 420);
    }

};

// generic message drawing function. Used to draw "Game over" on canvas.
function drawMessage(msg, x, y) {
    var ctx = gameWorld.context;
    ctx.save();
    ctx.font = "50px Comic Sans MS";
    ctx.fillStyle = "red";
    ctx.fillText(msg, x, y);
}

// generate random location for dust, rugs and obstacles.
function getRandomLocation(){
    var randomLoc = {};
    randomLoc.x = Math.floor(Math.random() * (windowWidth + 1));
    randomLoc.y = Math.floor(Math.random() * (windowHeight + 1));
    return randomLoc;
}


// random angle for objects added to canvas.
function getRandomAngle(){
    var randomAngle = Math.random() * 360*Math.PI/180;
    return randomAngle;
}


function randomlyAddDust(){
    var loc = getRandomLocation();
    var dustToBeAdded = new component(5, 5, "white", loc.x, loc.y, "dust");
    dustParticles.push(dustToBeAdded)
    if (dustParticles.length > 1000) {
        gameOver = true;
        gameWorld.stop();
    };
}


function randomlyAddRug(){
    var loc = getRandomLocation();
    var rugToBeAdded = new component(30, 25, "blue", loc.x, loc.y, "rug");
    rugToBeAdded.angle = getRandomAngle();
    floorRugs.push(rugToBeAdded)
}


function randomlyAddObstacle(){
    var loc = getRandomLocation();
    var obstacleToBeAdded = new component(8, 8, "red", loc.x, loc.y, "obstacle");
    obstacleToBeAdded.angle = getRandomAngle();
    obstacles.push(obstacleToBeAdded)
}


function robotSuckingStateChange(){
    robotVacuum.sucking = !robotVacuum.sucking;
}


// The next section starts the game once everything has been loaded.
// It also contains the messaging.
$(document).ready( function() {
    "use strict";

    // Add listeners to record keypresses and to send them to gameWorld
    window.addEventListener('keydown', function (e) {
        e.preventDefault();
        gameWorld.keys = (gameWorld.keys || []);
        gameWorld.keys[e.keyCode] = (e.type == "keydown");
    });
    window.addEventListener('keyup', function (e) {
        // suction needs to be set based on keyup -event. Behaviour is too erratic otherwise.
        if (e.keyCode == 83) {
            robotSuckingStateChange();
        }else{
            gameWorld.keys = (gameWorld.keys || []);
            gameWorld.keys[e.keyCode] = (e.type == "keydown");
        }
    });
    document.getElementsByTagName("canvas")[0].addEventListener('touchend', function (e) {
        // If user has touched a location on canvas,
        // the robot will move to this location.
        var loc;
        loc.x = e.pageX;
        loc.y = e.pageY;
        moveToTouchLocation(loc);
    });


    $("#submit_score").click( function () {
      var msg = {
        "messageType": "SCORE",
        "score": parseFloat(points)
      };
      window.parent.postMessage(msg, "*");
    });

    // User has pressed restart so the current game is cleared and a new one
    // is launched.
    $("#restart").click( function () {
        gameWorld.stop();

        robotVacuum = new component(25, 25, "grey", 225, 225, "player");
        dustParticles = [];
        floorRugs = [];
        obstacles = [];
        gameOver = false;
        points = 0;
        gameWorld.canvas.focus();
        gameWorld.start();
    });


    // Sends this game's state to the service.
    // The format of the game state is decided
    // by the game
    // JSON
    $("#save").click( function () {
      var msg = {
        "messageType": "SAVE",
        "gameState": {
            "robotVacuum" : JSON.stringify(robotVacuum),
            "dustParticles" : JSON.stringify(dustParticles),
            "floorRugs" : JSON.stringify(floorRugs),
            "obstacles" : JSON.stringify(obstacles),
            "gameOver" : gameOver,
            "score" : points
        }
      };
      window.parent.postMessage(msg, "*");
    });

    // Sends a request to the service for a
    // state to be sent, if there is one.
    $("#load").click( function () {
      var msg = {
        "messageType": "LOAD_REQUEST",
      };
      window.parent.postMessage(msg, "*");
    });


    // Listen incoming messages, if the messageType
    // is LOAD then the game state will be loaded.
    // Note that no checking is done, whether the
    // gameState in the incoming message contains
    // correct information.
    //
    // Also handles any errors that the service
    // wants to send (displays them as an alert).
    window.addEventListener("message", function(evt) {
      if(evt.data.messageType === "LOAD") {
          gameWorld.stop();

          robotVacuum     = eval('('+evt.data.gameState.robotVacuum+')');
          dustParticles   = eval('('+evt.data.gameState.dustParticles+')');
          floorRugs       = eval('('+evt.data.gameState.floorRugs+')');
          obstacles       = eval('('+evt.data.gameState.obstacles+')');
          gameOver        = eval('('+evt.data.gameState.gameOver+')');
          points          = eval('('+evt.data.gameState.score+')');

          gameWorld.start();
      } else if (evt.data.messageType === "ERROR") {
        alert(evt.data.info);
      }
    });


    // Request the service to set the resolution of the
    // iframe correspondingly
    var message =  {
        messageType: "SETTING",
        options: {
            "width": windowWidth,
            "height": windowHeight
        }
    };
    window.parent.postMessage(message, "*");

});
