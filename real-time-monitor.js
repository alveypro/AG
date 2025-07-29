// 实时用户行为监控脚本
class UserBehaviorMonitor {
    constructor() {
        this.userData = {
            walletAddress: null,
            behaviorHistory: [],
            deviceInfo: {},
            timePatterns: [],
            gameHistory: [],
            verificationStatus: {
                wallet: false,
                behavior: false,
                device: false,
                time: false
            }
        };
        
        this.monitoring = false;
        this.startTime = null;
        this.lastActionTime = null;
        
        this.init();
    }
    
    init() {
        console.log('🔍 用户行为监控系统启动');
        this.collectDeviceInfo();
        this.setupEventListeners();
    }
    
    // 收集设备信息
    collectDeviceInfo() {
        this.userData.deviceInfo = {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            screenResolution: `${screen.width}x${screen.height}`,
            colorDepth: screen.colorDepth,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            cookieEnabled: navigator.cookieEnabled,
            onLine: navigator.onLine,
            hardwareConcurrency: navigator.hardwareConcurrency || 'unknown'
        };
        
        console.log('📱 设备信息收集完成:', this.userData.deviceInfo);
    }
    
    // 设置事件监听器
    setupEventListeners() {
        // 鼠标事件
        document.addEventListener('mousemove', (e) => this.recordMouseEvent('move', e));
        document.addEventListener('click', (e) => this.recordMouseEvent('click', e));
        document.addEventListener('dblclick', (e) => this.recordMouseEvent('dblclick', e));
        
        // 键盘事件
        document.addEventListener('keydown', (e) => this.recordKeyboardEvent('keydown', e));
        document.addEventListener('keyup', (e) => this.recordKeyboardEvent('keyup', e));
        
        // 滚动事件
        document.addEventListener('scroll', (e) => this.recordScrollEvent(e));
        
        // 触摸事件（移动设备）
        document.addEventListener('touchstart', (e) => this.recordTouchEvent('start', e));
        document.addEventListener('touchmove', (e) => this.recordTouchEvent('move', e));
        document.addEventListener('touchend', (e) => this.recordTouchEvent('end', e));
        
        // 窗口事件
        window.addEventListener('resize', (e) => this.recordWindowEvent('resize', e));
        window.addEventListener('focus', (e) => this.recordWindowEvent('focus', e));
        window.addEventListener('blur', (e) => this.recordWindowEvent('blur', e));
        
        console.log('🎯 事件监听器设置完成');
    }
    
    // 记录鼠标事件
    recordMouseEvent(type, event) {
        if (!this.monitoring) return;
        
        const mouseData = {
            type: `mouse_${type}`,
            timestamp: Date.now(),
            position: { x: event.clientX, y: event.clientY },
            button: event.button,
            buttons: event.buttons,
            target: event.target.tagName
        };
        
        this.userData.behaviorHistory.push(mouseData);
        this.lastActionTime = Date.now();
        
        // 限制历史记录大小
        if (this.userData.behaviorHistory.length > 1000) {
            this.userData.behaviorHistory = this.userData.behaviorHistory.slice(-500);
        }
    }
    
    // 记录键盘事件
    recordKeyboardEvent(type, event) {
        if (!this.monitoring) return;
        
        const keyboardData = {
            type: `keyboard_${type}`,
            timestamp: Date.now(),
            key: event.key,
            code: event.code,
            ctrlKey: event.ctrlKey,
            altKey: event.altKey,
            shiftKey: event.shiftKey,
            metaKey: event.metaKey
        };
        
        this.userData.behaviorHistory.push(keyboardData);
        this.lastActionTime = Date.now();
    }
    
    // 记录滚动事件
    recordScrollEvent(event) {
        if (!this.monitoring) return;
        
        const scrollData = {
            type: 'scroll',
            timestamp: Date.now(),
            scrollX: window.scrollX,
            scrollY: window.scrollY,
            target: event.target.tagName
        };
        
        this.userData.behaviorHistory.push(scrollData);
        this.lastActionTime = Date.now();
    }
    
    // 记录触摸事件
    recordTouchEvent(type, event) {
        if (!this.monitoring) return;
        
        const touchData = {
            type: `touch_${type}`,
            timestamp: Date.now(),
            touches: Array.from(event.touches).map(touch => ({
                clientX: touch.clientX,
                clientY: touch.clientY,
                identifier: touch.identifier
            })),
            target: event.target.tagName
        };
        
        this.userData.behaviorHistory.push(touchData);
        this.lastActionTime = Date.now();
    }
    
    // 记录窗口事件
    recordWindowEvent(type, event) {
        if (!this.monitoring) return;
        
        const windowData = {
            type: `window_${type}`,
            timestamp: Date.now(),
            innerWidth: window.innerWidth,
            innerHeight: window.innerHeight
        };
        
        this.userData.behaviorHistory.push(windowData);
        this.lastActionTime = Date.now();
    }
    
    // 开始监控
    startMonitoring() {
        this.monitoring = true;
        this.startTime = Date.now();
        console.log('🚀 开始用户行为监控');
        
        // 定期分析行为模式
        this.analysisInterval = setInterval(() => {
            this.analyzeBehavior();
        }, 10000); // 每10秒分析一次
    }
    
    // 停止监控
    stopMonitoring() {
        this.monitoring = false;
        if (this.analysisInterval) {
            clearInterval(this.analysisInterval);
        }
        console.log('⏹️ 停止用户行为监控');
    }
    
    // 分析行为模式
    analyzeBehavior() {
        const recentBehavior = this.userData.behaviorHistory.slice(-100);
        const analysis = {
            timestamp: Date.now(),
            totalActions: recentBehavior.length,
            mouseActions: recentBehavior.filter(b => b.type.startsWith('mouse')).length,
            keyboardActions: recentBehavior.filter(b => b.type.startsWith('keyboard')).length,
            scrollActions: recentBehavior.filter(b => b.type === 'scroll').length,
            touchActions: recentBehavior.filter(b => b.type.startsWith('touch')).length,
            timeSpan: recentBehavior.length > 0 ? 
                recentBehavior[recentBehavior.length - 1].timestamp - recentBehavior[0].timestamp : 0
        };
        
        // 计算行为频率
        analysis.actionRate = analysis.timeSpan > 0 ? 
            (analysis.totalActions / analysis.timeSpan) * 1000 : 0;
        
        // 检测异常行为
        const anomalies = this.detectAnomalies(analysis);
        
        console.log('📊 行为分析结果:', analysis);
        if (anomalies.length > 0) {
            console.warn('⚠️ 检测到异常行为:', anomalies);
        }
        
        return { analysis, anomalies };
    }
    
    // 检测异常行为
    detectAnomalies(analysis) {
        const anomalies = [];
        
        // 检测过快操作
        if (analysis.actionRate > 50) { // 每秒超过50次操作
            anomalies.push('操作频率异常高');
        }
        
        // 检测机器人模式
        if (analysis.mouseActions > 0 && analysis.keyboardActions === 0) {
            const mouseEvents = this.userData.behaviorHistory.filter(b => b.type.startsWith('mouse'));
            const clickPositions = mouseEvents.filter(b => b.type === 'mouse_click').map(b => b.position);
            
            // 检测点击位置是否过于规律
            if (this.isClickPatternTooRegular(clickPositions)) {
                anomalies.push('点击模式过于规律');
            }
        }
        
        // 检测时间间隔异常
        if (analysis.timeSpan > 0) {
            const intervals = this.calculateTimeIntervals();
            const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
            
            if (avgInterval < 50) { // 平均间隔小于50ms
                anomalies.push('操作间隔异常短');
            }
        }
        
        return anomalies;
    }
    
    // 计算时间间隔
    calculateTimeIntervals() {
        const timestamps = this.userData.behaviorHistory.map(b => b.timestamp);
        const intervals = [];
        
        for (let i = 1; i < timestamps.length; i++) {
            intervals.push(timestamps[i] - timestamps[i - 1]);
        }
        
        return intervals;
    }
    
    // 检测点击模式是否过于规律
    isClickPatternTooRegular(positions) {
        if (positions.length < 3) return false;
        
        // 计算点击位置之间的距离
        const distances = [];
        for (let i = 1; i < positions.length; i++) {
            const dx = positions[i].x - positions[i - 1].x;
            const dy = positions[i].y - positions[i - 1].y;
            distances.push(Math.sqrt(dx * dx + dy * dy));
        }
        
        // 如果距离变化很小，可能是机器人
        const avgDistance = distances.reduce((a, b) => a + b, 0) / distances.length;
        const variance = distances.reduce((sum, d) => sum + Math.pow(d - avgDistance, 2), 0) / distances.length;
        
        return variance < 100; // 方差小于100认为过于规律
    }
    
    // 验证钱包连接
    async verifyWallet() {
        try {
            if (typeof window.ethereum !== 'undefined') {
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                this.userData.walletAddress = accounts[0];
                this.userData.verificationStatus.wallet = true;
                
                console.log('✅ 钱包验证成功:', this.userData.walletAddress);
                return true;
            } else {
                console.error('❌ 未检测到MetaMask');
                return false;
            }
        } catch (error) {
            console.error('❌ 钱包验证失败:', error);
            return false;
        }
    }
    
    // 验证设备信息
    verifyDevice() {
        const deviceInfo = this.userData.deviceInfo;
        
        // 检查设备信息是否完整
        const requiredFields = ['userAgent', 'platform', 'screenResolution', 'timezone'];
        const hasAllFields = requiredFields.every(field => deviceInfo[field]);
        
        if (hasAllFields) {
            this.userData.verificationStatus.device = true;
            console.log('✅ 设备验证成功');
            return true;
        } else {
            console.error('❌ 设备信息不完整');
            return false;
        }
    }
    
    // 验证行为模式
    verifyBehavior() {
        const recentBehavior = this.userData.behaviorHistory.slice(-50);
        
        if (recentBehavior.length >= 10) {
            const analysis = this.analyzeBehavior();
            
            if (analysis.anomalies.length === 0) {
                this.userData.verificationStatus.behavior = true;
                console.log('✅ 行为验证成功');
                return true;
            } else {
                console.warn('⚠️ 行为验证失败:', analysis.anomalies);
                return false;
            }
        } else {
            console.warn('⚠️ 行为数据不足');
            return false;
        }
    }
    
    // 验证时间模式
    verifyTimePattern() {
        const now = Date.now();
        const timePattern = {
            timestamp: now,
            hour: new Date(now).getHours(),
            minute: new Date(now).getMinutes(),
            dayOfWeek: new Date(now).getDay()
        };
        
        this.userData.timePatterns.push(timePattern);
        
        // 检查时间模式是否合理
        if (this.userData.timePatterns.length >= 3) {
            const intervals = [];
            for (let i = 1; i < this.userData.timePatterns.length; i++) {
                intervals.push(this.userData.timePatterns[i].timestamp - this.userData.timePatterns[i - 1].timestamp);
            }
            
            const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
            
            if (avgInterval > 1000) { // 平均间隔大于1秒
                this.userData.verificationStatus.time = true;
                console.log('✅ 时间模式验证成功');
                return true;
            } else {
                console.warn('⚠️ 时间间隔过短');
                return false;
            }
        } else {
            console.warn('⚠️ 时间数据不足');
            return false;
        }
    }
    
    // 记录游戏事件
    recordGameEvent(gameData) {
        const gameEvent = {
            timestamp: Date.now(),
            ...gameData
        };
        
        this.userData.gameHistory.push(gameEvent);
        console.log('🎮 游戏事件记录:', gameEvent);
    }
    
    // 获取验证状态
    getVerificationStatus() {
        return this.userData.verificationStatus;
    }
    
    // 获取用户数据
    getUserData() {
        return {
            ...this.userData,
            behaviorHistory: this.userData.behaviorHistory.slice(-100) // 只返回最近100条记录
        };
    }
    
    // 生成验证报告
    generateReport() {
        const status = this.getVerificationStatus();
        const passedCount = Object.values(status).filter(Boolean).length;
        const totalCount = Object.keys(status).length;
        
        return {
            timestamp: Date.now(),
            verificationStatus: status,
            passedCount,
            totalCount,
            passRate: (passedCount / totalCount) * 100,
            deviceInfo: this.userData.deviceInfo,
            recentBehavior: this.userData.behaviorHistory.slice(-20),
            gameHistory: this.userData.gameHistory.slice(-10)
        };
    }
}

// 导出监控器类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UserBehaviorMonitor;
} else {
    window.UserBehaviorMonitor = UserBehaviorMonitor;
}

// 自动初始化（如果在浏览器环境中）
if (typeof window !== 'undefined') {
    window.userMonitor = new UserBehaviorMonitor();
    console.log('�� 用户行为监控器已初始化');
} 