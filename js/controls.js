// 用户交互模块
class Controls {
    constructor(game, renderer, audioManager = null) {
        this.game = game;
        this.renderer = renderer;
        this.audioManager = audioManager;
        
        // 键盘映射
        this.keyMap = {
            37: 'left',
            38: 'up',
            39: 'right',
            40: 'down',
            // WASD 键支持
            65: 'left',
            87: 'up',
            68: 'right',
            83: 'down'
        };
        
        // 按钮元素
        this.buttons = {
            start: document.getElementById('startBtn'),
            pause: document.getElementById('pauseBtn'),
            restart: document.getElementById('restartBtn'),
            playAgain: document.getElementById('playAgainBtn')
        };
        
        // 其他UI元素
        this.uiElements = {
            speedSlider: document.getElementById('speedSlider'),
            speedValue: document.getElementById('speedValue'),
            gameModeSelect: document.getElementById('gameModeSelect')
        };
        
        // 初始化事件监听器
        this.initEventListeners();
    }
    
    // 初始化事件监听器
    initEventListeners() {
        // 键盘事件
        this.setupKeyboardListeners();
        
        // 按钮事件
        this.setupButtonListeners();
        
        // 触摸设备支持
        this.setupTouchListeners();
        
        // 游戏设置事件
        this.setupSettingsListeners();
    }
    
    // 设置键盘事件监听器
    setupKeyboardListeners() {
        // 键盘按下事件
        document.addEventListener('keydown', (event) => {
            this.handleKeyDown(event);
        });
        
        // 键盘释放事件（可选，用于特殊控制）
        document.addEventListener('keyup', (event) => {
            this.handleKeyUp(event);
        });
    }
    
    // 处理键盘按下事件
    handleKeyDown(event) {
        const keyCode = event.keyCode;
        const direction = this.keyMap[keyCode];
        
        if (direction) {
            // 防止页面滚动
            event.preventDefault();
            
            // 改变蛇的方向
            this.game.changeDirection(direction);
        }
        
        // 空格键控制游戏开始/暂停
        if (keyCode === 32) {
            event.preventDefault();
            this.toggleGame();
        }
    }
    
    // 处理键盘释放事件
    handleKeyUp(event) {
        // 这里可以添加需要在按键释放时处理的逻辑
    }
    
    // 设置按钮事件监听器
    setupButtonListeners() {
        // 播放按钮点击音效的辅助函数
        const playButtonSound = () => {
            if (this.audioManager) {
                this.audioManager.play('buttonClick');
            }
        };
        
        // 开始按钮
        if (this.buttons.start) {
            this.buttons.start.addEventListener('click', () => {
                playButtonSound();
                this.game.start();
            });
        }
        
        // 暂停按钮
        if (this.buttons.pause) {
            this.buttons.pause.addEventListener('click', () => {
                playButtonSound();
                this.togglePause();
            });
        }
        
        // 重新开始按钮
        if (this.buttons.restart) {
            this.buttons.restart.addEventListener('click', () => {
                playButtonSound();
                this.restartGame();
            });
        }
        
        // 再玩一次按钮
        if (this.buttons.playAgain) {
            this.buttons.playAgain.addEventListener('click', () => {
                playButtonSound();
                this.restartGame();
            });
        }
    }
    
    // 设置触摸设备支持
    setupTouchListeners() {
        const canvas = document.getElementById('gameCanvas');
        if (!canvas) return;
        
        let touchStartX = 0;
        let touchStartY = 0;
        let touchStartTime = 0;
        const minSwipeDistance = 10; // 最小滑动距离
        const maxSwipeTime = 500; // 最大滑动时间
        
        // 防止页面滚动
        canvas.addEventListener('touchmove', (event) => {
            event.preventDefault();
        }, { passive: false });
        
        // 触摸开始
        canvas.addEventListener('touchstart', (event) => {
            event.preventDefault();
            const touch = event.touches[0];
            touchStartX = touch.clientX;
            touchStartY = touch.clientY;
            touchStartTime = Date.now();
            
            // 添加触摸反馈
            canvas.style.opacity = '0.9';
        });
        
        // 触摸结束
        canvas.addEventListener('touchend', (event) => {
            event.preventDefault();
            if (!event.changedTouches.length) return;
            
            // 恢复触摸反馈
            canvas.style.opacity = '1';
            
            const touch = event.changedTouches[0];
            const touchEndX = touch.clientX;
            const touchEndY = touch.clientY;
            const touchEndTime = Date.now();
            
            // 计算滑动方向和距离
            const deltaX = touchEndX - touchStartX;
            const deltaY = touchEndY - touchStartY;
            const deltaTime = touchEndTime - touchStartTime;
            
            // 检查滑动是否有效
            if (deltaTime < maxSwipeTime) {
                const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
                if (distance > minSwipeDistance) {
                    // 确定主要滑动方向
                    if (Math.abs(deltaX) > Math.abs(deltaY)) {
                        // 水平滑动
                        if (deltaX > 0) {
                            this.game.changeDirection('right');
                        } else {
                            this.game.changeDirection('left');
                        }
                    } else {
                        // 垂直滑动
                        if (deltaY > 0) {
                            this.game.changeDirection('down');
                        } else {
                            this.game.changeDirection('up');
                        }
                    }
                }
            }
        });
    }
    
    // 切换游戏开始/暂停
    toggleGame() {
        const gameState = this.game.getState();
        
        if (!gameState.running && !gameState.gameOver) {
            // 开始游戏
            this.game.start();
        } else if (gameState.running && !gameState.paused) {
            // 暂停游戏
            this.game.pause();
        } else if (gameState.running && gameState.paused) {
            // 恢复游戏
            this.game.resume();
        }
    }
    
    // 切换暂停状态
    togglePause() {
        const gameState = this.game.getState();
        
        if (gameState.running && !gameState.paused) {
            this.game.pause();
        } else if (gameState.running && gameState.paused) {
            this.game.resume();
        }
    }
    
    // 重新开始游戏
    restartGame() {
        // 重置游戏状态
        this.game.restart();
        
        // 隐藏游戏结束界面
        this.renderer.hideGameOver();
        
        // 更新按钮状态
        this.renderer.updateButtonStates(this.game.getState());
        
        // 重置得分显示
        this.renderer.updateScore(0);
    }
    
    // 禁用所有控制
    disableControls() {
        // 禁用按钮
        Object.values(this.buttons).forEach(button => {
            if (button) {
                button.disabled = true;
            }
        });
        
        // 这里可以添加禁用键盘事件的逻辑
    }
    
    // 启用所有控制
    enableControls() {
        // 更新按钮状态
        this.renderer.updateButtonStates(this.game.getState());
        
        // 这里可以添加启用键盘事件的逻辑
    }
    
    // 设置游戏设置事件监听器
    setupSettingsListeners() {
        // 速度滑块事件
        if (this.uiElements.speedSlider && this.uiElements.speedValue) {
            this.uiElements.speedSlider.addEventListener('input', (event) => {
                const speed = parseInt(event.target.value);
                this.uiElements.speedValue.textContent = speed;
                this.game.setSpeed(speed);
            });
        }
        
        // 游戏模式选择事件
        if (this.uiElements.gameModeSelect) {
            this.uiElements.gameModeSelect.addEventListener('change', (event) => {
                const gameMode = event.target.value;
                this.handleGameModeChange(gameMode);
            });
        }
    }
    
    // 处理游戏模式变更
    handleGameModeChange(gameMode) {
        console.log('游戏模式变更为:', gameMode);
        // 设置游戏模式
        this.game.setGameMode(gameMode);
        // 重新开始游戏以应用新的游戏模式
        this.restartGame();
    }
}

// 导出Controls类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Controls;
} else {
    window.Controls = Controls;
}