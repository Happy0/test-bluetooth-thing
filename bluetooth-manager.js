const pull = require('pull-stream');
const Pushable = require('pull-pushable');
import BluetoothSerial from 'react-native-bluetooth-serial'

export default (connectionManager) => {

  const serviceUUID = "b0b2e90d-0cda-4bb0-8e4b-fb165cd17d48";

  const connections = {

  };

  function onConnect(params) {
    const deviceAddress = params.remoteAddress;

    // Source: reading from the remote device
    // Sink: writing to the remote device
    const duplexStream = {
      source: Pushable(),
      sink: pull.drain((data) => BluetoothSerial.writeToDevice(deviceAddress, btoa(data)))
    }

    connections[deviceAddress] = duplexStream;

    /**
     * Details about the connection: the remote bluetooth address, and whether
     * the connection was incoming or outgoing.
     */
    var connectionDetails = {
      remoteAddress: deviceAddress,
      isIncoming: params.isIncoming
    }

    // Hand the new connection to the connection manager which will read from and write
    // to the duplex stream until it is indicated the stream has ended when 'end' is called
    // on the source
    connectionManager.onNewConnection(duplexStream, connectionDetails);
  }

  function onConnectionFailed(params) {
    const deviceAddress = params.remoteAddress;

    const duplexStream = connections[deviceAddress];

    if (duplexStream) {
      duplexStream.source.end();
      delete connections[deviceAddress];
    }

  }

  function onConnectionLost(params) {
    const deviceAddress = params.remoteAddress;

    const duplexStream = connections[deviceAddress];

    if (duplexStream) {
      duplexStream.source.end();
      delete connections[deviceAddress];
    }
  }

  function onDataRead(params) {
    const deviceAddress = params.remoteAddress;
    const data = params.data;

    const duplexStream = connections[deviceAddress];

    if (duplexStream) {
      duplexStream.source.push(data);
    } else {
      console.log("Unexpectedly didn't find address in device map.")
    }

  }

  function setupEventListeners() {
    BluetoothSerial.on("connectionSuccess", onConnect);
    BluetoothSerial.on("connectionLost", onConnectionLost);
    BluetoothSerial.on("connectionFailed", onConnectionFailed);
    BluetoothSerial.on("read", onDataRead);
  }

  function start() {
    setupEventListeners();
  }

  function listenForIncomingConnections() {
    BluetoothSerial.listenForIncomingConnections(
      "scuttlebutt", serviceUUID
    ).then(() => BluetoothSerial.makeDeviceDiscoverable(120));
  }

  function discoverUnpairedDevices() {
    return BluetoothSerial.discoverUnpairedDevices();
  }

  function listPairedDevices() {
    return BluetoothSerial.list();
  }

  function connect(address) {
    BluetoothSerial.connect(address, "b0b2e90d-0cda-4bb0-8e4b-fb165cd17d48");
  }

  return {
    start,
    discoverUnpairedDevices,
    listenForIncomingConnections,
    listPairedDevices,
    connect
  }

}
