import 'phaser';

var config = {
    type: Phaser.AUTO,
    parent: 'phaser-example',
    width: 1280,
    height: 800,
    scene: {
        preload: preload,
        create: create,
        update: update,
    }
};

var game = new Phaser.Game(config);

// 0 = Title
// 1 = In Game
var gameState = 0;

var people = [
    'patrick',
    'alan',
    'doctor',
]
var images = [
    'cup',
    ...people
];

var cups = [];
var swaps = [
    [0,1],
    [0,2],
    [1,2]
]

function preload ()
{
    for (let image of images) {
        this.load.image(image, `assets/${image}.png`);
    }
}

function swapCups(_that, swap, duration) {
    // only swap one cup at a time
    if (_that.tweens.getAllTweens().length > 0) {
        return;
    }
    _that.tweens.add({
        targets: cups[swap[0]].cup,
        x: cups[swap[1]].cup.x,
        y: cups[swap[1]].cup.y,
        duration: duration,
        ease: 'Power2',
    });
    _that.tweens.add({
        targets: cups[swap[1]].cup,
        x: cups[swap[0]].cup.x,
        y: cups[swap[0]].cup.y,
        duration: duration,
        ease: 'Power2',
    });
    _that.tweens.add({
        targets: cups[swap[0]].person,
        x: cups[swap[1]].cup.x,
        y: cups[swap[1]].cup.y + 50,
        duration: duration,
        ease: 'Power2',
    });
    _that.tweens.add({
        targets: cups[swap[1]].person,
        x: cups[swap[0]].cup.x,
        y: cups[swap[0]].cup.y + 50,
        duration: duration,
        ease: 'Power2',
    });

}

var gameOverText;
var winText;
var startGameText;

function create ()
{
    gameOverText = this.add.text(100, 100, 'Game Over');
    winText = this.add.text(100, 100, 'You Win!');

    var loadedPeople = [];
    for (let person of people) {
        loadedPeople.push(this.add.image(0, 0, person));
    }
    for (var i=0;i<3;i++) {
        const x = 300 + 200 * i;
        const y = 400;
        const person = Math.ceil(Math.random() * loadedPeople.length-1);
        const cupPerson = loadedPeople[person]
        cupPerson.x = x;
        cupPerson.y = y;
        cupPerson.scaleX = 0.2;
        cupPerson.scaleY = 0.2;
        cups.push({
            cup: this.add.image(x, y, 'cup').setInteractive(),
            person: cupPerson
        });
        loadedPeople.splice(person, 1);
        cups[i].cup.on('pointerdown', clickCup);
        cups[i].cup.parent = cups[i];
    }
    game.input.mouse.capture = true;
}

var round = 0;
var keepSwapping = false;

function startRound() {
    keepSwapping = true;
    window.setTimeout(stopRound, 12000);
}

function stopRound() {
    keepSwapping = false;
}

function runRound(tweens) {
    gameOverText.scaleX = 0;
    gameOverText.scaleY = 0;
    winText.scaleX = 0;
    winText.scaleY = 0;    

    raiseCup(cups[0].cup, tweens, () => {
        raiseCup(cups[1].cup, tweens, () => {
            raiseCup(cups[2].cup, tweens, startRound );
        })
    });
}

function raiseCup(cup, tweens, onDone) {
    if (!onDone) {
        onDone = () => {};
    }
    tweens.add({
        targets: cup,
        x: cup.x,
        y: cup.y - 200,
        duration: 500,
        ease: 'Power2',
        yoyo: true,
        onComplete: onDone,
    });    
}

function clickCup(pointer) {
    // wait until cups stop moving
    if (keepSwapping) {
        return;
    }
    raiseCup(this, pointer.manager.game.scene.scenes[0].tweens, () => {
        if (this.parent.person.texture.key != 'doctor') {
            gameOverText.scaleX = 1;
            gameOverText.scaleY = 1;
        } else {
            winText.scaleX = 1;
            winText.scaleY = 1;
        }
    });
    window.setTimeout(3000, runRound(pointer.manager.game.scene.scenes[0].tweens));
}

// hmmm?
function handleTitle(_that) {
}

var duration = 1000;
var lastSwap;
var gameStarted = false;


function update() {
    if (!gameStarted) {
        gameStarted = true;
        runRound(this.tweens);
    }

    // if (gameState === 0)
    // {
    //     handleTitle(this);
    //     return;
    // }

    if (this.tweens.getAllTweens().length > 0) {
        return;
    }
    if (!keepSwapping) {
        if (game.input.activePointer.justDown) {
            // handleClick(this, game);
        }
        return;
    }
    if (duration > 350) {
        duration -= 50;
    }
    var swap = Math.ceil(Math.random() * 2);
    while (lastSwap === swap) {
        swap = Math.ceil(Math.random() * 2);
    }
    lastSwap = swap;
    swapCups(this, swaps[swap], duration);
    lastSwap = swap;
}
