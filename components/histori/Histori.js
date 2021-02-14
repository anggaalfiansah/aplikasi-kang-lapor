/* eslint-disable prettier/prettier */
/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {useState, useEffect} from 'react';
import {
  StyleSheet,
  FlatList,
  SafeAreaView,
  Text,
  View,
  Image,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import {Divider} from 'react-native-elements';
import {ActivityIndicator} from 'react-native';

const Histori = () => {
  const [loading, setLoading] = useState(true); // Set loading to true on component mount
  const [data, setData] = useState([]);

  useEffect(() => {
    const subscriber = firestore()
      .collection('laporan')
      .onSnapshot((querySnapshot) => {
        const laporan = [];
        querySnapshot.forEach((documentSnapshot) => {
          laporan.push({
            ...documentSnapshot.data(),
            key: documentSnapshot.id,
          });
        });
        setData(laporan);
        setLoading(false);
        console.log(data);
      });

    // Unsubscribe from events when no longer in use
    return () => subscriber();
  });
  if (loading) {
    return <ActivityIndicator />;
  }
  return data.length > 0 ? (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={data}
        ItemSeparatorComponent={() => (
          <Divider style={{backgroundColor: 'black'}} />
        )}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({item, index}) => {
          return (
            <View style={[styles.listItem.marginBottom,{marginHorizontal:20, marginVertical:20, paddingHorizontal:10, borderWidth:1, borderColor:'gray'}]}>
                <Text style={{textAlign: 'center', fontSize:20, fontWeight:'bold', marginTop:10}}>{item.nama}</Text>
                <Text style={{textAlign: 'center', marginBottom: 20, fontSize:12}}>{item.waktu}</Text>
                <Text style={{fontWeight: 'bold'}}>Laporan {item.jenis}</Text>
                <Text style={{ marginBottom:5}}>{item.id}</Text>
                <Text style={{fontWeight: 'bold'}}>Keterangan      : </Text>
                <Text>{item.keterangan}</Text>
                <Text style={{fontWeight: 'bold'}}>Alamat              :</Text>
                <Text>{item.alamat}</Text>
                <Image style={{height:300, width: '100%', marginVertical:10}} source={{uri:item.image}}/>
            </View>
          );
        }}
      />
    </SafeAreaView>
  ) : (
    <View style={styles.textContainer}>
      <Text style={styles.emptyTitle}>Tidak Ada Laporan</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listItem: {
    marginTop: 8,
    marginBottom: 8,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleStyle: {
    fontSize: 30,
  },
  subtitleStyle: {
    fontSize: 18,
  },
  emptyTitle: {
    fontSize: 32,
    marginBottom: 16,
  },
  emptySubtitle: {
    fontSize: 18,
    fontStyle: 'italic',
  },
});

export default Histori;
