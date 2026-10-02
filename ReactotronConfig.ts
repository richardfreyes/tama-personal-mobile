import AsyncStorage from '@react-native-async-storage/async-storage';
import Reactotron from 'reactotron-react-native';
import { reactotronRedux } from 'reactotron-redux';

const reactotron = Reactotron.setAsyncStorageHandler(AsyncStorage)
  .configure({ name: 'Tama Personal' })
  .useReactNative({
    asyncStorage: true,
    networking: { ignoreUrls: /symbolicate|logs$/ },
    editor: false,
    errors: { veto: () => false },
    overlay: false,
  })
  .use(reactotronRedux())
  .connect();

export default reactotron;
