var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {
                y: 200,
            },
            debug: false
        }
    },
    scene: {
        preload,
        create,
        update,
    }
};

var game = new Phaser.Game(config);
const sprites = {}
const power = {}
var aKey
let platforms 
let light

function preload () {
//    this.load.setBaseURL('http://labs.phaser.io');

    this.load.image('layer0', 'assets/bg/Layer_0000_9.png')
    this.load.image('layer1', 'assets/bg/Layer_0001_8.png')
    this.load.image('layer2', 'assets/bg/Layer_0002_7.png')
    this.load.image('layer3', 'assets/bg/Layer_0003_6.png')
    this.load.image('layer4', 'assets/bg/Layer_0004_Lights.png')
    this.load.image('layer5', 'assets/bg/Layer_0005_5.png')
    this.load.image('layer6', 'assets/bg/Layer_0006_4.png')
    this.load.image('layer7', 'assets/bg/Layer_0007_Lights.png')
    this.load.image('layer8', 'assets/bg/Layer_0008_3.png')
    this.load.image('layer9', 'assets/bg/Layer_0009_2.png')
    this.load.image('layer10', 'assets/bg/Layer_0010_1.png')

    this.load.image('wizard', 'assets/sprites/wizard.png')
    this.load.image('monk', 'assets/sprites/monk.png')
    this.load.image('red', 'assets/sprites/red.png')
    this.load.image('crosshair', 'assets/sprites/crosshair.png')

    this.load.image('bottom', 'assets/sprites/bottom.png')
    this.load.image('youwin', 'assets/img/youwin.png')
}

function create () {
    this.add.image(400, 200, 'layer10')
    this.add.image(400, 200, 'layer9')
    this.add.image(400, 200, 'layer8')
    this.add.image(400, 200, 'layer7')
    this.add.image(400, 200, 'layer6')
    this.add.image(400, 200, 'layer5')
    light = this.add.image(400, 200, 'layer4')
    this.add.image(400, 200, 'layer3')
    this.add.image(400, 200, 'layer2')
    this.add.image(400, 200, 'layer1')
    this.add.image(400, 200, 'layer0')

    sprites.wizard = this.physics.add.sprite(200, 550, 'wizard').setScale(1.5, 1.5)
    sprites.crosshair = this.add.sprite(200, 550, 'crosshair')

    sprites.monk = this.physics.add.sprite(600, 560, 'monk')
    sprites.monk.setScale(1.5, 1.5)
    sprites.monk.body.allowGravity = false

    platforms = this.physics.add.staticGroup()
    platforms.create(400, 585, 'bottom')
    platforms.toggleVisible()

    power.wizard = this.add.rectangle(150, 575, 1, 10, 0xff0000)

    this.physics.add.collider(sprites.monk, platforms)
    this.physics.add.collider(sprites.wizard, platforms)

    aKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A)
}

const WIZARD_POWER_MIN = 100
const WIZARD_POWER_MAX = 400

let wizardPower = WIZARD_POWER_MIN
let wizardAngle = 190
let wizardAngleDelta = 1

function update() {
    if (Math.random() > 0.99) light.setVisible(!light.visible)

    wizardAngle += wizardAngleDelta
    if (wizardAngle > 350 || wizardAngle < 190) wizardAngleDelta *= -1

    power.wizard.width = Math.round(wizardPower / 2) - (WIZARD_POWER_MIN / 2)

    sprites.crosshair.x = sprites.wizard.x + 10 + 20 * Math.cos(wizardAngle * (Math.PI/180))
    sprites.crosshair.y = sprites.wizard.y + 20 * Math.sin(wizardAngle * (Math.PI/180))

    if (aKey.isDown) {
        wizardPower = WIZARD_POWER_MIN + Math.round(aKey.getDuration() / 5)
        if (wizardPower > WIZARD_POWER_MAX) wizardPower = WIZARD_POWER_MAX
    }
    if (aKey.isUp && wizardPower > WIZARD_POWER_MIN) {
        sprites.shot = this.physics.add.sprite(sprites.wizard.x + 10, sprites.wizard.y, 'red')
        sprites.shot.setCircle(10, 55, 55)
        this.physics.velocityFromAngle(wizardAngle, wizardPower, sprites.shot.body.velocity)
        sprites.shot.setCollideWorldBounds(false)
        wizardPower = WIZARD_POWER_MIN

        this.physics.add.collider(sprites.shot, sprites.monk)
        this.physics.add.collider(sprites.shot, platforms)
        this.physics.add.overlap(sprites.shot, platforms, fizzle, null, this)
        this.physics.add.overlap(sprites.shot, sprites.monk, scoreHit, null, this)
    }
}

function fizzle(shot, platforms) {
    shot.disableBody(true, true)
}

function scoreHit(shot, target) {
    shot.disableBody(true, true)
    target.disableBody(true, true)
    this.add.image(400, 200, 'youwin')
}