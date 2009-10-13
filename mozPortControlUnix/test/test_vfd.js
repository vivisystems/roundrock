var p = Components.classes["@firich.com.tw/serial_port_control_unix;1"].getService(Components.interfaces.nsISerialPortControlUnix);
var t = p.openPort("/dev/ttyUSB0", "9600,none,8,1,none");

//alert( p.writePort("/dev/ttyUSB0", "TEST SKY Good",  14));
alert(p.writePort("/dev/ttyUSB0", "\u001b\u0012TEST", 6));
//alert(p.statusPort("/dev/ttyUSB0"));

t = p.closePort("/dev/ttyUSB0");