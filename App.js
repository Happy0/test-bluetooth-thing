import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import BluetoothManager from './bluetooth-manager'

var pull = require('pull-stream');

export default class App extends React.Component {

  componentDidMount() {

    var connectionManager = {
      onNewConnection: function (duplexStream, connectionDetails) {

          var testValues = [...Array(100).keys()].map(num => "msg" + num);

          console.log("Connection details");
          console.log(connectionDetails);

         // Test that we can write to the stream and that they're received in order
         pull( pull.values(testValues) , duplexStream.sink);

         // Test that we can read from the remote host
         pull(duplexStream.source, pull.drain((msg) => console.log("Drained from sink: " + msg)));

         // In the real app this duplex stream would get handed to multiserv... Or something.

      }
    }

    var bluetoothManager = BluetoothManager(connectionManager);

    bluetoothManager.start();
  }

  render() {
    return (
      <View style={styles.container}>
        <Text>Open up App.js to start working on your app!</Text>
        <Text>Changes you make will automatically reload.</Text>
        <Text>Shake your phone to open the developer menu.</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
