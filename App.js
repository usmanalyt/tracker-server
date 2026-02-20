import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button, Alert } from 'react-native';
import * as Location from 'expo-location';
import io from 'socket.io-client';

// ▼▼▼ PUT YOUR EXACT RENDER URL HERE ▼▼▼
const SOCKET_URL = 'https://server-3j5i.onrender.com';
// ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲

export default function App() {
  const [location, setLocation] = useState(null);
  const [status, setStatus] = useState('Waiting...');
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // 1. Connect to Server (Added the WebSocket trick!)
    console.log("Attempting to connect to:", SOCKET_URL);
    const newSocket = io(SOCKET_URL, {
        transports: ['websocket']
    });
    setSocket(newSocket);

    newSocket.on('connect', () => {
      setStatus('Connected to Server!');
      console.log('Connected to server');
    });

    newSocket.on('connect_error', (err) => {
        console.log("Connection Error:", err.message);
        setStatus('Error: Could not find server.');
    });

    return () => newSocket.close();
  }, []);

  const startTracking = async () => {
    // 2. Ask for Permission
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setStatus('Permission to access location was denied');
      return;
    }

    setStatus('Tracking started...');

    // 3. Start Watching Position
    await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 2000, 
        distanceInterval: 10, 
      },
      (newLocation) => {
        setLocation(newLocation);
        
        // 4. Send to Server
        if (socket) {
          socket.emit('update_location', {
            id: 'iPhone8', 
            lat: newLocation.coords.latitude,
            lng: newLocation.coords.longitude,
          });
          setStatus(`Sent: ${newLocation.coords.latitude.toFixed(4)}, ${newLocation.coords.longitude.toFixed(4)}`);
        }
      }
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>MY CUSTOM TRACKER</Text>
      </View>
      <Text style={styles.status}>{status}</Text>
      
      <View style={styles.buttonContainer}>
        <Button title="Start Tracking" onPress={startTracking} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  header: { backgroundColor: 'red', padding: 20, marginBottom: 50, width: '100%', alignItems: 'center' },
  headerText: { color: 'white', fontWeight: 'bold', fontSize: 20 },
  status: { marginBottom: 20, color: 'blue', textAlign: 'center', paddingHorizontal: 20 },
  buttonContainer: { marginTop: 10 }
});
