import 'phaser';

const GAME_W = 800;
const GAME_H = 600;

var config = {
    type: Phaser.AUTO,
    parent: 'phaser-example',
    width: GAME_W,
    height: GAME_H,
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

var currentRound = 0;

var allPeople = [
    'rohit',
    'patrick',
    'alan',
]

var randomTwoPeople = [
    allPeople.slice(Math.round((allPeople.length-1) * Math.random()))[0],
    allPeople.slice(Math.round((allPeople.length-1) * Math.random()))[0],
]

var people = [
    ...randomTwoPeople,
    'doctor',
]

var images = [
    'cup',
    'table',
    'nuna',
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
    const distance = Math.abs(cups[swap[0]].cup.x - cups[swap[1]].cup.x);
    if (distance > 200) {
        duration *= 1.5;
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

var logo;
function clickLogo() {
    var doctorX = 0;
    var doctorY = 0;
    for (var cup of cups) {
        if (cup.person.texture.key === 'doctor') {
            doctorX = cup.person.x;
            doctorY = cup.person.y - 220;
        }
    }

    this.tweens.killAll();

    this.tweens.add( {
        targets: logo,
        duration: 1000,
        x: doctorX,
        y: doctorY,
        ease: 'Power2',
    });
}

function showLogo() {
    logo.scaleX = 0.25;
    logo.scaleY = 0.25;
    this.tweens.add({
        targets: logo,
        alpha: 0.5,
        duration: 1000,
        ease: 'Power2',
        yoyo: true,
        repeat: 100000,
    });
}

function create ()
{
    const table = this.add.image(210, 410, 'table');
    table.scaleX = 0.67;
    table.scaleY = 0.67;

    logo = this.add.image(720, 50, 'nuna');
    logo.scaleX = 0;
    logo.scaleY = 0;
    logo.on('pointerdown', clickLogo.bind(this));

    logo.setInteractive();


    var loadedPeople = [];
    for (let person of people) {
        loadedPeople.push(this.add.image(0, 0, person));
    }

    for (var i=0;i<3;i++) {
        const x = 200 + 200 * i;
        const y = 350;
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

    startGameText = this.add.text(GAME_W / 2 - 300, GAME_H / 2 - 200, 'Find the PCP!  Click to start...');
    gameOverText = this.add.text(GAME_W / 2 - 100, GAME_H / 2 - 200, 'Game Over');
    winText = this.add.text(GAME_W / 2 - 100, GAME_H / 2 - 200, 'You Win!');

    updateText(startGameText);
    updateText(gameOverText);
    updateText(winText);

    game.input.mouse.capture = true;
}

function updateText(text) {
    text.setColor('#000');
    text.setFontSize(32);
    text.setShadow(3, 3, '#FFF', 0.5);
}

var round = 0;
var keepSwapping = false;
var clickToStart = true;

function startRound() {
    startGameText.scaleX = 0;
    startGameText.scaleY = 0;
    keepSwapping = true;
    window.setTimeout(stopRound.bind(this), 12000);
}

function stopRound() {
    keepSwapping = false;
    showLogo.call(this);
}

function runRound() {
    gameOverText.scaleX = 0;
    gameOverText.scaleY = 0;
    winText.scaleX = 0;
    winText.scaleY = 0;
    startGameText.scaleX = 1;
    startGameText.scaleY = 1;
    clickToStart = true;
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
    // wait until cups stop moving & not on title screen
    if (clickToStart || keepSwapping) {
        return;
    }

    logo.scaleX = 0;
    logo.scaleY = 0;
    logo.x = 720;
    logo.y = 50;

    raiseCup(this, pointer.manager.game.scene.scenes[0].tweens, () => {
        if (this.parent.person.texture.key != 'doctor') {
            gameOverText.scaleX = 1;
            gameOverText.scaleY = 1;
        } else {
            winText.scaleX = 1;
            winText.scaleY = 1;
        }
    });
    currentRound++;
    window.setTimeout(runRound, 3000);
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
        runRound();
    }

    if (clickToStart) {
        if (game.input.activePointer.justDown) {
            startGameText.scaleX = 0;
            startGameText.scaleY = 0;
            keepSwapping = true;
            clickToStart = false;

            raiseCup(cups[0].cup, this.tweens, () => {
                raiseCup(cups[1].cup, this.tweens, () => {
                    raiseCup(cups[2].cup, this.tweens, startRound.bind(this) );
                })
            });
        }
        return;
    }

    if (!keepSwapping) {
        return;
    }

    if (this.tweens.getAllTweens().length > 0) {
        return;
    }
    if (duration > 350) {
        duration -= 50 + (currentRound * 10);
    }
    var swap = Math.ceil(Math.random() * 2);
    swapCups(this, swaps[swap], duration);
}
