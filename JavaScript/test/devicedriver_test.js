const {expect, assert} = require('chai');
const {DeviceDriver, ReadFailureException, TimeoutException} = require('../src/devicedriver');

describe("Device Driver", function () {
    const AN_ADDRESS = 0xFF;
    const READY = 2;
    const A_VALUE = 0;

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
        const hardware = {
            read: () => {
                return 2
            }, write: (address, data) => {
                writeData.push({'address': address, 'data': data});
            }
        };
        const driver = new DeviceDriver(hardware);

        driver.write(0xFF, 2);

        let firstValue = writeData[0];
        expect(firstValue['address']).to.equal(0x00);
        expect(firstValue['data']).to.equal(0x40);

        let secondValue = writeData[1];
        expect(secondValue['address']).to.equal(0xFF);
        expect(secondValue['data']).to.equal(2);
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
