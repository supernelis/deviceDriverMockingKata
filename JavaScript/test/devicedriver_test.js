const {expect} = require('chai');
const {DeviceDriver} = require('../src/devicedriver');

describe("Device Driver", function() {

  it("should foo", function() {
    // TODO: replace hardware with a Test Double
    const hardware = null;
    const driver = new DeviceDriver(hardware);

    const data = driver.read(0xFF);

    expect(data).to.equal(0);
  });
});
