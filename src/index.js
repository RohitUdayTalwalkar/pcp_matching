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

var duration = 1000;
function update() {
    if (this.tweens.getAllTweens().length > 0) {
        return;
    }
    if (duration > 200) {
        duration -= 30;
    }
    const swap = Math.ceil(Math.random() * 2);
    swapCups(this, swaps[swap], duration);

    // if (game.input.activePointer.isDown) {
    //     const swap = Math.ceil(Math.random() * 2);
    //     swapCups(this, swaps[swap], 600);
    // }
}