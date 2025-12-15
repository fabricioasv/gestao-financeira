const LOG_LEVELS = ['debug', 'info', 'warn', 'error'];
let currentLevel = 'debug';
let loggingEnabled = true;

const shouldLog = (level) => {
    if (!loggingEnabled) return false;
    return LOG_LEVELS.indexOf(level) >= LOG_LEVELS.indexOf(currentLevel);
};

function setLogLevel(level) {
    if (LOG_LEVELS.includes(level)) {
        currentLevel = level;
    }
}

function setLoggingEnabled(enable) {
    loggingEnabled = Boolean(enable);
}

function logDebug(message, data) {
    if (!shouldLog('debug')) return;
    if (data !== undefined) {
        console.debug(`🔍 ${message}`, data);
    } else {
        console.debug(`🔍 ${message}`);
    }
}

function logInfo(message, data) {
    if (!shouldLog('info')) return;
    if (data !== undefined) {
        console.info(`ℹ️ ${message}`, data);
    } else {
        console.info(`ℹ️ ${message}`);
    }
}

function logWarn(message, data) {
    if (!shouldLog('warn')) return;
    if (data !== undefined) {
        console.warn(`⚠️ ${message}`, data);
    } else {
        console.warn(`⚠️ ${message}`);
    }
}

function logError(message, data) {
    if (!shouldLog('error')) return;
    if (data !== undefined) {
        console.error(`❌ ${message}`, data);
    } else {
        console.error(`❌ ${message}`);
    }
}

function logSuccess(message, data) {
    if (!shouldLog('info')) return;
    if (data !== undefined) {
        console.info(`✅ ${message}`, data);
    } else {
        console.info(`✅ ${message}`);
    }
}

export {
    setLogLevel,
    setLoggingEnabled,
    logDebug,
    logInfo,
    logWarn,
    logError,
    logSuccess,
};

