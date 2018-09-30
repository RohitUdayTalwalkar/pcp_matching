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
        y: cups[swap[1]].cup.y + 100,
        duration: duration,
        ease: 'Power2',
    });
    _that.tweens.add({
        targets: cups[swap[1]].person,
        x: cups[swap[0]].cup.x,
        y: cups[swap[0]].cup.y + 100,
        duration: duration,
        ease: 'Power2',
    });

}

function create ()
{
    var loadedPeople = [];
    for (let person of people) {
        loadedPeople.push(this.add.image(0, 0, person));
    }
    for (var i=0;i<3;i++) {
        const x = 300 + 300 * i;
        const y = 400;
        const person = Math.ceil(Math.random() * loadedPeople.length-1);
        const cupPerson = loadedPeople[person]
        cupPerson.x = x;
        cupPerson.y = y + 100;
        cupPerson.scaleX = 0.2;
        cupPerson.scaleY = 0.2;
        cups.push({
            cup: this.add.image(x, y, 'cup'),
            person: cupPerson
        });
        loadedPeople.splice(person, 1);
    }
    game.input.mouse.capture = true;
}

var round = 0;
var keepSwapping = true;

function stopRound() {
    keepSwapping = false;
}

function runRound() {
    window.setTimeout(stopRound, 6000)
}

// hmmm?
function handleTitle(_that) {
}

var duration = 1000;
var lastSwap;
function update() {
    if (gameState === 1000)
    {
        // handleTitle(this);
        return;
    }

    if (this.tweens.getAllTweens().length > 0) {
        return;
    }
    if (!keepSwapping) {
        if (game.input.activePointer.isDown) {
            // did they click on the right one?
        }
        return;
    }
    if (duration > 150) {
        duration -= 20;
    }
    var swap = Math.ceil(Math.random() * 2);
    while (lastSwap === swap) {
        swap = Math.ceil(Math.random() * 2);
    }
    lastSwap = swap;
    swapCups(this, swaps[swap], duration);
    lastSwap = swap;
}
runRound();