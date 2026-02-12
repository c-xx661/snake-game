// 游戏逻辑核心模块
class Game {
    constructor(config = {}) {
        // 游戏配置
        this.config = {
            gridSize: config.gridSize || 20,
            initialSpeed: config.initialSpeed || 10,
            speedIncrease: config.speedIncrease || 0.5,
            canvasWidth: config.canvasWidth || 500,
            canvasHeight: config.canvasHeight || 500,
            gameMode: config.gameMode || 'classic',
            ...config
        };
        
        // 游戏状态
        this.state = {
            running: false,
            paused: false,
            gameOver: false,
            score: 0,
            speed: this.config.initialSpeed
        };
        
        // 蛇的初始位置和方向
        this.snake = {
            body: [
                { x: 10, y: 10 },
                { x: 9, y: 10 },
                { x: 8, y: 10 }
            ],
            direction: 'right',
            nextDirection: 'right'
        };
        
        // 食物
        this.food = this.generateFood();
        
        // 道具
        this.powerUps = [];
        this.powerUpSpawnRate = 0.05; // 5% 的概率生成道具
        this.powerUpLifetime = 15000; // 道具生命周期（毫秒）
        
        // 游戏循环
        this.gameLoopId = null;
        
        // 事件监听器
        this.eventListeners = {
            gameOver: [],
            scoreUpdate: [],
            gameStart: [],
            gamePause: [],
            gameResume: []
        };
    }
    
    // 生成食物
    generateFood() {
        let food;
        do {
            food = {
                x: Math.floor(Math.random() * (this.config.canvasWidth / this.config.gridSize)),
                y: Math.floor(Math.random() * (this.config.canvasHeight / this.config.gridSize))
            };
        } while (this.checkFoodCollision(food));
        
        return food;
    }
    
    // 检查食物是否与蛇身碰撞
    checkFoodCollision(food) {
        return this.snake.body.some(segment => {
            return segment.x === food.x && segment.y === food.y;
        });
    }
    
    // 生成道具
    generatePowerUp() {
        const powerUpTypes = [
            { type: 'speed', name: '速度提升', duration: 5000, color: '#2196F3' },
            { type: 'slow', name: '速度减缓', duration: 5000, color: '#FF9800' },
            { type: 'grow', name: '身体增长', duration: 0, color: '#4CAF50' },
            { type: 'shrink', name: '身体缩短', duration: 0, color: '#9C27B0' },
            { type: 'score', name: '分数加倍', duration: 10000, color: '#FFEB3B' }
        ];
        
        let powerUp;
        do {
            powerUp = {
                x: Math.floor(Math.random() * (this.config.canvasWidth / this.config.gridSize)),
                y: Math.floor(Math.random() * (this.config.canvasHeight / this.config.gridSize)),
                ...powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)],
                spawnTime: Date.now()
            };
        } while (this.checkPowerUpCollision(powerUp));
        
        return powerUp;
    }
    
    // 检查道具是否与蛇身或食物碰撞
    checkPowerUpCollision(powerUp) {
        // 检查与蛇身碰撞
        if (this.snake.body.some(segment => {
            return segment.x === powerUp.x && segment.y === powerUp.y;
        })) {
            return true;
        }
        
        // 检查与食物碰撞
        if (powerUp.x === this.food.x && powerUp.y === this.food.y) {
            return true;
        }
        
        // 检查与其他道具碰撞
        if (this.powerUps.some(existingPowerUp => {
            return existingPowerUp.x === powerUp.x && existingPowerUp.y === powerUp.y;
        })) {
            return true;
        }
        
        return false;
    }
    
    // 开始游戏
    start() {
        if (!this.state.running && !this.state.gameOver) {
            this.state.running = true;
            this.state.paused = false;
            this.gameLoopId = setInterval(() => this.update(), 1000 / this.state.speed);
            this.notifyListeners('gameStart');
        }
    }
    
    // 暂停游戏
    pause() {
        if (this.state.running && !this.state.paused && !this.state.gameOver) {
            this.state.paused = true;
            clearInterval(this.gameLoopId);
            this.notifyListeners('gamePause');
        }
    }
    
    // 恢复游戏
    resume() {
        if (this.state.running && this.state.paused && !this.state.gameOver) {
            this.state.paused = false;
            this.gameLoopId = setInterval(() => this.update(), 1000 / this.state.speed);
            this.notifyListeners('gameResume');
        }
    }
    
    // 重新开始游戏
    restart() {
        // 重置游戏状态
        this.state = {
            running: false,
            paused: false,
            gameOver: false,
            score: 0,
            speed: this.config.initialSpeed
        };
        
        // 重置蛇
        this.snake = {
            body: [
                { x: 10, y: 10 },
                { x: 9, y: 10 },
                { x: 8, y: 10 }
            ],
            direction: 'right',
            nextDirection: 'right'
        };
        
        // 生成新食物
        this.food = this.generateFood();
        
        // 清除游戏循环
        if (this.gameLoopId) {
            clearInterval(this.gameLoopId);
            this.gameLoopId = null;
        }
    }
    
    // 更新游戏状态
    update() {
        if (!this.state.running || this.state.paused || this.state.gameOver) return;
        
        // 更新方向
        this.snake.direction = this.snake.nextDirection;
        
        // 计算新的蛇头位置
        const head = { ...this.snake.body[0] };
        switch (this.snake.direction) {
            case 'up':
                head.y--;
                break;
            case 'down':
                head.y++;
                break;
            case 'left':
                head.x--;
                break;
            case 'right':
                head.x++;
                break;
        }
        
        // 检查碰撞
        if (this.checkCollision(head)) {
            this.endGame();
            return;
        }
        
        // 检查是否吃到食物
        if (head.x === this.food.x && head.y === this.food.y) {
            // 增加分数
            this.state.score += 10;
            
            // 增加速度
            this.state.speed += this.config.speedIncrease;
            
            // 生成新食物
            this.food = this.generateFood();
            
            // 通知分数更新
            this.notifyListeners('scoreUpdate', this.state.score);
            
            // 播放吃到食物音效
            this.notifyListeners('eatFood');
            
            // 更新游戏速度
            clearInterval(this.gameLoopId);
            this.gameLoopId = setInterval(() => this.update(), 1000 / this.state.speed);
        } else {
            // 移除蛇尾
            this.snake.body.pop();
        }
        
        // 添加新的蛇头
        this.snake.body.unshift(head);
        
        // 道具系统
        if (this.config.gameMode === '道具模式') {
            // 随机生成道具
            this.trySpawnPowerUp();
            
            // 检查是否吃到道具
            this.checkPowerUpCollisionWithSnake(head);
            
            // 清理过期道具
            this.cleanUpPowerUps();
        }
    }
    
    // 检查碰撞
    checkCollision(head) {
        const gridWidth = this.config.canvasWidth / this.config.gridSize;
        const gridHeight = this.config.canvasHeight / this.config.gridSize;
        
        // 边界碰撞处理
        if (this.config.gameMode === '无尽模式') {
            // 无尽模式：边界穿越
            if (head.x < 0) {
                head.x = gridWidth - 1;
            } else if (head.x >= gridWidth) {
                head.x = 0;
            } else if (head.y < 0) {
                head.y = gridHeight - 1;
            } else if (head.y >= gridHeight) {
                head.y = 0;
            }
        } else {
            // 其他模式：边界碰撞游戏结束
            if (
                head.x < 0 ||
                head.x >= gridWidth ||
                head.y < 0 ||
                head.y >= gridHeight
            ) {
                return true;
            }
        }
        
        // 自身碰撞
        for (let i = 1; i < this.snake.body.length; i++) {
            if (head.x === this.snake.body[i].x && head.y === this.snake.body[i].y) {
                return true;
            }
        }
        
        return false;
    }
    
    // 结束游戏
    endGame() {
        this.state.running = false;
        this.state.gameOver = true;
        clearInterval(this.gameLoopId);
        this.notifyListeners('gameOver', this.state.score);
    }
    
    // 改变方向
    changeDirection(direction) {
        // 防止直接反向移动
        const oppositeDirections = {
            up: 'down',
            down: 'up',
            left: 'right',
            right: 'left'
        };
        
        if (direction !== oppositeDirections[this.snake.direction]) {
            this.snake.nextDirection = direction;
        }
    }
    
    // 添加事件监听器
    on(event, callback) {
        if (this.eventListeners[event]) {
            this.eventListeners[event].push(callback);
        }
    }
    
    // 移除事件监听器
    off(event, callback) {
        if (this.eventListeners[event]) {
            this.eventListeners[event] = this.eventListeners[event].filter(cb => cb !== callback);
        }
    }
    
    // 通知事件监听器
    notifyListeners(event, data) {
        if (this.eventListeners[event]) {
            this.eventListeners[event].forEach(callback => callback(data));
        }
    }
    
    // 获取游戏状态
    getState() {
        return {
            ...this.state,
            snake: { ...this.snake },
            food: { ...this.food },
            config: { ...this.config }
        };
    }
    
    // 设置游戏配置
    setConfig(config) {
        this.config = { ...this.config, ...config };
    }
    
    // 设置游戏速度
    setSpeed(speed) {
        const newSpeed = Math.max(1, Math.min(30, speed)); // 限制速度范围
        this.state.speed = newSpeed;
        
        // 如果游戏正在运行，更新游戏循环
        if (this.state.running && !this.state.paused) {
            clearInterval(this.gameLoopId);
            this.gameLoopId = setInterval(() => this.update(), 1000 / this.state.speed);
        }
        
        // 更新初始速度配置，以便重新开始游戏时使用
        this.config.initialSpeed = newSpeed;
    }
    
    // 设置游戏模式
    setGameMode(gameMode) {
        this.config.gameMode = gameMode;
    }
    
    // 尝试生成道具
    trySpawnPowerUp() {
        if (Math.random() < this.powerUpSpawnRate) {
            const powerUp = this.generatePowerUp();
            this.powerUps.push(powerUp);
        }
    }
    
    // 检查蛇是否吃到道具
    checkPowerUpCollisionWithSnake(head) {
        for (let i = 0; i < this.powerUps.length; i++) {
            const powerUp = this.powerUps[i];
            if (head.x === powerUp.x && head.y === powerUp.y) {
                // 吃到道具，处理效果
                this.handlePowerUp(powerUp);
                // 从数组中移除道具
                this.powerUps.splice(i, 1);
                break;
            }
        }
    }
    
    // 清理过期道具
    cleanUpPowerUps() {
        const currentTime = Date.now();
        this.powerUps = this.powerUps.filter(powerUp => {
            return currentTime - powerUp.spawnTime < this.powerUpLifetime;
        });
    }
    
    // 处理道具效果
    handlePowerUp(powerUp) {
        console.log('吃到道具:', powerUp.name);
        // 播放吃到道具音效
        this.notifyListeners('eatPowerUp');
        
        switch (powerUp.type) {
            case 'speed':
                // 速度提升
                this.state.speed *= 1.5;
                // 更新游戏速度
                clearInterval(this.gameLoopId);
                this.gameLoopId = setInterval(() => this.update(), 1000 / this.state.speed);
                break;
                
            case 'slow':
                // 速度减缓
                this.state.speed *= 0.7;
                // 更新游戏速度
                clearInterval(this.gameLoopId);
                this.gameLoopId = setInterval(() => this.update(), 1000 / this.state.speed);
                break;
                
            case 'grow':
                // 身体增长
                for (let i = 0; i < 3; i++) {
                    const tail = { ...this.snake.body[this.snake.body.length - 1] };
                    this.snake.body.push(tail);
                }
                break;
                
            case 'shrink':
                // 身体缩短
                for (let i = 0; i < 3 && this.snake.body.length > 3; i++) {
                    this.snake.body.pop();
                }
                break;
                
            case 'score':
                // 分数加倍
                this.state.score += 50;
                this.notifyListeners('scoreUpdate', this.state.score);
                break;
        }
    }
}

// 导出Game类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Game;
} else {
    window.Game = Game;
}