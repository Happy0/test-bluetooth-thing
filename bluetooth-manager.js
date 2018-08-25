const pull = require('pull-stream');
import BluetoothSerial from 'react-native-bluetooth-serial'

export default () => {

  const connections = {

  };

  function onConnect(params) {
    const deviceAddress = params.remoteAddress;

    console.log("ssb-bluetooth-manager: " + deviceAddress + " connect");
  }

  function onConnectionFailed(params) {
    const deviceAddress = params.remoteAddress;

    console.log("ssb-bluetooth-manager: " + deviceAddress + " connect failed");

  }

  function onConnectionLost(params) {
    const deviceAddress = params.remoteAddress;

    console.log("ssb-bluetooth-manager: " + deviceAddress + " connection lost");
  }

  function onDataRead(params) {
    const deviceAddress = params.remoteAddress;
    const data = params.data;

    console.log("ssb-bluetooth-manager: " + deviceAddress + " data read: " + data);
  }

  function setupEventListeners() {
    BluetoothSerial.on("connectionSuccess", onConnect);
    BluetoothSerial.on("connectionLost", onConnectionLost);
    BluetoothSerial.on("connectionFailed", onConnectionFailed);
    BluetoothSerial.on("read", onDataRead);
  }

  function start() {

    console.log("test!");

    setupEventListeners();

    BluetoothSerial.listenForIncomingConnections(
      "scuttlebutt", "b0b2e90d-0cda-4bb0-8e4b-fb165cd17d48"
    ).then(() => BluetoothSerial.makeDeviceDiscoverable(120));
  }

  return {
    start
  }

}
