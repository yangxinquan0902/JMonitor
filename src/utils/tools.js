// 是否支持performance
export const isSupportPerformance = () => {
    const performance = window.performance;
    return (
        performance &&
        !!performance.getEntriesByType &&
        !!performance.now &&
        !!performance.mark
    );
};


export let hiddenTime = document.visibilityState === 'hidden' ? 0 : Infinity;


/*
    “性能时间线”还定义了一个非常重要的接口用来观察“性能时间线”记录新的性能信息，当一个新的性能信息被记录时，观察者将会收到通知。
    它就是PerformanceObserver。
*/
export const getObserver = (type, cb) => {
    // console.log("type>>>", type)
    /*
        entryList.getEntries()数组中的PerformanceEntry对象所包含的属性:  
            name - 通过该属性可以得到PerformanceEntry对象的标识符，不唯一
            entryType - 通过该属性可以得到PerformanceEntry对象的类型
            startTime - 通过该属性可以得到一个时间戳
            duration - 通过该属性可以得到持续时间
    */
    const perfObserver = new PerformanceObserver((entryList) => {
        // console.log("entryList.getEntries()>>", entryList.getEntries());
        cb && cb(entryList.getEntries());
    });
    perfObserver.observe({ type, buffered: true });
};


export const getObserverLongtask = (cb) => {
    const perfObserver = new PerformanceObserver((entryList) => {
        // 当记录一个新的性能指标时执行
        // console.log("entryList.getEntries()>>", entryList.getEntries());
        cb && cb(entryList.getEntries());
    });
    perfObserver.observe({entryTypes: ['longtask']});

    /*
        上面这段代码使用PerformanceObserver注册了一个长任务观察者，当一个新的长任务性能信息被记录时，回调会被触发。
        回调函数会接收到两个参数：第一个参数是一个列表，第二个参数是观察者实例
    */          
};


// 等级区间
const scores = {
    fcp: [2000, 4000],
    lcp: [2500, 4500],
    fid: [100, 300],
    tbt: [300, 600],
    cls: [0.1, 0.25],
};
// 等级评定
const scoreLevel = ['good', 'needsImprovement', 'poor'];
// 获取等级
export const getScore = (type, data) => {
    const score = scores[type];
    for (let i = 0; i < score.length; i++) {
        if (data <= score[i]) return scoreLevel[i];
    }
    return scoreLevel[2];
};

