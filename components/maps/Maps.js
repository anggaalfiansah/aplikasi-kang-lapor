/* eslint-disable prettier/prettier */
/* eslint-disable react-native/no-inline-styles */
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
} from 'react-native';
import MapboxGL from '@react-native-mapbox-gl/maps';
import Geolocation from 'react-native-geolocation-service';
import { useEffect } from 'react';
import database from '@react-native-firebase/database';

MapboxGL.setAccessToken('pk.eyJ1IjoiYW5nZ2EwNTEwMTUiLCJhIjoiY2tsMW05Y3p5MGY4ZzJwcWk5djQ3emw0YiJ9.DYfvUKcaBJmZuBJ_xvvYEg');

const styles = StyleSheet.create({
  container: {
    height: '100%',
    width: '100%',
    backgroundColor: 'tomato',
    paddingBottom: 20,
  },
  map: {
    flex: 1,
  },
  mapView: {
    height: '50%',
    width: '100%',
  },
  description: {
    fontSize: 18,
    color: '#3498db',
    marginLeft: 10,
  },
  notificationList: {
    marginTop: 20,
    padding: 10,
    paddingBottom: 20,
  },
  notificationBox: {
    padding: 20,
    marginTop: 5,
    marginBottom: 10,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    borderRadius: 10,
  },
  notificationBox2: {
    padding: 20,
    marginTop: 5,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignSelf: 'center',
    borderRadius: 10,
  },
  description2: {
    fontSize: 18,
    color: '#3498db',
  },
});

export default function Maps() {
  const [Longitude, setLongitude] = useState(0);
  const [Latitude, setLatitude] = useState(0);
  const [koordinat, setKoordinat] = useState([106.9356013, -6.2513645]);
  const [Data, setData] = useState([]);
  const [Point, setPoint] = useState([]);
  useEffect(() => {
    Geolocation.getCurrentPosition(
      (position) => {
        // console.log(position)
        setLongitude(position.coords.longitude);
        setLatitude(position.coords.latitude);
      },
      (error) => {
        // See error code charts below.
        console.log(error.code, error.message);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000, forceRequestLocation: true }
    );
    const ref = database().ref('maps');
    ref.once('value', (snapshot) => {
      const data = [];
      const point = [];
      // console.log(snapshot)
      snapshot.forEach(snapshotchild => {
        point.push([snapshotchild.val().longitude, snapshotchild.val().latitude]);
        data.push({
          ...snapshotchild.val(),
          key: snapshotchild.id,
        });
        console.log(point);
        setPoint(point);
        setData(data);
      });
    });
  }, []);

  const getMyLocation = () => {
    setKoordinat([Longitude, Latitude]);
    console.log([Longitude, Latitude]);
  };

  const renderAnnotations = () => {
    const items = [];

    for (let i = 0; i < Point.length; i++) {
      items.push(renderAnnotation(i));
    }

    return items;
  };

  const renderAnnotation = (counter) => {
    const id = `pointAnnotation${counter}`;
    const coordinate = Point[counter];
    return (
      <MapboxGL.PointAnnotation
        key={id}
        id={id}
        coordinate={coordinate}>

        <View style={{
          height: 30,
          width: 30,
          backgroundColor: '#00cccc',
          borderRadius: 50,
          borderColor: '#fff',
          borderWidth: 3,
        }} />
      </MapboxGL.PointAnnotation>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mapView}>
        <MapboxGL.MapView style={styles.map}>
          <MapboxGL.UserLocation animated={true} />
          <MapboxGL.Camera
            zoomLevel={15}
            centerCoordinate={koordinat}
            animationMode={'flyTo'}
            animationDuration={500}
          />
          {renderAnnotations()}
        </MapboxGL.MapView>
      </View>
      <TouchableOpacity style={styles.notificationBox2} onPress={getMyLocation}>
        <Text style={styles.description2}>Lokasi Saya</Text>
      </TouchableOpacity>
      <FlatList
        LisHeaderComponent={<></>}
        style={styles.notificationList}
        data={Data}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => {
          return (
            <TouchableOpacity style={styles.notificationBox} onPress={() => setKoordinat([item.longitude, item.latitude])}>
              <View>
                <Text style={styles.description}>{item.lokasi}</Text>
                <Text style={[styles.description, { textAlign: 'center', color: 'black', marginTop: 10 }]}>{item.pelapor}</Text>
              </View>
            </TouchableOpacity>
          );
        }}
        ListFooterComponent={<></>} />
    </SafeAreaView>
  );
}
