/* eslint-disable prettier/prettier */
/* eslint-disable no-alert */
/* eslint-disable react-native/no-inline-styles */
import React, { useState, useEffect } from 'react';
import { Image, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Picker } from '@react-native-picker/picker';
import styles from './styles';
import Geolocation from 'react-native-geolocation-service';
import Geocoder from 'react-native-geocoding';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import uuid from 'react-native-uuid';

export default function RegistrationScreen({ navigation }) {
    const [jenis, setJenis] = useState('');
    const [nama, setName] = useState('');
    const [alamat, setAlamat] = useState('');
    const [keterangan, setKeterangan] = useState('');
    const [Longitude, setLongitude] = useState(0);
    const [Latitude, setLatitude] = useState(0);
    const [ImageUri, setImageUri] = useState();
    const [fileExtension, setExtension] = useState();
    const uniqId = uuid.v4();
    const id = uniqId.toUpperCase();
    const fileName = `${id}.${fileExtension}`;
    console.log(fileName);

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
        console.log(Longitude, Latitude);
    });

    const getAlamat = () => {
        Geocoder.init('AIzaSyCqPRr7qdOqMxrTspIoc-ybV4Hl70q5ENA');
        Geocoder.from(Latitude, Longitude)
            .then(json => {
                var addressComponent = json.results[0].formatted_address;
                console.log(addressComponent);
                setAlamat(addressComponent);
                // setAlamat(`${Latitude},${Longitude}`);
            })
            .catch(error => console.warn(error));
    };

    const laporkeun = () => {
        const currentDate = new Date();
        const tanggal = `${currentDate.getFullYear()}-${currentDate.getMonth()}-${currentDate.getDate()} ${('0' + currentDate.getHours()).slice(-2)}:${('0' + currentDate.getMinutes()).slice(-2)}:${('0' + currentDate.getSeconds()).slice(-2)}`;
        console.log(tanggal);
        if (ImageUri) {

            const storageRef = storage().ref(`images/${fileName}`);

            storageRef.putFile(`${ImageUri}`)
                .on(
                    storage.TaskEvent.STATE_CHANGED,
                    snapshot => {
                        console.log('snapshot: ' + snapshot.state);
                        console.log('progress: ' + (snapshot.bytesTransferred / snapshot.totalBytes) * 100);

                        if (snapshot.state === storage.TaskState.SUCCESS) {
                            console.log('Success');
                        }
                    },
                    error => {
                        console.log('image upload error: ' + error.toString());
                    },
                    () => {
                        storageRef.getDownloadURL()
                            .then((downloadUrl) => {
                                console.log('File available at: ' + downloadUrl);

                                const data = {
                                    id: id,
                                    jenis,
                                    nama,
                                    alamat,
                                    keterangan,
                                    image: downloadUrl,
                                    waktu: tanggal,
                                };
                                firestore().collection('laporan')
                                    .doc(id)
                                    .set(data)
                                    .then(() => {
                                        setJenis('Pilih Jenis Laporan');
                                        setName('');
                                        setAlamat('');
                                        setKeterangan('');
                                        setImageUri();
                                    })
                                    .catch((error) => {
                                        alert(error);
                                    });
                            });
                    }
                );
        }
    };

    const captureImage = (type) => {
        let options = {
            mediaType: type,
            maxWidth: 300,
            maxHeight: 550,
            quality: 1,
            videoQuality: 'low',
            durationLimit: 30, //Video max duration in seconds
            saveToPhotos: true,
        };
        launchCamera(options, (response) => {
            console.log('Response = ', response);

            if (response.didCancel) {
                alert('User cancelled camera picker');
                return;
            } else if (response.errorCode === 'camera_unavailable') {
                alert('Camera not available on device');
                return;
            } else if (response.errorCode === 'permission') {
                alert('Permission not satisfied');
                return;
            } else if (response.errorCode === 'others') {
                alert(response.errorMessage);
                return;
            }
            console.log('base64 -> ', response.base64);
            console.log('uri -> ', response.uri);
            console.log('width -> ', response.width);
            console.log('height -> ', response.height);
            console.log('fileSize -> ', response.fileSize);
            console.log('type -> ', response.type);
            console.log('fileName -> ', response.fileName);
            setImageUri(response.uri);
            setExtension(response.uri.split('.').pop());
        });
    };

    const chooseFile = (type) => {
        let options = {
            mediaType: type,
            maxWidth: 300,
            maxHeight: 550,
            quality: 1,
        };
        launchImageLibrary(options, (response) => {
            console.log('Response = ', response);

            if (response.didCancel) {
                alert('User cancelled camera picker');
                return;
            } else if (response.errorCode === 'camera_unavailable') {
                alert('Camera not available on device');
                return;
            } else if (response.errorCode === 'permission') {
                alert('Permission not satisfied');
                return;
            } else if (response.errorCode === 'others') {
                alert(response.errorMessage);
                return;
            }
            console.log('base64 -> ', response.base64);
            console.log('uri -> ', response.uri);
            console.log('width -> ', response.width);
            console.log('height -> ', response.height);
            console.log('fileSize -> ', response.fileSize);
            console.log('type -> ', response.type);
            console.log('fileName -> ', response.fileName);
            setImageUri(response.uri);
            setExtension(response.uri.split('.').pop());
        });
    };

    return (
        <View style={styles.container}>
            <KeyboardAwareScrollView
                style={{ flex: 1, width: '100%' }}
                keyboardShouldPersistTaps="always">
                <Text style={{ marginVertical: 15, marginHorizontal: 30, fontSize: 30, textAlign: 'center', fontWeight: 'bold' }}>
                    Buat Laporan
                </Text>

                <Text style={{ marginVertical: 10, marginHorizontal: 30, fontSize: 15 }}>
                    Pilih Jenis Laporan
                </Text>
                <View style={styles.container}>
                    <Picker
                        selectedValue={jenis}
                        style={{ width: '85%', backgroundColor: 'white', marginBottom: 10 }}
                        onValueChange={(itemValue) => setJenis(itemValue)}
                    >
                        <Picker.Item label="Pilih Jenis Laporan" />
                        <Picker.Item label="Kriminal" value="Kriminal" />
                        <Picker.Item label="Kecelakaan" value="Kecelakaan" />
                        <Picker.Item label="Bencana" value="Bencana" />
                    </Picker>
                </View>
                <Text style={{ marginVertical: 5, marginHorizontal: 30, fontSize: 15 }}>
                    Nama Laporan
                </Text>
                <TextInput
                    style={styles.input}
                    placeholder="Nama Laporan"
                    placeholderTextColor="#aaaaaa"
                    onChangeText={(text) => setName(text)}
                    value={nama}
                    underlineColorAndroid="transparent"
                    autoCapitalize="none"
                />
                <Text style={{ marginVertical: 5, marginHorizontal: 30, fontSize: 15 }}>
                    Alamat
                    </Text>
                <View style={styles.container}>
                    <TextInput
                        style={[styles.input, { width: '85%' }]}
                        placeholder="Alamat"
                        placeholderTextColor="#aaaaaa"
                        onChangeText={(text) => setAlamat(text)}
                        value={alamat}
                        underlineColorAndroid="transparent"
                        autoCapitalize="none"
                    />
                    <TouchableOpacity
                        activeOpacity={0.5}
                        style={styles.buttonStyle}
                        onPress={() => getAlamat()}>
                        <Text style={styles.textStyle}>
                            Gunakan Lokasi Anda
                        </Text>
                    </TouchableOpacity>
                </View>
                <Text style={{ marginVertical: 5, marginHorizontal: 30, fontSize: 15 }}>
                    Keterangan
                </Text>
                <TextInput
                    multiline={true}
                    numberOfLines={10}
                    style={styles.input2}
                    placeholder="Keterangan"
                    placeholderTextColor="#aaaaaa"
                    onChangeText={(text) => setKeterangan(text)}
                    value={keterangan}
                    underlineColorAndroid="transparent"
                    autoCapitalize="none"
                />
                <View style={styles.container}>
                    <View style={{ borderWidth: 2, borderColor: 'black' }}>
                        <Image
                            source={{ uri: ImageUri }}
                            style={styles.imageStyle}
                        />
                    </View>
                    <TouchableOpacity
                        activeOpacity={0.5}
                        style={styles.buttonStyle}
                        onPress={() => captureImage('photo')}>
                        <Text style={styles.textStyle}>
                            Launch Camera for Image
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        activeOpacity={0.5}
                        style={styles.buttonStyle}
                        onPress={() => chooseFile('photo')}>
                        <Text style={styles.textStyle}>Choose Image</Text>
                    </TouchableOpacity>
                </View>
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => laporkeun()}>
                    <Text style={styles.buttonTitle}>Kirim Laporan</Text>
                </TouchableOpacity>
            </KeyboardAwareScrollView>
        </View>
    );
}
