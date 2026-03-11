const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const WIDTH = canvas.width, HEIGHT = canvas.height;

const keys = {}, keysOnce = {};
let mousePressed = false;
document.addEventListener("keydown", e => { keys[e.key.toLowerCase()] = true; keysOnce[e.key.toLowerCase()] = true; });
document.addEventListener("keyup", e => { keys[e.key.toLowerCase()] = false; keysOnce[e.key.toLowerCase()] = false; });
canvas.addEventListener("mousedown", e => mousePressed=true);
canvas.addEventListener("mouseup", e => mousePressed=false);
function keyDown(k){ if(k==="space") k=" "; return !!keys[k.toLowerCase()]; }
function keyWentDown(k){ if(k==="space") k=" "; if(keysOnce[k.toLowerCase()]){ keysOnce[k.toLowerCase()]=false; return true; } return false; }
function mouseDown(btn="leftButton"){ return btn==="leftButton" && mousePressed; }

function randomNumber(min,max){ return Math.floor(Math.random()*(max-min+1))+min; }

function background(c){ ctx.fillStyle=c; ctx.fillRect(0,0,WIDTH,HEIGHT); }

class Sprite {
    constructor(x, y, w=50, h=50){
        this._position = {x:x, y:y};
        this.width = w;
        this.height = h;
        this.vx = 0; this.vy = 0;
        this.scale = 1;
        this.visible = true; 

        Object.defineProperty(this, 'position', {
            get: () => this._position,
            set: (p) => { 
                this._position = {...p};
                this.x = p.x; this.y = p.y;
            }
        });

        this.x = x; this.y = y;
        this.animations = {};
        this.currentAnim = null;
        this.currentImage = null;
        this.frameIndex = 0;
        this.frameCounter = 0;
        this.frameDelay = 5;
        this.playing = true;
    }

loadAnimationFromFolder(name, callback) {
    const imgs = [];
    let index = 0;
    const MAX_FRAMES = 50; 
    console.log(`Starting to load animation "${name}" from folder imgs/${name}/`);

    const tryLoad = () => {
        if (index >= MAX_FRAMES) {
            console.warn(`Stopped loading animation "${name}" after ${MAX_FRAMES} frames`);
            callback(imgs);
            return;
        }

        const img = new Image();
        img.src = `imgs/${name}/sprite_${index}.png`;
        console.log(`Trying to load: ${img.src}`);

        img.onload = () => {
            console.log(`Loaded: ${img.src}`);
            imgs.push(img);
            index++;
            tryLoad();
        }

        img.onerror = () => {
            if (imgs.length === 0) {
                console.warn(`No sprites found for animation "${name}"`);
            } else {
                console.log(`Finished loading ${imgs.length} frames for animation "${name}"`);
            }
            callback(imgs);
        }
    }

    tryLoad();
}

setAnimation(name) {
    console.log(`Setting animation: "${name}"`);

    if (this.animations[name]) {
        console.log(`Animation "${name}" already loaded, using cached frames.`);
        this.currentAnim = this.animations[name];
        this.frameIndex = 0;
        this.frameCounter = 0;
        this.currentImage = this.currentAnim[0];
        this.playing = true;
    } else {
        console.log(`Animation "${name}" not loaded yet, loading from folder...`);
        this.loadAnimationFromFolder(name, (imgs) => {
            if (imgs.length > 0) {
                console.log(`Animation "${name}" loaded successfully with ${imgs.length} frames`);
                this.animations[name] = imgs;
                this.currentAnim = imgs;
                this.frameIndex = 0;
                this.frameCounter = 0;
                this.currentImage = imgs[0];
                this.playing = true;
            } else {
                console.warn(`Failed to load animation "${name}"`);
            }
        });
    }
}

nextFrame(){
        if(!this.currentAnim) return;
        this.frameCounter++;
        if(this.frameCounter >= this.frameDelay){
            this.frameIndex = (this.frameIndex + 1) % this.currentAnim.length;
            this.currentImage = this.currentAnim[this.frameIndex];
            this.frameCounter = 0;
        }
    }
    update(){

        const externallyMoved = this._position && (
            (this._lastX !== undefined && Math.abs(this._position.x - this._lastX) > 0.001) ||
            (this._lastY !== undefined && Math.abs(this._position.y - this._lastY) > 0.001)
        );

        if(externallyMoved){
            this.x = this._position.x;
            this.y = this._position.y;
        } else {
            this.x += this.vx;
            this.y += this.vy;
            if(this._position){
                this._position.x = this.x;
                this._position.y = this.y;
            }
        }

        this._lastX = this._position ? this._position.x : this.x;
        this._lastY = this._position ? this._position.y : this.y;

        if(this.playing && this.currentAnim) this.nextFrame();
    }

draw() {
    if (!this.visible) return;

    let img = this.currentImage;

    if (img) {

        const w = this.width * this.scale * 1.05; 
        const h = this.height * this.scale;       

        ctx.drawImage(
            img,
            this.x - w / 2,
            this.y - h / 2,
            w,
            h
        );
    } else {
        const w = this.width * this.scale * 1.05;
        const h = this.height * this.scale;
        ctx.fillStyle = "orange";
        ctx.fillRect(
            this.x - w / 2,
            this.y - h / 2,
            w,
            h
        );
    }
}
isTouching(other){

        if(!other) return false;
        return (this.x < other.x + other.width &&
                this.x + this.width > other.x &&
                this.y < other.y + other.height &&
                this.y + this.height > other.y);
    }

    displace(other){
        if(this.isTouching(other)){
            this.x -= other.vx || 0;
            this.y -= other.vy || 0;
        }
    }
}

let currentFill = "white";
function fill(c){ currentFill = c; ctx.fillStyle = c; }

function textSize(s){      
    currentTextSize = s;      
    ctx.font = `${s}px Arial`;  
}

const _textState = { lastX: {}, lastY: null };

function text(txt, x, y){
    ctx.font = `${currentTextSize}px Arial`;
    ctx.fillStyle = currentFill;

    if (_textState.lastY !== y) {
        _textState.lastY = y;
        _textState.lastX[y] = x;
    }

    if (typeof txt === "number") {
        x = _textState.lastX[y] + 5; 
    }

    ctx.fillText(txt, x, y);

    _textState.lastX[y] = x + ctx.measureText(txt).width;
}
function rect(x, y, w, h){      
    ctx.fillRect(x, y, w, h);  
}

const allSprites=[];
function createSprite(x,y,w,h){ const s=new Sprite(x,y,w,h); allSprites.push(s); return s; }
function drawSprites(){ allSprites.forEach(s=>{ s.update(); s.draw(); }); }

let frameCounter=0; const DRAW_EVERY=2;
function gameLoop(){
    frameCounter++;
    if(frameCounter%DRAW_EVERY===0){ if(typeof window.draw==="function"){ try{ window.draw(); } catch(e){ console.error(e); } } }
    requestAnimationFrame(gameLoop);
}
requestAnimationFrame(gameLoop);