const {ProtectedBlockException} = require("../src/devicedriver");
const {InternalErrorException} = require("../src/devicedriver");
const {expect, assert} = require('chai');
const {DeviceDriver, ReadFailureException, TimeoutException, VppException} = require('../src/devicedriver');
const {FlashMemoryDevice} = require("../src/flashmemorydevice");
const sinon = require("sinon");

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
    const READY_BYTE_WITH_INTERNAL_ERROR = 0x11;
    const READY_BYTE_WITH_VPP_PROBLEM = 0x21;
    const READY_BYTE_WITH_PROTECTED_BLOCK_PROBLEM = 0x09;

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

    it("initialise and writes to an address", () => {
        hardware.read = jest.fn();
        hardware.write = sinon.spy();

        hardware.read.mockReturnValueOnce(READY).mockReturnValue(A_VALUE);

        driver.write(AN_ADDRESS, A_VALUE);

        let [address, data] = hardware.write.firstCall.args;
        expect(address).to.equal(INIT_ADDRESS);
        expect(data).to.equal(PROGRAM_COMMAND);

        [address, data] = hardware.write.secondCall.args;
        expect(address).to.equal(AN_ADDRESS);
        expect(data).to.equal(A_VALUE);
    });

});
