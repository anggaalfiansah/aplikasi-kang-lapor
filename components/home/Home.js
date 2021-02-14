/* eslint-disable prettier/prettier */
/* eslint-disable no-alert */
/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  Image,
  ScrollView,
  FlatList,
  SafeAreaView,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import styles from './styles';
import auth from '@react-native-firebase/auth';
import { useState } from 'react';
import { useEffect } from 'react';
import firestore from '@react-native-firebase/firestore';
import database from '@react-native-firebase/database';
import Geolocation from 'react-native-geolocation-service';
import Geocoder from 'react-native-geocoding';
import uuid from 'react-native-uuid';

export default function HomeScreen(props) {
  const [nama, setNama] = useState('');
  const [alamat, setAlamat] = useState('');
  const [lokasi, setLokasi] = useState('');
  const [counter, setCounter] = useState(1);
  const uid = props.extraData.uid;

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
    } else { return true; }
  };

  const emergencyButton = () => {
    console.log(counter);
    if (counter < 3) {
      setCounter(counter + 1);
    } else {
      Geolocation.getCurrentPosition(
        info => {
          const { coords } = info;

          Geocoder.init('AIzaSyCqPRr7qdOqMxrTspIoc-ybV4Hl70q5ENA');
          Geocoder.from(coords.latitude, coords.longitude)
            .then(json => {
              const addressComponent = json.results[0].formatted_address;
              console.log(addressComponent);
              setLokasi(addressComponent);
            });
          console.log(coords.latitude);
          console.log(coords.longitude);
          const uniqId = uuid.v4();
          const id = uniqId.toUpperCase();
          database()
            .ref('/maps/' + id)
            .set({
              key:id,
              id: uid,
              pelapor: nama,
              lokasi: lokasi,
              latitude: coords.latitude,
              longitude: coords.longitude,

            })
            .then(() => {
              alert(`Sinyal darurat berhasil terkirim dengan lokasi ${lokasi} dan koordinat ${coords.longitude}, ${coords.latitude}`);
              setCounter(1);
            });
        }
      );
    }
  };

  useEffect(() => {
    requestPermission();
    firestore()
      .collection('users')
      .doc(uid)
      .get()
      .then(querySnapshot => {
        setNama(querySnapshot._data.nama);
        setAlamat(querySnapshot._data.alamat);
      });
  });

  const logout = () => {
    console.log('SignOut');
    auth()
      .signOut()
      .then(() => {
        console.log('User signed out!');
      });
  };

  const laporan = () => {
    props.navigation.navigate('Laporan');
  };

  const maps = () => {
    props.navigation.navigate('Maps');
  };

  const histori = () => {
    props.navigation.navigate('Histori');
  };

  const [data] = useState([
    { id: 2, onPress: laporan, title:'Buat Laporan', image: 'https://img.icons8.com/color/100/000000/add-file.png' },
    { id: 1, onPress: histori, title:'Semua Laporan', image: 'https://img.icons8.com/color/70/000000/view-file.png' },
    { id: 3, onPress: maps, title:'Maps', image: 'https://img.icons8.com/dusk/70/000000/globe-earth.png' },
    { id: 4, onPress: logout, title:'Logout',image: 'https://img.icons8.com/color/70/000000/shutdown.png' },
  ]);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={{ marginVertical: 20, marginHorizontal: 20, fontSize: 15, textAlign: 'center' }}>Selamat Datang {nama} dari {alamat}</Text>
      <FlatList
        data={data}
        horizontal={false}
        numColumns={2}
        keyExtractor={(item) => {
          return item.id;
        }}
        renderItem={({ item }) => {
          return (
            <TouchableOpacity style={styles.card} onPress={item.onPress}>
              <View style={styles.cardFooter} />
              <Image style={styles.cardImage} source={{ uri: item.image }} />
              <View style={styles.cardHeader}>
                <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={styles.title}>{item.title}</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        }} />
      <ScrollView>
        <View style={styles.container}>
          <TouchableOpacity style={styles.card2} onPress={() => { emergencyButton(); }}>
            <Text style={styles.cardImage2}>Sentuh 3x Jika Darurat</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
