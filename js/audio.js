// 音效管理模块
class AudioManager {
    constructor() {
        // 创建音频上下文
        this.audioContext = null;
        this.initAudioContext();
        
        // 音效配置
        this.sounds = {
            gameStart: this.createSound({ frequency: 440, duration: 0.1, type: 'sine' }),
            gameOver: this.createSound({ frequency: 220, duration: 0.5, type: 'sine' }),
            eatFood: this.createSound({ frequency: 880, duration: 0.1, type: 'square' }),
            eatPowerUp: this.createSound({ frequency: 660, duration: 0.2, type: 'triangle' }),
            buttonClick: this.createSound({ frequency: 330, duration: 0.05, type: 'sine' })
        };
        
        // 音量控制
        this.volume = 0.5;
        
        // 移动设备音频解锁
        this.unlockAudio();
    }
    
    // 初始化音频上下文
    initAudioContext() {
        try {
            // 创建音频上下文
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.error('无法初始化音频上下文:', e);
            this.audioContext = null;
        }
    }
    
    // 解锁移动设备音频
    unlockAudio() {
        // 移动设备需要用户交互才能播放音频
        const unlock = () => {
            if (this.audioContext && this.audioContext.state === 'suspended') {
                this.audioContext.resume();
                console.log('音频已解锁');
            }
            // 移除事件监听器
            document.removeEventListener('touchstart', unlock);
            document.removeEventListener('click', unlock);
        };
        
        // 添加事件监听器
        document.addEventListener('touchstart', unlock, { once: true });
        document.addEventListener('click', unlock, { once: true });
    }
    
    // 创建音效
    createSound(options) {
        const { frequency, duration, type } = options;
        
        return () => {
            if (!this.audioContext) return;
            
            try {
                // 创建振荡器
                const oscillator = this.audioContext.createOscillator();
                // 创建音量控制器
                const gainNode = this.audioContext.createGain();
                
                // 设置参数
                oscillator.type = type;
                oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
                
                // 设置音量
                gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
                gainNode.gain.linearRampToValueAtTime(this.volume, this.audioContext.currentTime + 0.01);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
                
                // 连接节点
                oscillator.connect(gainNode);
                gainNode.connect(this.audioContext.destination);
                
                // 开始播放
                oscillator.start(this.audioContext.currentTime);
                // 停止播放
                oscillator.stop(this.audioContext.currentTime + duration);
            } catch (e) {
                console.error('播放音效失败:', e);
            }
        };
    }
    
    // 播放音效
    play(soundName) {
        if (this.sounds[soundName]) {
            this.sounds[soundName]();
        }
    }
    
    // 设置音量
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
    }
    
    // 静音
    mute() {
        this.volume = 0;
    }
    
    // 取消静音
    unmute() {
        this.volume = 0.5;
    }
}

// 导出AudioManager类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AudioManager;
} else {
    window.AudioManager = AudioManager;
}