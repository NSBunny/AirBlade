/**
 * Fruit Ninja Web Edition - Game Engine
 */

const CONFIG = {
    INITIAL_SPAWN_INTERVAL: 1150,
    MIN_SPAWN_INTERVAL: 280,
    SPAWN_ACCELERATION: 17,
    GRAVITY: 1850.0,
    FRUIT_MIN_RADIUS: 32,
    FRUIT_MAX_RADIUS: 68,
    SLICE_SPEED_THRESHOLD: 300,
    STARTING_LIVES: 3,
    COMBO_WINDOW: 1100,
    MAX_COMBO: 4.5,
    TRAIL_HISTORY: 18,
    BOMB_PROBABILITY_BASE: 0.03,
    BOMB_PROBABILITY_GAIN: 0.002,
    BOMB_PROBABILITY_CAP: 0.2,
    ASSET_PATH: 'static/assets/'
};

const FRUIT_CATALOG = [
    { name: "apple.png", scale: 0.85, value: 11 },
    { name: "banana.png", scale: 0.95, value: 10 },
    { name: "grapes.png", scale: 0.85, value: 12 },
    { name: "watermelon.png", scale: 1.25, value: 15 },
    { name: "strawberry.png", scale: 0.8, value: 13 },
    { name: "pineapple.png", scale: 1.35, value: 16 },
    { name: "orange.png", scale: 0.9, value: 9 },
    { name: "peach.png", scale: 0.95, value: 12 },
    { name: "cherries.png", scale: 0.75, value: 11 },
    { name: "mango.png", scale: 1.0, value: 14 },
    { name: "kiwi.png", scale: 0.8, value: 11 },
    { name: "pear.png", scale: 0.95, value: 10 },
    { name: "lemon.png", scale: 0.85, value: 9 },
    { name: "melon.png", scale: 1.15, value: 14 },
    { name: "blueberries.png", scale: 0.75, value: 13 },
];

class Fruit {
    constructor(kind, x, y, vx, vy, radius, spriteName, value) {
        this.kind = kind;
        this.position = { x, y };
        this.velocity = { x: vx, y: vy };
        this.radius = radius;
        this.spriteName = spriteName;
        this.value = value;
        this.bornAt = Date.now();
        this.slicedAt = null;
        this.removed = false;

        this.image = new Image();
        this.image.src = CONFIG.ASSET_PATH + spriteName;
    }

    isBomb() {
        return this.kind === "bomb";
    }

    update(dt) {
        this.velocity.y += CONFIG.GRAVITY * dt;
        this.position.x += this.velocity.x * dt;
        this.position.y += this.velocity.y * dt;

        const now = Date.now();
        if (this.slicedAt && now - this.slicedAt > 600) {
            this.removed = true;
        }
    }
}

class Splash {
    constructor(x, y, color, bornAt) {
        this.position = { x, y };
        this.color = color;
        this.bornAt = bornAt;
        this.duration = 400;
    }

    getAlpha(now) {
        const progress = (now - this.bornAt) / this.duration;
        return Math.max(0, 1 - progress);
    }
}

class FruitNinjaGame {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;

        this.fruits = [];
        this.splashes = [];
        this.popups = [];
        this.fingerHistory = []; // {x, y, t}

        this.score = 0;
        this.bestScore = 0;
        this.lives = CONFIG.STARTING_LIVES;
        this.gameOver = false;
        this.combo = 1.0;
        this.comboChain = 0;
        this.lastSliceTime = 0;
        this.lastFrameTime = Date.now();
        this.lastSpawnTime = Date.now();

        this.indexFingerPos = null;
    }

    reset() {
        this.fruits = [];
        this.splashes = [];
        this.popups = [];
        this.fingerHistory = [];
        this.score = 0;
        this.lives = CONFIG.STARTING_LIVES;
        this.gameOver = false;
        this.combo = 1.0;
        this.comboChain = 0;
        this.lastSliceTime = 0;
        this.lastSpawnTime = Date.now();
    }

    update() {
        if (this.gameOver) return;

        const now = Date.now();
        const dt = (now - this.lastFrameTime) / 1000;
        this.lastFrameTime = now;

        this._spawnIfNeeded(now);
        this._updateFruits(dt, now);
        this._detectSlices(now);
        this._prune(now);
    }

    _spawnIfNeeded(now) {
        const interval = Math.max(
            CONFIG.MIN_SPAWN_INTERVAL,
            CONFIG.INITIAL_SPAWN_INTERVAL - this.score * CONFIG.SPAWN_ACCELERATION
        );

        if (now - this.lastSpawnTime >= interval) {
            this._spawnFruit(now);
            this.lastSpawnTime = now;
        }
    }

    _spawnFruit(now) {
        const bombChance = Math.min(
            CONFIG.BOMB_PROBABILITY_CAP,
            CONFIG.BOMB_PROBABILITY_BASE + this.score * CONFIG.BOMB_PROBABILITY_GAIN
        );
        const isBomb = Math.random() < bombChance;

        let kind, spriteName, value, sizeScale;
        if (isBomb) {
            kind = "bomb";
            spriteName = "bomb.png";
            value = 0;
            sizeScale = 1.1;
        } else {
            const item = FRUIT_CATALOG[Math.floor(Math.random() * FRUIT_CATALOG.length)];
            kind = "fruit";
            spriteName = item.name;
            value = item.value;
            sizeScale = item.scale;
        }

        const radius = (CONFIG.FRUIT_MIN_RADIUS + Math.random() * (CONFIG.FRUIT_MAX_RADIUS - CONFIG.FRUIT_MIN_RADIUS)) * sizeScale;
        const x = radius + Math.random() * (this.width - 2 * radius);
        const y = this.height + radius + 10;

        const apex = this.height * (0.15 + Math.random() * 0.25);
        const verticalDistance = Math.max(90, y - apex);
        const vy = -Math.sqrt(2 * CONFIG.GRAVITY * verticalDistance) * (0.92 + Math.random() * 0.13);
        const vx = (Math.random() * 640 - 320) * (1 + this.score * 0.003);

        this.fruits.push(new Fruit(kind, x, y, vx, vy, radius, spriteName, value));
    }

    _updateFruits(dt, now) {
        this.fruits.forEach(f => {
            f.update(dt);
            if (f.position.y - f.radius > this.height + f.radius) {
                f.removed = true;
                if (!f.isBomb() && !f.slicedAt) {
                    this._registerMiss();
                }
            }
        });
    }

    _registerMiss() {
        this.lives--;
        this.combo = 1.0;
        if (this.lives <= 0) {
            this.gameOver = true;
        }
    }

    _detectSlices(now) {
        if (this.fingerHistory.length < 2) return;

        this.fruits.forEach(fruit => {
            if (fruit.slicedAt) return;

            for (let i = 0; i < this.fingerHistory.length - 1; i++) {
                const p1 = this.fingerHistory[i];
                const p2 = this.fingerHistory[i + 1];
                const dt = (p2.t - p1.t) / 1000;
                if (dt <= 0) continue;

                const dist = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
                const speed = dist / dt;

                if (speed < CONFIG.SLICE_SPEED_THRESHOLD) continue;

                const dToFruit = this._distToSegment(fruit.position, p1, p2);
                if (dToFruit <= fruit.radius * 1.1) {
                    this._sliceFruit(fruit, now);
                    break;
                }
            }
        });
    }

    _sliceFruit(fruit, now) {
        fruit.slicedAt = now;
        const color = fruit.isBomb() ? 'red' : 'green';
        this.splashes.push(new Splash(fruit.position.x, fruit.position.y, color, now));

        if (fruit.isBomb()) {
            this.popups.push({ text: "BOMB!", x: fruit.position.x, y: fruit.position.y, t: now, color: 'red' });
            this.combo = 1.0;
            this.comboChain = 0;
            this.lives = 0;
            this.gameOver = true;
            return;
        }

        if (now - this.lastSliceTime < CONFIG.COMBO_WINDOW) {
            this.combo = Math.min(CONFIG.MAX_COMBO, this.combo + 0.35);
            this.comboChain++;
        } else {
            this.combo = 1.0;
            this.comboChain = 1;
        }
        this.lastSliceTime = now;

        const points = Math.floor(fruit.value * this.combo);
        this.score += points;
        this.bestScore = Math.max(this.bestScore, this.score);
        this.popups.push({ text: `+${points}`, x: fruit.position.x, y: fruit.position.y, t: now, color: 'gold' });

        if (this.comboChain >= 3) {
            this.popups.push({ text: `${this.comboChain} FRUIT COMBO!`, x: fruit.position.x, y: fruit.position.y - 60, t: now, color: 'orange' });
        }
    }

    _distToSegment(p, a, b) {
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        if (dx === 0 && dy === 0) return Math.sqrt(Math.pow(p.x - a.x, 2) + Math.pow(p.y - a.y, 2));

        let t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / (dx * dx + dy * dy);
        t = Math.max(0, Math.min(1, t));
        const projX = a.x + t * dx;
        const projY = a.y + t * dy;
        return Math.sqrt(Math.pow(p.x - projX, 2) + Math.pow(p.y - projY, 2));
    }

    _prune(now) {
        this.fruits = this.fruits.filter(f => !f.removed);
        this.splashes = this.splashes.filter(s => s.getAlpha(now) > 0.05);
        this.popups = this.popups.filter(p => (now - p.t) < 1000);

        // Remove old finger history
        const cutoff = now - 200; // Keep 200ms
        this.fingerHistory = this.fingerHistory.filter(p => p.t > cutoff);
    }

    render(videoElement, results) {
        this.ctx.save();
        this.ctx.clearRect(0, 0, this.width, this.height);

        // Draw video
        if (videoElement) {
            this.ctx.translate(this.width, 0);
            this.ctx.scale(-1, 1);
            this.ctx.drawImage(videoElement, 0, 0, this.width, this.height);
            this.ctx.restore();
        }

        // Handle Hand landmarks
        if (results && results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            const landmarks = results.multiHandLandmarks[0];
            const indexFinger = landmarks[8]; // Index finger tip
            const x = (1 - indexFinger.x) * this.width;
            const y = indexFinger.y * this.height;
            this.indexFingerPos = { x, y };
            this.fingerHistory.push({ x, y, t: Date.now() });
        } else {
            this.indexFingerPos = null;
        }

        // Draw Splashes
        const now = Date.now();
        this.splashes.forEach(s => {
            const alpha = s.getAlpha(now);
            this.ctx.beginPath();
            this.ctx.arc(s.position.x, s.position.y, 80 * alpha + 15, 0, 2 * Math.PI);
            this.ctx.strokeStyle = s.color;
            this.ctx.globalAlpha = alpha;
            this.ctx.lineWidth = 6;
            this.ctx.stroke();
            this.ctx.globalAlpha = 1;
        });

        // Draw Fruits
        this.fruits.forEach(f => {
            if (!f.image.complete) return;
            const size = f.radius * 2;
            this.ctx.drawImage(f.image, f.position.x - f.radius, f.position.y - f.radius, size, size);
            if (f.isBomb()) {
                this.ctx.beginPath();
                this.ctx.arc(f.position.x, f.position.y, f.radius * 1.1, 0, 2 * Math.PI);
                this.ctx.strokeStyle = 'red';
                this.ctx.lineWidth = 2;
                this.ctx.stroke();
            }
        });

        // Draw Trail
        if (this.fingerHistory.length > 1) {
            this.ctx.beginPath();
            this.ctx.moveTo(this.fingerHistory[0].x, this.fingerHistory[0].y);
            for (let i = 1; i < this.fingerHistory.length; i++) {
                this.ctx.lineTo(this.fingerHistory[i].x, this.fingerHistory[i].y);
            }
            this.ctx.strokeStyle = 'white';
            this.ctx.lineWidth = 4;
            this.ctx.lineCap = 'round';
            this.ctx.stroke();
        }

        // Draw Popups
        this.popups.forEach(p => {
            const age = now - p.t;
            const alpha = 1 - age / 1000;
            this.ctx.globalAlpha = alpha;
            this.ctx.fillStyle = p.color;
            this.ctx.font = 'bold 24px Outfit';
            this.ctx.fillText(p.text, p.x, p.y - (age * 0.05));
            this.ctx.globalAlpha = 1;
        });

        // UI Overlay
        this._drawUI();

        if (this.gameOver) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.fillRect(0, 0, this.width, this.height);
            this.ctx.fillStyle = 'white';
            this.ctx.font = 'bold 48px Outfit';
            this.ctx.textAlign = 'center';
            this.ctx.fillText("GAME OVER", this.width / 2, this.height / 2);
            this.ctx.font = '24px Outfit';
            this.ctx.fillText("Press Restart to try again", this.width / 2, this.height / 2 + 50);
        }
    }

    _drawUI() {
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 32px Outfit';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`Score: ${this.score}`, 20, 40);
        this.ctx.font = '20px Outfit';
        this.ctx.fillText(`Best: ${this.bestScore}`, 20, 70);

        this.ctx.textAlign = 'right';
        let livesStr = '❤️'.repeat(Math.max(0, this.lives));
        this.ctx.fillText(livesStr, this.width - 20, 40);

        if (this.combo > 1.1) {
            this.ctx.fillStyle = 'orange';
            this.ctx.font = 'bold 24px Outfit';
            this.ctx.fillText(`${this.combo.toFixed(1)}x COMBO`, this.width - 20, 75);
        }
    }
}

window.FruitNinjaGame = FruitNinjaGame;
