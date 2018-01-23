
// Environment parameters
var windowWidth = 600;
var windowHeight = 400;
var test_msg;

// Game variables
var robotVacuum = new component(25, 25, "grey", 225, 225, "player");
var dustParticles = [];
var floorRugs = [];
var obstacles = [];
var gameOver = false;
var points = 0;


function startGame() {
    if (!gameOver){
        gameWorld.start();
    }
}


var gameWorld = {
    canvas : document.createElement("canvas"),
    start : function() {
        gameOver = false;
        this.canvas.width = windowWidth - 10;
        this.canvas.height = windowHeight - 100;
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

        drawMessage("Game over", windowWidth/2-150, windowHeight/2-50);
    },
    clear : function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}


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


function updateObject(object) {
    var ctx = gameWorld.context;
    ctx.save();
    ctx.translate(object.x, object.y);
    ctx.rotate(object.angle);
    ctx.fillStyle = object.color;
    if (object.type == "player"){
        ctx.fillRect(object.width / -2, object.height / -2, object.width, object.height);
    }else if (object.type == "dust"){
        ctx.fillRect(object.width / -2, object.height / -2, object.width, object.height);
    }else if (object.type == "rug"){
        ctx.fillRect(object.width / -2, object.height / -2, object.width, object.height);
    }else{
        ctx.fillRect(object.width / -2, object.height / -2, object.width, object.height);
    }
    ctx.restore();
}


function newPos(object) {
    object.angle += object.moveAngle * Math.PI / 180;

    var xCandidate = object.x + object.speed * Math.sin(object.angle)
    var yCandidate = object.y - object.speed * Math.cos(object.angle);

    if (xCandidate >= 0 && xCandidate < windowWidth - 10 ) {
        object.x = xCandidate;
    }
    if (yCandidate >= 0 && yCandidate < windowHeight - 100) {
        object.y = yCandidate;
    }
}


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
                }else if(object.type=="dust"){
                    dustParticles.splice(i, 1);
                    points = points +1;
                }
            }
        }
    }
};


function updateObjects(objects){
    for (var i = 0; i < objects.length; i++) {
        updateObject(objects[i]);
    }
};


function updateGameArea() {

    gameWorld.clear();
    updateObjects(floorRugs);
    updateObjects(dustParticles);
    updateObjects(obstacles);
    robotVacuum.moveAngle = 0;
    robotVacuum.speed = 0;

    if (gameWorld.keys && gameWorld.keys[37]) { robotVacuum.moveAngle = -1; }
    if (gameWorld.keys && gameWorld.keys[39]) { robotVacuum.moveAngle = 1; }
    if (gameWorld.keys && gameWorld.keys[38]) { robotVacuum.speed = 1; }
    if (gameWorld.keys && gameWorld.keys[40]) { robotVacuum.speed = -1; }
    if (gameWorld.keys && gameWorld.keys[81]) { gameOver = true; gameWorld.stop(); }

    newPos(robotVacuum);
    updateObject(robotVacuum);
    collisionWithPlayer(floorRugs);
    collisionWithPlayer(obstacles);
    collisionWithPlayer(dustParticles);
    drawStatsOnCanvas();

}


function drawStatsOnCanvas(){
    var ctx = gameWorld.context;
    ctx.save();
    ctx.font = "20px Comic Sans MS";
    ctx.fillStyle = "red";
    ctx.fillText("Vacuum", 10, 30);
    ctx.fillText("Dust: "+points, 10, windowHeight - 120);
    if (robotVacuum.sucking){
        ctx.fillText("Suction on", windowWidth-150, windowHeight - 120);
    }

};


function drawMessage(msg, x, y) {
    var ctx = gameWorld.context;
    ctx.save();
    ctx.font = "50px Comic Sans MS";
    ctx.fillStyle = "red";
    ctx.fillText(msg, x, y);
}


function getRandomLocation(){
    var toBeReturned = {};
    toBeReturned.x = Math.floor(Math.random() * (windowWidth + 1));
    toBeReturned.y = Math.floor(Math.random() * (windowHeight + 1));
    return toBeReturned;
}


function getRandomAngle(){
    var toBeReturned = Math.random() * 360*Math.PI/180;
    return toBeReturned;
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


$(document).ready( function() {
    "use strict";
    window.addEventListener('keydown', function (e) {
        e.preventDefault();
        gameWorld.keys = (gameWorld.keys || []);
        gameWorld.keys[e.keyCode] = (e.type == "keydown");
    });
    window.addEventListener('keyup', function (e) {
        // suction needs to be set based on keyup -event. Behaviour is too erratic otherwise.
        if (e.keyCode == 32) { robotVacuum.sucking = !robotVacuum.sucking; }
        gameWorld.keys = (gameWorld.keys || []);
        gameWorld.keys[e.keyCode] = (e.type == "keydown");
    });

    $("#submit_score").click( function () {
      var msg = {
        "messageType": "SCORE",
        "score": parseFloat(points)
      };
      window.parent.postMessage(msg, "*");
    });


    $("#restart").click( function () {
        robotVacuum = new component(25, 25, "grey", 225, 225, "player");
        dustParticles = [];
        floorRugs = [];
        obstacles = [];
        gameOver = false;
        points = 0;
        startGame();
    });


    // Sends this game's state to the service.
    // The format of the game state is decided
    // by the game
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
      test_msg = msg;
      window.parent.postMessage(msg, "*");
    });

    // Sends a request to the service for a
    // state to be sent, if there is one.
    $("#load").click( function () {
       load_test(test_msg);
 /*
      var msg = {
        "messageType": "LOAD_REQUEST",
      };
      window.parent.postMessage(msg, "*");*/
    });


    function load_test (data) {
            robotVacuum     = eval('('+data.gameState.robotVacuum+')');
            dustParticles   = eval('('+data.gameState.dustParticles+')');
            floorRugs       = eval('('+data.gameState.floorRugs+')');
            obstacles       = eval('('+data.gameState.obstacles+')');
            gameOver        = eval('('+data.gameState.gameOver+')');
            points          = eval('('+data.gameState.score+')');

            startGame();
    }

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
        robotVacuum     = eval('('+evt.data.gameState.robotVacuum+')');
        dustParticles   = eval('('+evt.data.gameState.dustParticles+')');
        floorRugs       = eval('('+evt.data.gameState.floorRugs+')');
        obstacles       = eval('('+evt.data.gameState.obstacles+')');
        gameOver        = eval('('+evt.data.gameState.gameOver+')');
        points          = eval('('+evt.data.gameState.score+')');

        startGame();
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