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
} from 'react-native';
import styles from './styles';
import auth from '@react-native-firebase/auth';
import { useState } from 'react';
import { useEffect } from 'react';
import firestore from '@react-native-firebase/firestore';
import database from '@react-native-firebase/database';
import Geolocation from 'react-native-geolocation-service';
// import Geocoder from 'react-native-geocoding';
import uuid from 'react-native-uuid';

export default function HomeScreen(props) {
  const [nama, setNama] = useState('');
  const [alamat, setAlamat] = useState('');
  const [lokasi, setLokasi] = useState('');
  const [counter, setCounter] = useState(1);
  const [Longitude, setLongitude] = useState(0);
  const [Latitude, setLatitude] = useState(0);
  const uid = props.extraData.uid;

  const emergencyButton = () => {
    console.log(counter);
    if (counter < 3) {
      setCounter(counter + 1);
    } else {

      // Mendapatkan Long, Lat Perangkat

      // Menggenerate kode unik
      const uniqId = uuid.v4();
      const id = uniqId.toUpperCase();

      // Mengirim data ke database
      database()
        .ref('/maps/' + id)
        .set({
          key: id,
          id: uid,
          pelapor: nama,
          lokasi: lokasi,
          latitude: Latitude,
          longitude: Longitude,

        })
        .then(() => {
          alert(`Sinyal darurat berhasil terkirim dengan koordinat ${Longitude}, ${Latitude}`);
          // alert(`Sinyal darurat berhasil terkirim dengan lokasi ${lokasi} dan koordinat ${coords.longitude}, ${coords.latitude}`);
          setCounter(1);
        });
    }
  };

  useEffect(() => {
    // Untuk mendapat nama user dar firestore
    firestore()
      .collection('users')
      .doc(uid)
      .get()
      .then(querySnapshot => {
        setNama(querySnapshot._data.nama);
        setAlamat(querySnapshot._data.alamat);
      });

    Geolocation.getCurrentPosition(
      (position) => {
        // console.log(position)
        setLongitude(position.coords.longitude);
        setLatitude(position.coords.latitude);

        setLokasi(`${position.coords.longitude}, ${position.coords.latitude}`);
      },
      (error) => {
        // See error code charts below.
        console.log(error.code, error.message);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000, forceRequestLocation: true }
    );
    console.log(Longitude, Latitude);
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
    { id: 2, onPress: laporan, title: 'Buat Laporan', image: 'https://img.icons8.com/color/100/000000/add-file.png' },
    { id: 1, onPress: histori, title: 'Semua Laporan', image: 'https://img.icons8.com/color/70/000000/view-file.png' },
    { id: 3, onPress: maps, title: 'Maps', image: 'https://img.icons8.com/dusk/70/000000/globe-earth.png' },
    { id: 4, onPress: logout, title: 'Logout', image: 'https://img.icons8.com/color/70/000000/shutdown.png' },
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
