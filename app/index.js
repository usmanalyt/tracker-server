import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import * as Location from 'expo-location';
import io from 'socket.io-client';

// ▼▼▼▼ REPLACE THIS WITH YOUR LAPTOP IP ▼▼▼▼
const SOCKET_URL = 'http://192.168.1.108:3000'; 
// ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲

export default function App() {
  const [status, setStatus] = useState('Disconnected');
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // connect to server
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    newSocket.on('connect', () => setStatus('Connected to Server!'));
    newSocket.on('connect_error', (err) => setStatus('Error: ' + err.message));

    return () => newSocket.close();
  }, []);

  const startTracking = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setStatus('Permission Denied');
      return;
    }

    setStatus('Tracking...');
    
    await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.High, timeInterval: 2000, distanceInterval: 10 },
      (loc) => {
        if (socket) {
          socket.emit('update_location', {
            id: 'iPhone8',
            lat: loc.coords.latitude,
            lng: loc.coords.longitude,
          });
          setStatus(`Sent: ${loc.coords.latitude.toFixed(4)}, ${loc.coords.longitude.toFixed(4)}`);
        }
      }
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>MY CUSTOM TRACKER</Text>
      <Text style={styles.status}>{status}</Text>
      <Button title="Start Tracking" onPress={startTracking} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  text: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  status: { marginBottom: 20, color: 'blue', textAlign: 'center' }
});
