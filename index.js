/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => App);

export {default as LoginScreen} from './components/login/Login';

export {default as HomeScreen} from './components/home/Home';

export {default as RegistrationScreen} from './components/register/Register';

export {default as BuatLaporan} from './components/buatLaporan/BuatLaporan';

export {default as Maps} from './components/maps/Maps';

export {default as Histori} from './components/histori/Histori';
