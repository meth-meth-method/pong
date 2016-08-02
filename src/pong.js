class Vec
{
    constructor(x = 0, y = 0)
    {
        this.x = x;
        this.y = y;
    }
}

class Rect
{
    constructor(x = 0, y = 0)
    {
        this.pos = new Vec(0, 0);
        this.size = new Vec(x, y);
    }
}

class Ball extends Rect
{
    constructor()
    {
        super(10, 10);
        this.vel = new Vec;
    }
}

class Player extends Rect
{
    constructor()
    {
        super(20, 100);
        this.score = 0;
    }
}

class Pong
{
    constructor(canvas)
    {
        this._canvas = canvas;
        this._context = canvas.getContext('2d');
    }
    draw()
    {
        this._context.fillStyle = '#000';
        this._context.fillRect(0, 0, this._canvas.width, this._canvas.height);
    }
}

const canvas = document.querySelector('#pong');
const pong = new Pong(canvas);
pong.draw();
