import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import * as Location from 'expo-location';

// 1. The corrected import for the newest Socket.io version
import { io } from 'socket.io-client';

// 2. Your verified live Render URL
const SOCKET_URL = 'https://server-3j5i.onrender.com'; 

export default function App() {
  const [location, setLocation] = useState(null);
  const [status, setStatus] = useState('Connecting...');
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // 3. Force pure WebSockets so React Native doesn't choke on XHR polling
    const newSocket = io(SOCKET_URL, {
        transports: ['websocket'],
        forceNew: true 
    });
    
    setSocket(newSocket);

    newSocket.on('connect', () => {
      setStatus('Connected to Server!');
    });

    newSocket.on('connect_error', (err) => {
        setStatus('Connect Error: ' + err.message);
    });

    newSocket.on('disconnect', (reason) => {
        setStatus('Disconnected: ' + reason);
    });

    return () => newSocket.close();
  }, []);

  const startTracking = async () => {
    // 4. Fixed the naming conflict so it doesn't break your screen text!
    let { status: permissionStatus } = await Location.requestForegroundPermissionsAsync();
    if (permissionStatus !== 'granted') {
      setStatus('Permission Denied');
      return;
    }

    setStatus('Tracking started...');

    await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 2000, 
        distanceInterval: 10, 
      },
      (newLocation) => {
        setLocation(newLocation);
        
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
