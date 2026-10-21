import { REACTOTRON_APP_NAME, REACTOTRON_IGNORED_URLS, REACTOTRON_READY_EVENT } from '@/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Reactotron from 'reactotron-react-native';
import { reactotronRedux } from 'reactotron-redux';


const tron = Reactotron.setAsyncStorageHandler(AsyncStorage)
  .configure({ name: REACTOTRON_APP_NAME })
  .useReactNative({
    asyncStorage: true,
    log: false, // patched synchronously below so early logs are captured before onConnect
    // Expo's native fetch bypasses XHR; pass it explicitly because wrappers can
    // hide the expo.builtin marker used by Reactotron's automatic detection.
    networking: {
      ignoreUrls: REACTOTRON_IGNORED_URLS,
      fetch: process.env.EXPO_PUBLIC_USE_RN_FETCH === '1' || process.env.EXPO_PUBLIC_USE_RN_FETCH === 'true' ? undefined : globalThis.fetch,
    },
    editor: false,
    errors: { veto: () => false },
    overlay: false,
  })
  .use(reactotronRedux())
  .connect();

// Startup marker — queued until the WebSocket connects, then flushed automatically.
tron.display({
  ...REACTOTRON_READY_EVENT,
  value: { time: new Date().toISOString() },
});

// Synchronous console patches capture every log from the first module evaluation onward.
// trackGlobalLogs only patches inside onConnect (too late for startup logs), so we patch
// here instead and route to log/warn/error so entries appear as proper Timeline items.
const _log = console.log;
console.log = (...args: Parameters<typeof console.log>) => {
  _log(...args);
  tron.log(...args);
};

const _info = console.info;
console.info = (...args: Parameters<typeof console.info>) => {
  _info(...args);
  tron.log(...args);
};

const _debug = console.debug;
console.debug = (...args: Parameters<typeof console.debug>) => {
  _debug(...args);
  tron.log(...args);
};

const _warn = console.warn;
console.warn = (...args: Parameters<typeof console.warn>) => {
  _warn(...args);
  tron.warn(args.length === 1 ? args[0] : args);
};

const _error = console.error;
console.error = (...args: Parameters<typeof console.error>) => {
  _error(...args);
  tron.error(args.map(String).join(' '), []);
};

export default tron;
