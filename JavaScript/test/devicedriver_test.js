const {expect, assert} = require('chai');
const {DeviceDriver, ReadFailureException, TimeoutException} = require('../src/devicedriver');

describe("Device Driver", function () {
    const INIT_ADDRESS = 0x00;
    const PROGRAM_COMMAND = 0x40;
    const AN_ADDRESS = 0xCC;
    const READY = 2;
    const BUSY = 0;
    const A_VALUE = 0;
    const ANOTHER_VALUE = 5;
    const RESET_COMMAND = 0xFF;
    const TRIGGER_RESET = 1;

    let writeLog;
    let memory;
    let hardware;
    let driver;

    beforeEach(() => {
        writeLog = [];
        memory = {};
        memory[INIT_ADDRESS] = READY;
        hardware = {
            read: (address) => memory[address],
            write: (address, data) => {
                writeLog.push({'address': address, 'data': data});
            }
        };
        driver = new DeviceDriver(hardware);
    });


    it("reads an address", function () {
        memory[AN_ADDRESS] = A_VALUE;

        const data = driver.read(AN_ADDRESS);

        expect(data).to.equal(A_VALUE);
    });

    it("initialise and writes to an address", () => {
        memory[AN_ADDRESS] = A_VALUE;

        driver.write(AN_ADDRESS, A_VALUE);

        let firstValue = writeLog[0];
        expect(firstValue['address']).to.equal(INIT_ADDRESS);
        expect(firstValue['data']).to.equal(PROGRAM_COMMAND);

        let secondValue = writeLog[1];
        expect(secondValue['address']).to.equal(AN_ADDRESS);
        expect(secondValue['data']).to.equal(A_VALUE);
    });

    it('read failure', () => {
        memory[AN_ADDRESS] = ANOTHER_VALUE;

        assert.throw(() => {
            driver.write(AN_ADDRESS, A_VALUE);
        }, ReadFailureException);
    });

    it('checks if the hardware is ready after a write', () => { // needs work
        let initAddressReads = 0;
        hardware.read = (address) => {
            if (address === INIT_ADDRESS && initAddressReads === 0) {
                initAddressReads++;
                return BUSY;
            }
            if (address === INIT_ADDRESS && initAddressReads === 1) {
                initAddressReads++;
                return READY;
            }

            return A_VALUE;
        }

        driver.write(AN_ADDRESS, A_VALUE);

        expect(initAddressReads).to.equal(2);
    });

    it('timeout', () => {
        const alwaysBusyReadHardware = {
            read: () => BUSY,
            write: () => {
            }
        }
        const busyDriver = new DeviceDriver(alwaysBusyReadHardware);

        assert.throw(() => {
            busyDriver.write(AN_ADDRESS, ANOTHER_VALUE)
        }, TimeoutException);
    });

    it('resets hardware when it is not ready after write', () => {
        let readSequenceToTriggerReset = [TRIGGER_RESET, READY, ANOTHER_VALUE];
        const h = {
            read: () => readSequenceToTriggerReset.shift(),
            write: (address, data) => {
                hardware.write(address, data);
            }
        }
        const device = new DeviceDriver(h);

        device.write(AN_ADDRESS, ANOTHER_VALUE);

        const value = writeLog[writeLog.length - 1];
        expect(value.address).to.equal(INIT_ADDRESS);
        expect(value.data).to.equal(RESET_COMMAND);
    });
});
