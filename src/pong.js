class Vec
{
    constructor(x = 0, y = 0)
    {
        this.x = x;
        this.y = y;
    }
    get len()
    {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    set len(value) {
        const f = value / this.len;
        this.x *= f;
        this.y *= f;
    }
}

class Rect
{
    constructor(x = 0, y = 0)
    {
        this.pos = new Vec(0, 0);
        this.size = new Vec(x, y);
    }
    get left()
    {
        return this.pos.x - this.size.x / 2;
    }
    get right()
    {
        return this.pos.x + this.size.x / 2;
    }
    get top()
    {
        return this.pos.y - this.size.y / 2;
    }
    get bottom()
    {
        return this.pos.y + this.size.y / 2;
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
        this.vel = new Vec;
        this.score = 0;

        this._lastPos = new Vec;
    }
    update(dt)
    {
        this.vel.y = (this.pos.y - this._lastPos.y) / dt;
        this._lastPos.y = this.pos.y;
    }
}

class Pong
{
    constructor(canvas)
    {
        this._canvas = canvas;
        this._context = canvas.getContext('2d');
        this._context.imageSmoothingEnabled = false;

        this.initialSpeed = 250;

        this.ball = new Ball;

        this.players = [
            new Player,
            new Player,
        ];

        this.players[0].pos.x = 40;
        this.players[1].pos.x = this._canvas.width - 40;
        this.players.forEach(p => p.pos.y = this._canvas.height / 2);

        let lastTime = null;
        this._frameCallback = (millis) => {
            if (lastTime !== null) {
                const diff = millis - lastTime;
                this.update(diff / 1000);
            }
            lastTime = millis;
            requestAnimationFrame(this._frameCallback);
        };

        this.CHAR_PIXEL = 10;
        this.CHARS = [
            0x7b6f, 0x2492, 0x73e7, 0x73cf, 0x5bc9,
            0x79cf, 0x79ef, 0x7249, 0x7bef, 0x7bcf,
        ].map(c => {
            const canvas = document.createElement('canvas');
            canvas.width = 3;
            canvas.height = 5;
            const context = canvas.getContext('2d');
            const img = context.getImageData(0, 0, canvas.width, canvas.height);
            const arr = new Uint32Array(img.width * img.height)
                .map((_, i) => (c & 1 << i) ? ~0 : 0).reverse();
            img.data.set(new Uint8ClampedArray(arr.buffer));
            context.putImageData(img, 0, 0);
            return canvas;
        });

        this.reset();
    }
    clear()
    {
        this._context.fillStyle = '#000';
        this._context.fillRect(0, 0, this._canvas.width, this._canvas.height);
    }
    collide(player, ball)
    {
        if (player.left < ball.right && player.right > ball.left &&
            player.top < ball.bottom && player.bottom > ball.top) {
            ball.vel.x = -ball.vel.x * 1.05;
            const len = ball.vel.len;
            ball.vel.y += player.vel.y * .2;
            ball.vel.len = len;
        }
    }
    draw()
    {
        this.clear();

        this.drawRect(this.ball);
        this.players.forEach(player => this.drawRect(player));

        this.drawScore();
    }
    drawRect(rect)
    {
        this._context.fillStyle = '#fff';
        this._context.fillRect(rect.left, rect.top, rect.size.x, rect.size.y);
    }
    drawScore()
    {
        const align = this._canvas.width / 3;
        const s = this.CHAR_PIXEL;
        const cw = s * 4;
        this.players.forEach((player, index) => {
            const chars = player.score.toString().split('');
            const offset = align * (index + 1) - (cw * chars.length / 2) + s / 2;
            chars.forEach((char, pos) => {
                const img = this.CHARS[char|0];
                this._context.drawImage(img, offset + pos * cw, 20, s * img.width, s * img.height);
            });
        });
    }
    play()
    {
        const b = this.ball;
        if (b.vel.x === 0 && b.vel.y === 0) {
            b.vel.x = 200 * (Math.random() > .5 ? 1 : -1);
            b.vel.y = 200 * (Math.random() * 2 - 1);
            b.vel.len = this.initialSpeed;
        }
    }
    reset()
    {
        const b = this.ball;
        b.vel.x = 0;
        b.vel.y = 0;
        b.pos.x = this._canvas.width / 2;
        b.pos.y = this._canvas.height / 2;
    }
    start()
    {
        requestAnimationFrame(this._frameCallback);
    }
    update(dt)
    {
        const cvs = this._canvas;
        const ball = this.ball;
        ball.pos.x += ball.vel.x * dt;
        ball.pos.y += ball.vel.y * dt;

        if (ball.right < 0 || ball.left > cvs.width) {
            ++this.players[ball.vel.x < 0 | 0].score;
            this.reset();
        }

        if (ball.vel.y < 0 && ball.top < 0 ||
            ball.vel.y > 0 && ball.bottom > cvs.height) {
            ball.vel.y = -ball.vel.y;
        }

        this.players[1].pos.y = ball.pos.y;

        this.players.forEach(player => {
            player.update(dt);
            this.collide(player, ball);
        });

        this.draw();
    }
}

const canvas = document.querySelector('#pong');
const pong = new Pong(canvas);

canvas.addEventListener('click', () => pong.play());

canvas.addEventListener('mousemove', event => {
    const scale = event.offsetY / event.target.getBoundingClientRect().height;
    pong.players[0].pos.y = canvas.height * scale;
});

pong.start();
