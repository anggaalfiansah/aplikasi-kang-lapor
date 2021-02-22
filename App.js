/* eslint-disable no-alert */
// import { Buffer } from 'buffer';
import 'react-native-gesture-handler';
import React, {useState, useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {
  LoginScreen,
  HomeScreen,
  RegistrationScreen,
  BuatLaporan,
  Maps,
  Histori,
} from './index';
import auth from '@react-native-firebase/auth';
// import firestore from '@react-native-firebase/firestore';
import {decode, encode} from 'base-64';
import {PermissionsAndroid, Platform} from 'react-native';
if (!global.btoa) {
  global.btoa = encode;
}
if (!global.atob) {
  global.atob = decode;
}

const Stack = createStackNavigator();

export default function App() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const authStateChanged = (users) => {
    setUser(users);
    if (loading) {
      setLoading(false);
    }
  };

  // Untuk Request Permission
  const requestPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.CAMERA,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        ]);
        // If Permission is granted
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        alert('Write permission err', err);
      }
      return false;
    } else {
      return true;
    }
  };

  useEffect(() => {
    requestPermission();
    const subscriber = auth().onAuthStateChanged(authStateChanged);
    return subscriber; // unsubscribe on unmount
  });

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {user ? (
          <>
            <Stack.Screen
              name="Home"
              options={{
                title: 'Home',
                headerTitleStyle: {alignSelf: 'center'},
              }}>
              {(props) => <HomeScreen {...props} extraData={user} />}
            </Stack.Screen>
            <Stack.Screen
              name="Laporan"
              component={BuatLaporan}
              options={{title: 'Laporan'}}
            />
            <Stack.Screen
              name="Maps"
              component={Maps}
              options={{title: 'Maps'}}
            />
            <Stack.Screen
              name="Histori"
              component={Histori}
              options={{title: 'Histori'}}
            />
          </>
        ) : (
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{
                title: 'Login',
                headerTitleStyle: {alignSelf: 'center'},
              }}
            />
            <Stack.Screen
              name="Registration"
              component={RegistrationScreen}
              options={{
                title: 'Register',
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
