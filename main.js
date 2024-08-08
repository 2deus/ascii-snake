let X = 25, Y = 25, tick = 60;
let area = [...Array(Y)].map(e => Array(X)); //get 2d array
const field = document.getElementsByClassName("field")[0];
const startBtn = document.getElementsByClassName("starter")[0];
const goalkeep = document.getElementsByClassName("goalkeeper")[0];
let lastDir = -2, started = false, running = false, bodyparts = [], fruits = [];
const icon = ["l", "║", "■", "•"], icorners = ["╚", "╝", "╔", "╗", "═"], alphabet = "abcdefghijklmnopqrstuvwxyz";

class Tile {
    constructor(src, isBorder, occupiedBy) {
        this.src = src;
        this.isBorder = isBorder;
        this.occupiedBy = occupiedBy;
    }
    occupy(x = 0) {
        this.occupiedBy = x;
        this.src.innerHTML = icon[x];
    }
    kill() {
        bodyparts.push(this);
        setTimeout(() => {
            if (!running) return;
            bodyparts.splice(bodyparts.indexOf(this), 1);
            this.occupy();
        }, plr.bodyLength*tick);
    }
}

const plr = {
    v: undefined,
    h: undefined,
    dir: -2,
    bodyLength: 1
}

const replaySys = {
    str: {
        value: undefined,
        charAt: 0
    },
    count: 1,
    dir: undefined,
    isReplay: false,
    queue: [],
    update() {
        this.dir = lastDir == 1 ? 'u' : lastDir == -1 ? 'd' : lastDir == -2 ? 'l' : 'r';
        this.count = this.count == 1 ? '' : this.count;
        this.str.value = this.str.value+this.dir+String(this.count);
        this.count = 1;
    },
    process() {
        this.queue = [];
        let minus = this.str.value.indexOf('.', this.str.value.indexOf('.', this.str.value.indexOf('.')+1)+1)+1;
        let intLength = 0, temp = [];
        for (let i = minus; i < replaySys.str.value.length; i++) {
            let dir = replaySys.str.value[i] == "l" ? -2 : replaySys.str.value[i] == "r" ? 2 : replaySys.str.value[i] == "u" ? 1 : -1;
            if (!(Number.isNaN(+replaySys.str.value[i]))) {
                temp.push(+replaySys.str.value[i]);
                intLength++;
                continue;
            }
            console.log('cmd logged');
            //temp[0] = temp.length == 0 ? 1 : temp[0];
            replaySys.queue.push([dir, temp.join('')]);
            intLength = 0, temp = [];
        }
    },
    replay() {
        this.isReplay = true;
        let dotDist  = this.str.value.indexOf('.')
           ,dotDist1 = this.str.value.indexOf('.', dotDist + 1) - dotDist - 1
           ,dotDist2 = this.str.value.indexOf('.', this.str.value.indexOf('.', dotDist+1)+1) - dotDist1 - dotDist - 1;
        X = this.str.value.substr(0, dotDist), Y = this.str.value.substr(dotDist+1, dotDist1);
        let rSeed = this.str.value.substr(dotDist1+dotDist+2, dotDist2 - 1);
        console.log(X);
        console.log(Y);
        console.log(rSeed);
        this.process();
        //drawMap(X, Y, true);
        startGame(false, rSeed);
    }
}


function drawMap(X, Y, r = false) {
    if (r) {
        if (!replaySys.isReplay) replaySys.update();
        if (running) clearInterval(resolve);
        running = false;
        endGame(true);
    }
    area = [...Array(Y)].map(e => Array(X));
    field.textContent = '';
    for (let i = Y-1; i >= 0; i--) {
        for (let j = 0; j < X; j++) {
            let patrol = i == 0 || i == Y - 1 || j == 0 || j == X - 1 ? true : false;
            let occupation = patrol ? 1 : 0;
            let appendix = patrol ? icon[1] : icon[0];
            area[i][j] = new Tile(document.createElement("span"), patrol, occupation);
            area[i][j].src.appendChild(document.createTextNode(appendix));
            field.appendChild(area[i][j].src);
            if ( i == 0 || i == Y - 1) area[i][j].src.innerHTML = icorners[4];
        }
        field.appendChild(document.createElement("br"));
    }
}

drawMap(X, Y);

area[0][0].src.innerHTML = icorners[0];
area[0][X-1].src.innerHTML = icorners[1];
area[Y-1][0].src.innerHTML = icorners[2];
area[Y-1][X-1].src.innerHTML = icorners[3];

function getRandomString(n = 6) {
    if (n < 1) return;
    let randomString = [];
    for (let i = 0; i < n; i++) {
        randomString[i] = alphabet[Math.floor(Math.random() * 26)];
    }
    let r = randomString.join('');
    return r;
}

getRandomString(20);

function cyrb128(str) {                     // 128-bit hash generator
    let h1 = 1779033703, h2 = 3144134277,
        h3 = 1013904242, h4 = 2773480762;
    for (let i = 0, k; i < str.length; i++) {
        k = str.charCodeAt(i);
        h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
        h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
        h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
        h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
    }
    h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
    h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
    h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
    h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
    h1 ^= (h2 ^ h3 ^ h4), h2 ^= h1, h3 ^= h1, h4 ^= h1;
    return [h1>>>0, h2>>>0, h3>>>0, h4>>>0];
}

function splitmix32(a) {                    // PRNG
    return function() {
      a |= 0; a = a + 0x9e3779b9 | 0;
      var t = a ^ a >>> 16; t = Math.imul(t, 0x21f0aaad);
          t = t ^ t >>> 15; t = Math.imul(t, 0x735a2d97);
      return ((t = t ^ t >>> 15) >>> 0) / 4294967296;
    }
}

let randStr = getRandomString(), seed = cyrb128(randStr);
const rand = splitmix32(seed[0]);

function getRandInBounds(margin = 0) {
    let rH = Math.floor(rand() * ((X - margin) - (margin+1)) + (margin+1));
    let rV = Math.floor(rand() * ((Y - margin) - (margin+1)) + (margin+1));
    return [rV, rH];
}

function generateFruit() {
    for (let i = 0; i < 100; i++) {
        let r = getRandInBounds();
        let fruit = area[r[0]][r[1]];
        if (fruit.occupiedBy != 0) continue;
        fruit.occupy(3);
        fruits.push(fruit);
        break;
    }
}

function spawnPlayer(v, h) {
    if (area[v][h].isBorder) return;
    try {area[plr.v][plr.h].occupy()}
    catch (e) {};
    area[v][h].occupy(2);
    plr.v = v;
    plr.h = h;
}

function startGame(r = false, startSeed = undefined) {
    if (r) {
        if (running) clearInterval(resolve);
        randStr = startSeed || getRandomString(), seed = cyrb128(randStr);
        let lV = lastDir == 1 ? 1 : lastDir == -1 ? -1 : 0;
        let lH = lastDir == 2 ? 1 : lastDir == -2 ? -1 : 0;
        area[plr.v-lV][plr.h-lH].occupy();
        plr.bodyLength = 1;
        goalkeep.innerHTML = `score: 0`;
        for (let f in fruits) fruits[f].occupy();
        for (let b in bodyparts) bodyparts[b].occupy();
        fruits = [];
        bodyparts = [];
        setTimeout(() => {
            for (let i = 0; i < 9; i++) {
                if (area[Y-2][Math.floor(X/2)+i-4].occupiedBy == 3) continue;
                area[Y-2][Math.floor(X/2)+i-4].src.innerHTML = icon[0];
            }
        }, 100);
    }
    running = true;
    plr.dir = -2, lastDir = -2;
    console.log(`seed: ${randStr}`);
    let coords = getRandInBounds(4);
    spawnPlayer(...coords);
    generateFruit();
    replaySys.str.value = `${X}.${Y}.${randStr}.`;
    return setInterval(tickForward, tick);
}

function movePlayer(v, h) {
    if (area[plr.v+v][plr.h+h].isBorder || area[plr.v+v][plr.h+h].occupiedBy == 2) {
        replaySys.update();
        clearInterval(resolve);
        running = false;
        endGame();
        return;
    }
    if (area[plr.v+v][plr.h+h].occupiedBy == 3) {
        plr.bodyLength++;
        goalkeep.innerHTML = `score: ${plr.bodyLength - 1}`;
        fruits.pop();
        generateFruit();
    }
    area[plr.v][plr.h].kill(plr.v, plr.h);
    plr.v += v;
    plr.h += h;
    area[plr.v][plr.h].occupy(2);
}

function tickForward() {
    if (replaySys.isReplay) {
        lastDir = replaySys.queue[replaySys.str.charAt][0];
        if (replaySys.queue[replaySys.str.charAt][1] > 0) {
            replaySys.queue[replaySys.str.charAt][1]--;
        }
        replaySys.str.charAt += 1+replaySys.queue[replaySys.str.charAt][1].length;
        return;
    }
    else if (lastDir == plr.dir) replaySys.count++;
    else {
        replaySys.update();
        lastDir = plr.dir;
    }
    switch(lastDir) {
        case -2:
            movePlayer(0, -1);
            break;
        case -1:
            movePlayer(-1, 0);
            break;
        case 1:
            movePlayer(1, 0);
            break;
        case 2:
            movePlayer(0, 1);
            break;
    }
}

function endGame(noSign = false) {
    console.log(replaySys.str.value);
    let center = Math.floor(X/2), count = 0;
    const sign = noSign ? `` : `GAME${icon[0]}OVER`;
    const cycle = setInterval(() => {
        if (running) clearInterval(cycle);
        if (count < sign.length) {
            area[Y-2][center+count-4].src.innerHTML = sign[count];
            count++;
            return;
        }
        clearInterval(cycle);
    }, 100);
}

function init() {
    resolve = started ? startGame(true) : startGame();
    started = true;
}

document.addEventListener('keydown', (e) => {
    if ((!running && e.key != ' ') || replaySys.isReplay) return;
    switch(e.key) {
        case 'ArrowDown':
            e.preventDefault();
            if (lastDir == 1) return;
            plr.dir = -1;
            break;
        case 'ArrowLeft':
            e.preventDefault();
            if (lastDir == 2) return;
            plr.dir = -2;
            break;
        case 'ArrowUp':
            e.preventDefault();
            if (lastDir == -1) return;
            plr.dir = 1;
            break;
        case 'ArrowRight':
            e.preventDefault();
            if (lastDir == -2) return;
            plr.dir = 2;
            break;
        case ' ':
            e.preventDefault();
            init();
            break;
    }
})

startBtn.addEventListener('click', init);