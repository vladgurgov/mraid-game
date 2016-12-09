
var game = new Phaser.Game(800, 600, Phaser.AUTO, 'phaser-joystick', { preload: preload, create: create, update: update });

function preload() {

    game.load.image('sky', 'assets/sky.png');
    game.load.image('ground', 'assets/platform.png');
    game.load.image('star', 'assets/star.png');
    game.load.image('banner', 'assets/dragon.png');
    game.load.spritesheet('dude', 'assets/dude.png', 32, 48);
    game.load.spritesheet('enemy', 'assets/baddie.png', 32, 32);
    game.load.image('vjoy_base', 'assets/base.png');
    game.load.image('vjoy_body', 'assets/body.png');
    game.load.image('vjoy_cap', 'assets/cap.png');
}

var player;
var enemy;
var platforms;
var cursors;
var vjoy;

var stars;
var score = 0;
var scoreText;
var gameTime = 15000;

function create() {

    //  We're going to be using physics, so enable the Arcade Physics system
    game.physics.startSystem(Phaser.Physics.ARCADE);

    //  A simple background for our game
    game.add.sprite(0, 0, 'sky');

    //  The platforms group contains the ground and the 2 ledges we can jump on
    platforms = game.add.group();

    //  We will enable physics for any object that is created in this group
    platforms.enableBody = true;

    // Here we create the ground.
    var ground = platforms.create(0, game.world.height - 64, 'ground');

    //  Scale it to fit the width of the game (the original sprite is 400x32 in size)
    ground.scale.setTo(2, 2);

    //  This stops it from falling away when you jump on it
    ground.body.immovable = true;

    //  Now let's create two ledges
    var ledge = platforms.create(500, 400, 'ground');
    ledge.body.immovable = true;

    ledge = platforms.create(-250, 100, 'ground');
    ledge.body.immovable = true;

    ledge = platforms.create(250, 300, 'ground');
    ledge.body.immovable = true;

    // The player and its settings
    player = game.add.sprite(32, game.world.height - 150, 'dude');

    //  We need to enable physics on the player
    game.physics.arcade.enable(player);

    //  Player physics properties. Give the little guy a slight bounce.
    player.body.bounce.y = 0.2;
    player.body.gravity.y = 300;
    player.body.collideWorldBounds = true;

    //  Our two animations, walking left and right.
    player.animations.add('left', [0, 1, 2, 3], 10, true);
    player.animations.add('right', [5, 6, 7, 8], 10, true);

    //  Finally some stars to collect
    stars = game.add.group();

    //  We will enable physics for any star that is created in this group
    stars.enableBody = true;

    //  Here we'll create 12 of them evenly spaced apart
    for (var i = 0; i < 12; i++)
    {
        //  Create a star inside of the 'stars' group
        var star = stars.create(i * 70, 0, 'star');

        //  Let gravity do its thing
        star.body.gravity.y = 300;

        //  This just gives each star a slightly random bounce value
        star.body.bounce.y = 0.7 + Math.random() * 0.2;
    }

    //  The score
    scoreText = game.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#000' });

    //  Our controls.
    cursors = game.input.keyboard.createCursorKeys();

    //add enemy
 // The player and its settings
    enemy = game.add.sprite(32, 15, 'enemy');

    //  We need to enable physics on the player
    game.physics.arcade.enable(enemy);

    //  Player physics properties. Give the little guy a slight bounce.
    enemy.body.bounce.y = 0.2;
    enemy.body.gravity.y = 300;
    enemy.body.collideWorldBounds = true;

    //  Our two animations, walking left and right.
    enemy.animations.add('left', [0, 1], 10, true);
    enemy.animations.add('right', [2, 3], 10, true);
    // add enemy timer
    timer = game.time.create(false);

    //  Set a TimerEvent to occur after 2 seconds
    timer.loop(2000, changeDirection, enemy);
    timer.add(gameTime, gameOver);
    timer.loop(1000, scoreUpdate, this);
    //  Start the timer running - this is important!
    //  It won't start automatically, allowing you to hook it to button events and the like.
    timer.start();

    //add joystick
    vjoy = game.plugins.add(Phaser.Plugin.VJoy);
    vjoy.inputEnable(0, 0, 400, 600);

    
}

function update() {

    //  Collide the player and the stars with the platforms
    game.physics.arcade.collide(player, platforms);
    game.physics.arcade.collide(stars, platforms);
    game.physics.arcade.collide(enemy, platforms);

    //  Checks to see if the player overlaps with any of the stars, if he does call the collectStar function
    game.physics.arcade.overlap(player, stars, collectStar, null, this);
    //check w enemy overlap
    game.physics.arcade.overlap(player, enemy, killedByEnemy, null, this);

    //  Reset the players velocity (movement)
    player.body.velocity.x = 0;

    var vjCursors = vjoy.cursors;

    if (cursors.left.isDown || vjCursors.left)
    {
        //  Move to the left
        player.body.velocity.x = -150;

        player.animations.play('left');
    }
    else if (cursors.right.isDown || vjCursors.right)
    {
        //  Move to the right
        player.body.velocity.x = 150;

        player.animations.play('right');
    }
    else
    {
        //  Stand still
        player.animations.stop();
        player.frame = 4;
    }
    
    //  Allow the player to jump if they are touching the ground.
    if ((cursors.up.isDown || vjCursors.up) && player.body.touching.down)
    {
        player.body.velocity.y = -350;
    }
    if (cursors.down.isDown)
    {
        //gameOver();
    }


}

function collectStar (player, star) {
    
    // Removes the star from the screen
    star.kill();

    //  Add and update the score
    score += 10;
    scoreUpdate();
}

function killedByEnemy (player, enemy) {
    
    gameOver();

}

function changeDirection() {
    if (Math.random()>=0.5)
    {
        enemy.body.velocity.x=50
        enemy.animations.play('right');
    }
    else 
    {
        enemy.body.velocity.x=-50
        enemy.animations.play('left');
    }
    if (enemy.body.touching.down)
    {   
        enemy.body.velocity.y=-200+Math.random()*100
    }
}

function gameOver() {
    player.kill();
    vjoy.inputDisable();
    timer.stop();
    scoreText.text = 'Game Over! Play Full Version';
    var popup = game.add.button(30, 60, 'banner', bannerClick, this);
    popup.scale.setTo(0.9, 0.9);

}

function scoreUpdate(){
    scoreText.text = 'Score: ' + score +' Time: ' + timeLeft() ;
;

}

function bannerClick() {
    window.location = "https://play.google.com/store/apps/details?id=com.gameloft.android.ANMP.GloftDOHM";

}

function timeLeft(){
    return Math.round(Math.max(0, gameTime/1000-timer.seconds));
}
