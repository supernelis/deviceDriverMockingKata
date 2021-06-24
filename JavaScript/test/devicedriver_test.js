const {expect, assert} = require('chai');
const {DeviceDriver, ReadFailureException, TimeoutException} = require('../src/devicedriver');

describe("Device Driver", function () {
    const INIT_ADDRESS = 0x00;
    const PROGRAM_COMMAND = 0x40;
    const AN_ADDRESS = 0xFF;
    const READY = 2;
    const A_VALUE = 0;
    const ANOTHER_VALUE = 5;

    it("reads an address", function () {
        const hardware = {
            read: () => A_VALUE
        };
        const driver = new DeviceDriver(hardware);

        const data = driver.read(AN_ADDRESS);

        expect(data).to.equal(A_VALUE);
    });

    it("initialise and writes to an address", () => {
        let writeData = [];
        const readValues = [READY, ANOTHER_VALUE];
        const hardware = {
            read: () => readValues.shift(),
            write: (address, data) => {
                writeData.push({'address': address, 'data': data});
            }
        };
        const driver = new DeviceDriver(hardware);

        driver.write(AN_ADDRESS, ANOTHER_VALUE);

        let firstValue = writeData[0];
        expect(firstValue['address']).to.equal(INIT_ADDRESS);
        expect(firstValue['data']).to.equal(PROGRAM_COMMAND);

        let secondValue = writeData[1];
        expect(secondValue['address']).to.equal(AN_ADDRESS);
        expect(secondValue['data']).to.equal(ANOTHER_VALUE);
    });

    it('read failure', () => {
        const hardware = {
            read: () => 2, write: () => {
            }
        }
        const driver = new DeviceDriver(hardware);
        assert.throw(() => {
            driver.write(0xFF, 5)
        }, ReadFailureException);
    });

    it('checks if the hardware is ready after a write', () => {
        let readCallCount = 0;
        const testData = 5;
        const readValues = [0, 2, testData];
        const hardware = {
            read: () => {
                readCallCount++;
                return readValues.shift();
            },
            write: () => {
            }
        }
        const driver = new DeviceDriver(hardware);

        driver.write(0xFF, testData);

        expect(readCallCount).to.equal(3);
    });

    it('timeout', () => {
        const hardware = {
            read: () => 0,
            write: () => {
            }
        }
        const driver = new DeviceDriver(hardware);

        assert.throw(() => {
            driver.write(0xFF, 5)
        }, TimeoutException);
    });

    it('resets hardware when it is not ready after write', () => {
        let testData = 8;
        let writeData;
        let readValues = [1, READY, testData];
        const hardware = {
            read: () => readValues.shift(),
            write: (address, data) => {
                writeData = {
                    address: address,
                    data: data
                }
            }
        }
        const device = new DeviceDriver(hardware);
        device.write(0xCC, testData);

        expect(writeData.address).to.equal(0x00);
        expect(writeData.data).to.equal(0xFF);
    });
});
