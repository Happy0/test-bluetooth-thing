import React from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';

import BluetoothManager from './bluetooth-manager'

var pull = require('pull-stream');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  }
});

export default class App extends React.Component {

  constructor(props) {
    super(props);

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
    this.bluetoothManager = BluetoothManager(connectionManager);
    this.state = { unpairedDevices: [], pairedDevices: [] };
  }

  componentDidMount() {

    this.bluetoothManager.start();
    this.bluetoothManager.listenForIncomingConnections();

    this.searchUnpairedDevices(this.bluetoothManager);

    this.bluetoothManager.listPairedDevices().then(paired => {
      this.setState({
        pairedDevices: paired
      })
    })

  }

  searchUnpairedDevices() {
    this.bluetoothManager.discoverUnpairedDevices().then(unpaired => {
      this.setState({
        unpairedDevices: unpaired
      })
    }).then( () => setTimeout(() => this.searchUnpairedDevices(this.bluetoothManager), 10000) );
  }

  renderDeviceInfo(bluetoothManager, device) {
    console.log(device);

    return (<Button onPress={() => bluetoothManager.connect(device.remoteAddress)} title={device.name ? device.name : "Unknown"}></Button>)
  }

  renderSearching() {
    return (<Text> Searching for devices ... </Text>)
  }

  renderContent() {
    var unpairedDevices = this.state.unpairedDevices;
    var pairedDevices = this.state.pairedDevices;

    if (unpairedDevices.length === 0 && pairedDevices.length === 0 ) {
      return this.renderSearching();
    } else {
      return (
        <View>
          <Text> Unpaired </Text>
          { unpairedDevices.map(info => this.renderDeviceInfo(this.bluetoothManager, info)) }

          <Text> Paired </Text>
          { pairedDevices.map(info => this.renderDeviceInfo(this.bluetoothManager, info)) }
        </View>
      );
    }
  }

  render() {

      return (
          <View style={styles.container} >
                  { this.renderContent() }
          </View>
      )
  }

}
