import { isSupportPerformance } from './utils/tools';
import { log, logIndicator } from './utils/logs';
import { monitorName } from './utils/config';
import {
  getNavigationTime,
  getNetworkInfo,
  getPaintTime,
  getFID,
  getLCP,
  getCLS,
  getTTI,
} from './utils/indicator';


// 导出一个性能测量类
export default class JMonitor {

  constructor() {
    // 不支持performance
    if (!isSupportPerformance) {
      log(`This browser doesn't support Performance API`);
      return;
    }

    logIndicator('Navigation Time', getNavigationTime());
    logIndicator('Network Info', getNetworkInfo());
    getPaintTime();
    getFID();
    getLCP();
    getCLS();
    getTTI();
  };

  // performance mark
  markStart(name) {
    /*
      mark() 方法在浏览器的性能缓冲区中使用给定名称添加一个timestamp(时间戳);
      name: 一个表示标记名称的DOMString
    */
    performance.mark(name);
  };

  // performance mark and log measures
  markEnd(startName, endName) {
    performance.mark(endName);

    const measureName = `${monitorName}-${startName}`;
    // 测量两个时间戳之间的性能指标
    performance.measure(measureName, startName, endName);
    /*
      getEntriesByName() - 返回一个列表，该列表包含一些用于承载各种性能数据的对象，按名称过滤
      标记 的 performance entry将具有以下属性值:

        entryType - 设置为 "measure".
        name - 设置为mark被创建时给出的 "name"。
        startTime - 设置为 mark() 方法被调用时的 timestamp 。
        duration - 持续的总时长.

      如果这个方法被指定的 name 已经存在于PerformanceTiming 接口, 会抛出一个SyntaxError错误
    */
    const measures = performance.getEntriesByName(measureName);
    measures.forEach((measure) => logIndicator(measureName, measure));
  };

  // performance clearMarks
  clearMarks(name) {
    performance.clearMarks(name);
  };

  // performance clearMeasures
  clearMeasures(name) {
    performance.clearMeasures(`${monitorName}-${name}`);
  };


  // fmp start
  fmpStart() {
    this.markStart('fmp-start');
  };

  // fmp end and log fmp measure
  fmpEnd() {
    this.markStart('fmp-end');
    performance.measure('fmp', 'fmp-start', 'fmp-end');
    const measures = performance.getEntriesByName('fmp');
    measures.forEach((measure) =>
      logIndicator('fmp', {
        time: measure.duration,
      })
    )
  };

}