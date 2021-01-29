import { getObserver, getObserverLongtask, getScore, hiddenTime } from './tools.js';
import { logIndicator } from './logs.js';
import ttiPolyfill from 'tti-polyfill';


let tbt = 0;


// 获取长任务
const getLongTask = (fcp) => {
  getObserverLongtask((entries) => {
      console.log("getLongTask>>>", entries);
      entries.forEach((entry) => {
          // get long task time in fcp -> tti
          if (entry.name !== 'self' || entry.startTime < fcp) {
              return;
          }
          // long tasks mean time over 50ms, 超出50ms的部分总和
          const blockingTime = entry.duration - 50;
          if (blockingTime > 0) tbt += blockingTime;
          
      });
  });
};

// 耗时统计
export const getNavigationTime = () => {
  // getEntriesByType() - 返回一个列表，该列表包含一些用于承载各种性能数据的对象，按类型过滤
  const navigation = window.performance.getEntriesByType('navigation');
  if (navigation.length > 0) {
    // 获取PerformanceNavigationTiming
    const timing = navigation[0];
    if (timing) {
      // 各种性能时间戳
      const {
        // 按下enter键的时间
        navigationStart,

        // 重定向相关
        redirectEnd,
        redirectStart,
        redirectCount,

        // appCache 和 DNS解析
        fetchStart,
        domainLookupEnd,
        domainLookupStart,

        // TCP 连接耗时
        connectEnd,
        connectStart,
        secureConnectionStart,

        // HTTP大小
        transferSize,
        encodedBodySize,
        
        workerStart,
        
        // 请求开始时间
        requestStart,

        // 服务端响应时间
        responseEnd,
        responseStart,

        // DOM元素解析
        domContentLoadedEventEnd,
        domContentLoadedEventStart,

        // DOM加载完成时间
        loadEventEnd,
      } = timing;

      return {
        // 重定向耗时和次数  过多重定向影响性能
        redirect: {
          count: redirectCount,
          time: redirectEnd - redirectStart,
        },
        // 缓存耗时  DNS 查询开始时间 - fetch start 时间
        appCache: domainLookupStart - fetchStart,
        // DNS 解析耗时
        dnsTime: domainLookupEnd - domainLookupStart,
        // TCP 连接耗时 handshake end - handshake start time
        TCP: connectEnd - connectStart,
        // SSL 安全连接耗时  只在 HTTPS 下有效
        SSL: connectEnd - secureConnectionStart,
        // HTTP head size
        headSize: transferSize - encodedBodySize || 0,
        // 响应时间
        responseTime: responseEnd - responseStart,
        // Time to First Byte
        TTFB: responseStart - requestStart,
        // fetch resource time
        fetchTime: responseEnd - fetchStart,
        // Service work response time
        workerTime: workerStart > 0 ? responseEnd - workerStart : 0,
        // 从页面开始到 domContentLoadedEventEnd
        domReady: domContentLoadedEventEnd - fetchStart,
        // DOMContentLoaded time
        DCL: domContentLoadedEventEnd - domContentLoadedEventStart,
        // 从页面开始到 loadEventEnd
        loaded: loadEventEnd - navigationStart,
      };
    }
  }
  return {};
};


// 获取网络信息
export const getNetworkInfo = () => {
  if ('connection' in window.navigator) {
    const connection = window.navigator['connection'] || {};
    const { effectiveType, downlink, rtt, saveData } = connection;
    return {
      // 网络类型，4g 3g 这些
      effectiveType,
      // 网络下行速度
      downlink,
      // round-trip time  发送数据到接受数据的往返时间
      rtt,
      // 打开/请求数据保护模式
      saveData,
    };
  }
  return {};
};


// 获取绘制时间 
export const getPaintTime = () => {
  getObserver('paint', (entries) => {
    // console.log("entries>>>", entries);
    entries.forEach((entry) => {
        // 开始时间
        const time = entry.startTime;
        // 指标名称
        const name = entry.name;
  
        // console.log("time>>>", time);
        // console.log("name>>>", name);

        // FCP: 首页内容绘制，首次绘制文本、图片、非空白canvas或者svg的时间
        if (name === 'first-contentful-paint') {
            // fcp => tti之间
            getLongTask(time);
            logIndicator('FCP', {
                time,
                score: getScore('fcp', time),
            });
        } else {
            // FP: 首次绘制，页面第一次绘制元素的时候
            logIndicator('FP', {
                time,
            });
        }
    });
  });
};


/*
  FID: 首次输入延迟，记录在FCP和TTI之间用户与页面交互时响应的延迟
  第一次点击页面有效
  first-input-delay
  fid: [100, 300],
  tbt: [300, 600],
*/
export const getFID = () => {
  getObserver('first-input', (entries) => {
      // console.log("entries>>>", entries);
      entries.forEach((entry) => {
          if (entry.startTime < hiddenTime) {
              // 响应时间
              const time = entry.processingStart - entry.startTime;
              logIndicator('FID', {
                  time,
                  score: getScore('fid', time),
              });
              // TBT is in fcp -> tti
              // TBT (total-block-time): 阻塞总时间，记录在FCP和TTI之间长任务的阻塞时间，单个阻塞时间：加载时间 - 50
              logIndicator('TBT', {
                  time: tbt,
                  score: getScore('tbt', tbt),
              });
          }
      });
  });
};


/*
  LCP: 最大内容绘制，视口内最大的内容绘制时间
  largest-contentful-paint
  lcp: [2500, 4500]
*/
export const getLCP = () => {
    getObserver('largest-contentful-paint', (entries) => {
        entries.forEach((entry) => {
            if (entry.startTime < hiddenTime) {
                const { startTime, renderTime, size } = entry;
                logIndicator('LCP Update', {
                    time: renderTime | startTime,
                    size,
                    score: getScore('lcp', renderTime | startTime),
                });
            }
        });
    });
};


/*
  CLS: 累计位移偏移，记录了页面上非预期的位移波动
  layout-shift
  cls: [0.1, 0.25]
*/
export const getCLS = () => {
    getObserver('layout-shift', (entries) => {
        // console.log("entries>>>", entries)
        let value = 0;
        entries.forEach((entry) => {
            if (!entry.hadRecentInput) {
                value += entry.value;
            }
        });
        logIndicator('CLS Update', {
            value,
            score: getScore('cls', value),
        });
    });
};

/*
  TTI: 首次可交互时间，连续5秒内没有长任务(50ms)和两个以上get请求时，那5秒之前的最后一个长任务结束时间就是TTI记录的时间
*/
export const getTTI = () => {
  ttiPolyfill.getFirstConsistentlyInteractive().then((tti) => {
    logIndicator('TTI', {
      value: tti,
    })
  })
}
