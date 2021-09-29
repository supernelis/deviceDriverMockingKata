const {DeviceDriver} = require('../src/devicedriver');

describe("", () => {
    const AN_ADDRESS = 0xCC;
    const A_VALUE = 0;

    let hardware;
    let driver;

    beforeEach(() => {
        driver = new DeviceDriver(hardware);
    });

    it("reads an address", function () {
        memory[AN_ADDRESS] = A_VALUE;

        const data = driver.read(AN_ADDRESS);

        expect(data).to.equal(A_VALUE);
    });
});