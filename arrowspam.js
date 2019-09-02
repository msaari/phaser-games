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
var bKey
let platforms 
let light

// Resurssien lataaminen pelin käynnistyessä.
function preload () {
    // Ladataan taustakuvan kerrokset.
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

    // Pelihahmojen spritet.
    this.load.image('wizard', 'assets/sprites/wizard.png')
    this.load.image('monk', 'assets/sprites/monk.png')
    this.load.image('red', 'assets/sprites/red.png')
    this.load.image('crosshair', 'assets/sprites/crosshair.png')

    // Pohjapalkki.
    this.load.image('bottom', 'assets/sprites/bottom.png')

    // Sinä voitit -teksti.
    this.load.image('youwin', 'assets/img/youwin.png')
}

// Pelialueen luominen.
function create () {
    // Taustakuvan kerrokset. Otetaan valokerrokset muistiin, jotta niitä voi
    // säätää.
    this.add.image(400, 200, 'layer10')
    this.add.image(400, 200, 'layer9')
    this.add.image(400, 200, 'layer8')
    light1 = this.add.image(400, 200, 'layer7')
    this.add.image(400, 200, 'layer6')
    this.add.image(400, 200, 'layer5')
    light2 = this.add.image(400, 200, 'layer4')
    this.add.image(400, 200, 'layer3')
    this.add.image(400, 200, 'layer2')
    this.add.image(400, 200, 'layer1')
    this.add.image(400, 200, 'layer0')

    // Luodaan velho ja velhon tähtäin.
    sprites.wizard = this.physics.add.sprite(200, 550, 'wizard').setScale(1.5, 1.5)
    sprites.wizard.body.allowGravity = false
    sprites.wizardCrosshair = this.add.sprite(200, 550, 'crosshair')

    // Luodaan munkki ja munkin tähtäin.
    sprites.monk = this.physics.add.sprite(600, 560, 'monk').setScale(1.5, 1.5)
    sprites.monk.body.allowGravity = false
    sprites.monkCrosshair = this.add.sprite(600, 550, 'crosshair')

    // Luodaan pohjakerros estämään asioiden putoamista.
    platforms = this.physics.add.staticGroup()
    platforms.create(400, 585, 'bottom')
    platforms.toggleVisible()

    // Luodaan ammuksille ryhmät ja törmäykset.
    sprites.wizardShots = this.physics.add.group({
        collideWorldBounds: false
    })
    sprites.monkShots = this.physics.add.group({
        collideWorldBounds: false
    })
    // Laitetaan spritelle asianmukaiset törmäyssäännöt.
    this.physics.add.collider(sprites.wizardShots, sprites.monk)
    this.physics.add.collider(sprites.wizardShots, platforms)
    this.physics.add.overlap(sprites.wizardShots, platforms, fizzle, null, this)
    this.physics.add.overlap(sprites.wizardShots, sprites.monk, scoreHit, null, this)
    this.physics.add.collider(sprites.monkShots, sprites.wizard)
    this.physics.add.collider(sprites.monkShots, platforms)
    this.physics.add.overlap(sprites.monkShots, platforms, fizzle, null, this)
    this.physics.add.overlap(sprites.monkShots, sprites.wizard, scoreHit, null, this)
    this.physics.add.collider(sprites.monkShots, sprites.wizardShots)

    // Luodaan voimapalkit.
    power.wizard = this.add.rectangle(150, 575, 1, 10, 0xff0000)
    power.monk = this.add.rectangle(550, 575, 1, 10, 0xff0000)

    // Munkki ja velho törmäävät pohjakerrokseen.
    this.physics.add.collider(sprites.monk, platforms)
    this.physics.add.collider(sprites.wizard, platforms)

    // Rekisteröidään näppäimet.
    aKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A)
    bKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.L)
}

const POWER_MIN = 100
const POWER_MAX = 400
const CROSSHAIR_DISTANCE = 20

let wizardPower = POWER_MIN
let wizardAngle = 190 // Asteita, 0 on oikealla.
let wizardAngleDelta = 1

let monkPower = POWER_MIN
let monkAngle = 350
let monkAngleDelta = 1

function update() {
    // Valokerrosten vilkuttelua, säädetään alphaa (läpinäkyvyyttä)
    // sattumanvaraisesti.
    if (Math.random() > 0.99) light1.setAlpha(light1.alpha + 0.2)
    if (Math.random() < 0.01) light1.setAlpha(light1.alpha - 0.2)
    if (light1.alpha < 0) light1.setAlpha(0.8) // Meni yli laidan, palautetaan sallituksi.
    if (light1.alpha > 1) light1.setAlpha(0.3)

    // Toisen valokerroksen vilkuttelua.
    if (Math.random() > 0.99) light2.setAlpha(light2.alpha + 0.2)
    if (Math.random() < 0.01) light2.setAlpha(light2.alpha - 0.2)
    if (light2.alpha < 0) light2.setAlpha(0.8)
    if (light2.alpha > 1) light2.setAlpha(0.3)

    // Tähtäinten liikuttaminen. Jos kulma menee pois sallitulta alueelta,
    // vaihdetaan muutoksen suuntaa.
    wizardAngle += wizardAngleDelta
    if (wizardAngle > 350 || wizardAngle < 190) wizardAngleDelta *= -1

    monkAngle += monkAngleDelta
    if (monkAngle > 350 || monkAngle < 190) monkAngleDelta *= -1

    // Voimapalkin leveys hahmon voiman verran, muunnettuna välille 0-100.
    power.wizard.width = Math.round(wizardPower / 2) - (POWER_MIN / 2)
    power.monk.width = Math.round(monkPower / 2) - (POWER_MIN / 2)

    // Piirretään tähtäimet oikeaan kohtaan.
    sprites.wizardCrosshair.x = sprites.wizard.x + 10 + CROSSHAIR_DISTANCE * Math.cos(wizardAngle * (Math.PI/180))
    sprites.wizardCrosshair.y = sprites.wizard.y + CROSSHAIR_DISTANCE * Math.sin(wizardAngle * (Math.PI/180))

    sprites.monkCrosshair.x = sprites.monk.x + CROSSHAIR_DISTANCE * Math.cos(monkAngle * (Math.PI/180))
    sprites.monkCrosshair.y = sprites.monk.y + CROSSHAIR_DISTANCE * Math.sin(monkAngle * (Math.PI/180))

    if (aKey.isDown) {
        // Velhon latausnappi on pohjassa, säädä voimaa sen mukaan kauanko
        // nappia on pidetty pohjassa.
        wizardPower = POWER_MIN + Math.round(aKey.getDuration() / 5)
        if (wizardPower > POWER_MAX) wizardPower = POWER_MAX
    }
    if (aKey.isUp && wizardPower > POWER_MIN) {
        // Latausnappi ei ole pohjassa ja voimaa on kertynyt, joten luodaan
        // ammus:
        let shot = sprites.wizardShots.create(sprites.wizard.x + 10, sprites.wizard.y, 'red')
        // Ammus on muodoltaan ympyrä, 55 ja 55 on ammuksen keskipiste spritessä.
        shot.setCircle(10, 55, 55)
        // Nopeus tulee tällä funktiolla kulman ja voiman perusteella.
        this.physics.velocityFromAngle(wizardAngle, wizardPower, shot.body.velocity)
        wizardPower = POWER_MIN
    }

    // Sama munkille.
    if (bKey.isDown) {
        monkPower = POWER_MIN + Math.round(bKey.getDuration() / 5)
        if (monkPower > POWER_MAX) monkPower = POWER_MAX
    }
    if (bKey.isUp && monkPower > POWER_MIN) {
        let shot = sprites.monkShots.create(sprites.monk.x - 10, sprites.monk.y, 'red')
        shot.setCircle(10, 55, 55)
        this.physics.velocityFromAngle(monkAngle, monkPower, shot.body.velocity)
        monkPower = POWER_MIN
    }
}

// Ammus osuu lattiaan.
function fizzle(shot, platforms) {
    shot.disableBody(true, true)
}

// Ammus osuu kohteeseen.
function scoreHit(shot, target) {
    shot.disableBody(true, true)
    target.disableBody(true, true)
    this.add.image(400, 200, 'youwin')
}