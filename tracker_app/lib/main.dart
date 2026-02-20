import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;
import 'package:permission_handler/permission_handler.dart'; // Add this import

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return const MaterialApp(home: TrackerPage());
  }
}

class TrackerPage extends StatefulWidget {
  const TrackerPage({super.key});

  @override
  State<TrackerPage> createState() => _TrackerPageState();
}

class _TrackerPageState extends State<TrackerPage> {
  late IO.Socket socket;
  String status = "Stopped";
  String deviceId = "MyPhone01"; 

  @override
  void initState() {
    super.initState();
    initSocket();
  }

  void initSocket() {
    // ▼▼▼▼▼ CHANGE THIS LINE BELOW ▼▼▼▼▼
    // Example: 'http://192.168.1.5:3000'
    socket = IO.io('http://192.168.1.108:3000', <String, dynamic>{
      'transports': ['websocket'],
      'autoConnect': false,
    });
    socket.connect();
    
    socket.onConnect((_) {
      print("Connected to Server");
      setState(() => status = "Connected to Server");
    });

    socket.onDisconnect((_) => print("Disconnected"));
  }

  Future<void> startTracking() async {
    // 1. Request Permission using permission_handler
    var status = await Permission.location.request();
    if (status.isDenied) {
        setState(() => this.status = "Permission Denied");
        return;
    }

    // 2. Start Listening to GPS
    setState(() => this.status = "Tracking...");
    const locationSettings = LocationSettings(
      accuracy: LocationAccuracy.high,
      distanceFilter: 10, 
    );

    Geolocator.getPositionStream(locationSettings: locationSettings)
        .listen((Position position) {
      
      // 3. Send data to server
      socket.emit('update_location', {
        'id': deviceId,
        'lat': position.latitude,
        'lng': position.longitude,
      });

      setState(() => this.status = "Sent: ${position.latitude}, ${position.longitude}");
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("DIY GPS Tracker")),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(status, textAlign: TextAlign.center),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: startTracking,
              child: const Text("Start Sharing Location"),
            )
          ],
        ),
      ),
    );
  }
}
