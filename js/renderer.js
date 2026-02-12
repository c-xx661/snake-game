// 界面渲染模块
class Renderer {
    constructor(canvasId, game) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.game = game;
        
        // 初始化Canvas尺寸
        this.initCanvas();
        
        // 响应式布局
        this.setupResponsiveLayout();
        
        // 颜色配置
        this.colors = {
            snake: '#4CAF50',
            snakeHead: '#388E3C',
            food: '#F44336',
            background: '#f9f9f9',
            grid: '#e0e0e0'
        };
    }
    
    // 初始化Canvas尺寸
    initCanvas() {
        const config = this.game.config;
        this.canvas.width = config.canvasWidth;
        this.canvas.height = config.canvasHeight;
    }
    
    // 设置响应式布局
    setupResponsiveLayout() {
        const canvasContainer = this.canvas.parentElement;
        
        const resizeCanvas = () => {
            const containerWidth = canvasContainer.clientWidth;
            const containerHeight = window.innerHeight * 0.7;
            const maxSize = Math.min(containerWidth, containerHeight, 500);
            
            this.canvas.style.width = `${maxSize}px`;
            this.canvas.style.height = `${maxSize}px`;
        };
        
        // 初始调整
        resizeCanvas();
        
        // 窗口大小变化时调整
        window.addEventListener('resize', resizeCanvas);
    }
    
    // 渲染游戏
    render() {
        const gameState = this.game.getState();
        const config = gameState.config;
        
        // 清空画布
        this.clearCanvas();
        
        // 绘制网格
        this.drawGrid();
        
        // 绘制食物
        this.drawFood(gameState.food, config.gridSize);
        
        // 绘制道具
        if (this.game.powerUps && this.game.powerUps.length > 0) {
            this.game.powerUps.forEach(powerUp => {
                this.drawPowerUp(powerUp, config.gridSize);
            });
        }
        
        // 绘制蛇
        this.drawSnake(gameState.snake, config.gridSize);
    }
    
    // 清空画布
    clearCanvas() {
        this.ctx.fillStyle = this.colors.background;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    // 绘制网格
    drawGrid() {
        const config = this.game.config;
        const gridSize = config.gridSize;
        
        this.ctx.strokeStyle = this.colors.grid;
        this.ctx.lineWidth = 0.5;
        
        // 绘制垂直线
        for (let x = 0; x <= config.canvasWidth; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, config.canvasHeight);
            this.ctx.stroke();
        }
        
        // 绘制水平线
        for (let y = 0; y <= config.canvasHeight; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(config.canvasWidth, y);
            this.ctx.stroke();
        }
    }
    
    // 绘制蛇
    drawSnake(snake, gridSize) {
        // 绘制蛇身
        snake.body.forEach((segment, index) => {
            if (index === 0) {
                // 绘制蛇头
                this.drawSnakeHead(segment, gridSize);
            } else {
                // 绘制蛇身
                this.drawSnakeSegment(segment, gridSize);
            }
        });
    }
    
    // 绘制蛇头
    drawSnakeHead(head, gridSize) {
        this.ctx.fillStyle = this.colors.snakeHead;
        this.ctx.fillRect(head.x * gridSize, head.y * gridSize, gridSize, gridSize);
        
        // 绘制蛇眼
        this.ctx.fillStyle = '#fff';
        const eyeSize = gridSize * 0.2;
        const eyeOffset = gridSize * 0.3;
        
        switch (this.game.snake.direction) {
            case 'up':
                this.ctx.fillRect(head.x * gridSize + eyeOffset, head.y * gridSize + eyeOffset, eyeSize, eyeSize);
                this.ctx.fillRect(head.x * gridSize + gridSize - eyeOffset - eyeSize, head.y * gridSize + eyeOffset, eyeSize, eyeSize);
                break;
            case 'down':
                this.ctx.fillRect(head.x * gridSize + eyeOffset, head.y * gridSize + gridSize - eyeOffset - eyeSize, eyeSize, eyeSize);
                this.ctx.fillRect(head.x * gridSize + gridSize - eyeOffset - eyeSize, head.y * gridSize + gridSize - eyeOffset - eyeSize, eyeSize, eyeSize);
                break;
            case 'left':
                this.ctx.fillRect(head.x * gridSize + eyeOffset, head.y * gridSize + eyeOffset, eyeSize, eyeSize);
                this.ctx.fillRect(head.x * gridSize + eyeOffset, head.y * gridSize + gridSize - eyeOffset - eyeSize, eyeSize, eyeSize);
                break;
            case 'right':
                this.ctx.fillRect(head.x * gridSize + gridSize - eyeOffset - eyeSize, head.y * gridSize + eyeOffset, eyeSize, eyeSize);
                this.ctx.fillRect(head.x * gridSize + gridSize - eyeOffset - eyeSize, head.y * gridSize + gridSize - eyeOffset - eyeSize, eyeSize, eyeSize);
                break;
        }
    }
    
    // 绘制蛇身段
    drawSnakeSegment(segment, gridSize) {
        this.ctx.fillStyle = this.colors.snake;
        this.ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
        
        // 添加边框效果
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
    }
    
    // 绘制食物
    drawFood(food, gridSize) {
        this.ctx.fillStyle = this.colors.food;
        
        // 绘制圆形食物
        this.ctx.beginPath();
        this.ctx.arc(
            food.x * gridSize + gridSize / 2,
            food.y * gridSize + gridSize / 2,
            gridSize / 2,
            0,
            Math.PI * 2
        );
        this.ctx.fill();
        
        // 添加发光效果
        this.ctx.shadowColor = this.colors.food;
        this.ctx.shadowBlur = 10;
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
    }
    
    // 绘制道具
    drawPowerUp(powerUp, gridSize) {
        // 设置道具颜色
        this.ctx.fillStyle = powerUp.color;
        
        // 绘制道具形状
        this.ctx.beginPath();
        // 根据道具类型绘制不同形状
        switch (powerUp.type) {
            case 'speed':
            case 'slow':
                // 绘制闪电形状（简化为三角形）
                this.ctx.moveTo(powerUp.x * gridSize + gridSize / 2, powerUp.y * gridSize);
                this.ctx.lineTo(powerUp.x * gridSize, powerUp.y * gridSize + gridSize);
                this.ctx.lineTo(powerUp.x * gridSize + gridSize, powerUp.y * gridSize + gridSize);
                this.ctx.closePath();
                break;
            case 'grow':
            case 'shrink':
                // 绘制方形
                this.ctx.rect(powerUp.x * gridSize + gridSize * 0.25, powerUp.y * gridSize + gridSize * 0.25, gridSize * 0.5, gridSize * 0.5);
                break;
            case 'score':
                // 绘制星形（简化为五边形）
                this.ctx.moveTo(powerUp.x * gridSize + gridSize / 2, powerUp.y * gridSize);
                this.ctx.lineTo(powerUp.x * gridSize + gridSize, powerUp.y * gridSize + gridSize * 0.3);
                this.ctx.lineTo(powerUp.x * gridSize + gridSize * 0.7, powerUp.y * gridSize + gridSize);
                this.ctx.lineTo(powerUp.x * gridSize + gridSize * 0.3, powerUp.y * gridSize + gridSize);
                this.ctx.lineTo(powerUp.x * gridSize, powerUp.y * gridSize + gridSize * 0.3);
                this.ctx.closePath();
                break;
            default:
                // 绘制圆形
                this.ctx.arc(
                    powerUp.x * gridSize + gridSize / 2,
                    powerUp.y * gridSize + gridSize / 2,
                    gridSize * 0.4,
                    0,
                    Math.PI * 2
                );
                break;
        }
        this.ctx.fill();
        
        // 添加发光效果
        this.ctx.shadowColor = powerUp.color;
        this.ctx.shadowBlur = 15;
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
        
        // 添加闪烁效果
        const pulse = Math.sin(Date.now() * 0.005) * 0.3 + 0.7;
        this.ctx.globalAlpha = pulse;
        this.ctx.fillStyle = '#fff';
        this.ctx.beginPath();
        this.ctx.arc(
            powerUp.x * gridSize + gridSize / 2,
            powerUp.y * gridSize + gridSize / 2,
            gridSize * 0.2,
            0,
            Math.PI * 2
        );
        this.ctx.fill();
        this.ctx.globalAlpha = 1;
    }
    
    // 更新得分显示
    updateScore(score) {
        const scoreElement = document.getElementById('score');
        if (scoreElement) {
            scoreElement.textContent = score;
        }
    }
    
    // 显示游戏结束界面
    showGameOver(score) {
        const gameOverElement = document.getElementById('gameOver');
        const finalScoreElement = document.getElementById('finalScore');
        
        if (finalScoreElement) {
            finalScoreElement.textContent = score;
        }
        
        if (gameOverElement) {
            gameOverElement.style.display = 'block';
        }
    }
    
    // 隐藏游戏结束界面
    hideGameOver() {
        const gameOverElement = document.getElementById('gameOver');
        if (gameOverElement) {
            gameOverElement.style.display = 'none';
        }
    }
    
    // 更新按钮状态
    updateButtonStates(gameState) {
        const startBtn = document.getElementById('startBtn');
        const pauseBtn = document.getElementById('pauseBtn');
        const restartBtn = document.getElementById('restartBtn');
        
        if (startBtn) {
            startBtn.disabled = gameState.running && !gameState.paused;
        }
        
        if (pauseBtn) {
            pauseBtn.disabled = !gameState.running || gameState.gameOver;
            pauseBtn.textContent = gameState.paused ? '继续' : '暂停';
        }
        
        if (restartBtn) {
            restartBtn.disabled = !gameState.running && !gameState.gameOver;
        }
    }
    
    // 注册游戏事件监听器
    registerGameListeners() {
        // 游戏开始
        this.game.on('gameStart', () => {
            this.hideGameOver();
            this.updateButtonStates(this.game.getState());
        });
        
        // 游戏暂停
        this.game.on('gamePause', () => {
            this.updateButtonStates(this.game.getState());
        });
        
        // 游戏恢复
        this.game.on('gameResume', () => {
            this.updateButtonStates(this.game.getState());
        });
        
        // 得分更新
        this.game.on('scoreUpdate', (score) => {
            this.updateScore(score);
        });
        
        // 游戏结束
        this.game.on('gameOver', (score) => {
            this.showGameOver(score);
            this.updateButtonStates(this.game.getState());
        });
    }
    
    // 启动渲染循环
    startRenderLoop() {
        let lastRenderTime = 0;
        const renderInterval = 16; // 约60fps
        
        const renderLoop = (timestamp) => {
            // 控制渲染帧率，避免过度渲染
            if (timestamp - lastRenderTime >= renderInterval) {
                this.render();
                lastRenderTime = timestamp;
            }
            
            // 持续渲染循环
            requestAnimationFrame(renderLoop);
        };
        
        renderLoop(0);
    }
}

// 导出Renderer类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Renderer;
} else {
    window.Renderer = Renderer;
}