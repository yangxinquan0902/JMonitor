import { monitorName, isDev } from './config';


export const log = (message) => {
    // dev环境， 打印log,  prod环境, 不打印log
    if (!isDev) return;
    console.log(
        `%c ${monitorName}`,
        'background: #606060; color: white; padding: 1px 10px; border-radius: 3px;',
        message
    );
};

export const logIndicator = (type, data) => {
    if (!isDev) return;
    console.log(
        `%c ${monitorName} %c${type}`,
        'background: #606060; color: white; padding: 1px 10px; border-top-left-radius: 3px; border-bottom-left-radius: 3px;',
        'background: #1475b2; color: white; padding: 1px 10px; border-top-right-radius: 3px;border-bottom-right-radius: 3px;',
        data
    );
};