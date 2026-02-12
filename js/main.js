// 主入口文件
window.addEventListener('DOMContentLoaded', () => {
    // 初始化游戏配置
    const gameConfig = {
        gridSize: 20,
        initialSpeed: 10,
        speedIncrease: 0.5,
        canvasWidth: 500,
        canvasHeight: 500
    };
    
    // 创建音效管理器实例
    const audioManager = new AudioManager();
    
    // 创建游戏实例
    const game = new Game(gameConfig);
    
    // 创建渲染器实例
    const renderer = new Renderer('gameCanvas', game);
    
    // 创建控制器实例
    const controls = new Controls(game, renderer, audioManager);
    
    // 注册游戏事件监听器到渲染器
    renderer.registerGameListeners();
    
    // 注册游戏事件监听器到音效管理器
    game.on('gameStart', () => audioManager.play('gameStart'));
    game.on('gameOver', () => audioManager.play('gameOver'));
    game.on('eatFood', () => audioManager.play('eatFood'));
    game.on('eatPowerUp', () => audioManager.play('eatPowerUp'));
    
    // 启动渲染循环
    renderer.startRenderLoop();
    
    // 初始渲染
    renderer.render();
    
    console.log('贪吃蛇游戏初始化完成！');
    console.log('使用方向键或WASD键控制蛇的移动');
    console.log('按空格键开始/暂停游戏');
});