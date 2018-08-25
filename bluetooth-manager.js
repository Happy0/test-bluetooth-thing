const pull = require('pull-stream');
const Pushable = require('pull-pushable');
import BluetoothSerial from 'react-native-bluetooth-serial'

export default (connectionManager) => {

  const connections = {

  };

  function onConnect(params) {
    const deviceAddress = params.remoteAddress;

    // Source: reading from the remote device
    // Sink: writing to the remote device
    const duplexStream = {
      source: Pushable(),
      sink: pull.drain((data) => BluetoothSerial.writewriteToDevice(deviceAddress, data))
    }

    connections[deviceAddress] = duplexStream;

    console.log("Incoming: " + deviceAddress);

    // Hand the new connection to the connection manager which will read from and write
    // to the duplex stream until it is indicated the stream has ended when 'end' is called
    // on the source
    connectionManager.onNewConnection(duplexStream);
  }

  function onConnectionFailed(params) {
    const deviceAddress = params.remoteAddress;

    const duplexStream = connections[deviceAddress];

    if (duplexStream) {
      duplexStream.source.end();

      delete connections[deviceAddress];
    }

    console.log("ssb-bluetooth-manager: " + deviceAddress + " connect failed");

  }

  function onConnectionLost(params) {
    const deviceAddress = params.remoteAddress;

    const duplexStream = connections[deviceAddress];

    if (duplexStream) {
      duplexStream.source.end();

      delete connections[deviceAddress];
    }

    console.log("ssb-bluetooth-manager: " + deviceAddress + " connection lost");
  }

  function onDataRead(params) {
    const deviceAddress = params.remoteAddress;
    const data = params.data;

    const duplexStream = connections[deviceAddress];

    if (duplexStream) {
      duplexStream.source.push(data);
    } else {
      throw new Error("Unexpectedly didn't find address in device map.")
    }

    console.log("ssb-bluetooth-manager: " + deviceAddress + " data read: " + data);
  }

  function setupEventListeners() {
    BluetoothSerial.on("connectionSuccess", onConnect);
    BluetoothSerial.on("connectionLost", onConnectionLost);
    BluetoothSerial.on("connectionFailed", onConnectionFailed);
    BluetoothSerial.on("read", onDataRead);
  }

  function start() {

    setupEventListeners();

    BluetoothSerial.listenForIncomingConnections(
      "scuttlebutt", "b0b2e90d-0cda-4bb0-8e4b-fb165cd17d48"
    ).then(() => BluetoothSerial.makeDeviceDiscoverable(120));
  }

  return {
    start
  }

}
