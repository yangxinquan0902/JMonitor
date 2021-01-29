export const monitorName = "JMonitor";

// 当前环境
export const isDev = () => {
    return process.env.NODE_ENV === 'development';
};