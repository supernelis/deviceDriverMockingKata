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


    // "test should call all subscribers when exceptions": function () {
    //     var myAPI = { method: function () {} };
    //
    //     var spy = sinon.spy();
    //     var mock = sinon.mock(myAPI);
    //     mock.expects("method").once().throws();
    //
    //     PubSub.subscribe("message", myAPI.method);
    //     PubSub.subscribe("message", spy);
    //     PubSub.publishSync("message", undefined);
    //
    //     mock.verify();
    //     assert(spy.calledOnce);
    // }


    it("reads an address", function () {
        const hardware = sinon.createStubInstance(FlashMemoryDevice);
        hardware.read.returns(A_VALUE);

        const driver = new DeviceDriver(hardware);

        const data = driver.read(AN_ADDRESS);

        expect(data).to.equal(A_VALUE);
    });

    it("initialise and writes to an address", () => {
        hardware.read = sinon.stub();
        hardware.read.withArgs(AN_ADDRESS).returns(A_VALUE);
        hardware.read.withArgs(INIT_ADDRESS).returns(READY);

        hardware.write = sinon.spy();

        driver.write(AN_ADDRESS, A_VALUE);

        let [address, data] = hardware.write.firstCall.args;
        expect(address).to.equal(INIT_ADDRESS);
        expect(data).to.equal(PROGRAM_COMMAND);

        [address, data] = hardware.write.secondCall.args;
        expect(address).to.equal(AN_ADDRESS);
        expect(data).to.equal(A_VALUE);
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
        hardware.read = () => BUSY

        assert.throw(() => {
            driver.write(AN_ADDRESS, ANOTHER_VALUE)
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
        memory[INIT_ADDRESS] = READY_BYTE_WITH_VPP_PROBLEM;

        assert.throw(() => {
            driver.write(AN_ADDRESS, A_VALUE);
        }, VppException);
    });

    it('triggers an internal error', () => {
        memory[INIT_ADDRESS] = READY_BYTE_WITH_INTERNAL_ERROR;

        assert.throw(() => {
            driver.write(AN_ADDRESS, A_VALUE);
        }, InternalErrorException);
    });

    it('triggers a protected block error', () => {
        memory[INIT_ADDRESS] = READY_BYTE_WITH_PROTECTED_BLOCK_PROBLEM;

        assert.throw(() => {
            driver.write(AN_ADDRESS, A_VALUE);
        }, ProtectedBlockException);
    });

});
