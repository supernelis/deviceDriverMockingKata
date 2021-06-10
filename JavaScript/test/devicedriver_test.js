const {expect} = require('chai');
const {DeviceDriver} = require('../src/devicedriver');
const {FlashMemoryDevice} = require('../src/flashmemorydevice');

describe("Device Driver", function() {

  it("should foo", function() {
    // TODO: replace hardware with a Test Double
    const hardware = { read: ()=> {return 0}};
    const driver = new DeviceDriver(hardware);

    const data = driver.read(0xFF);

    expect(data).to.equal(0);
  });
});
