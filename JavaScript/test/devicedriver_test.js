const {expect} = require('chai');
const {DeviceDriver} = require('../src/devicedriver');

describe("Device Driver", function() {

  it("reads an address", function() {
    const hardware = { read: ()=> {return 0}};
    const driver = new DeviceDriver(hardware);

    const data = driver.read(0xFF);

    expect(data).to.equal(0);
  });

  it("writes to an address", () => {
    const hardware = { read: ()=> { return 2 }, write: ()=> {}};
    const driver = new DeviceDriver(hardware);

    driver.write(0xFF, 2);
  });
});
