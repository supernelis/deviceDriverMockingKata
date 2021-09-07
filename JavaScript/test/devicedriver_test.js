const {expect, assert} = require('chai');
const {DeviceDriver, ReadFailureException, TimeoutException, VppException} = require('../src/devicedriver');

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

    it('checks if the hardware is ready after a write', () => {
        let readSequenceForInitAddress = [BUSY, READY];
        hardware.read = (address) => {
            if (address === INIT_ADDRESS) {
                return readSequenceForInitAddress.shift();
            }

            return A_VALUE;
        }

        driver.write(AN_ADDRESS, A_VALUE);

        expect(readSequenceForInitAddress.length).to.equal(0);
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
        hardware.read = () => readSequenceToTriggerReset.shift();

        driver.write(AN_ADDRESS, ANOTHER_VALUE);

        const lastWrite = writeLog[writeLog.length - 1];
        expect(lastWrite.address).to.equal(INIT_ADDRESS);
        expect(lastWrite.data).to.equal(RESET_COMMAND);
    });

    it('triggers a VPP problem', () => {
        memory[INIT_ADDRESS] = 0x21;

       assert.throw( () => {
            driver.write(AN_ADDRESS, A_VALUE);
       }, VppException);
    });
});
