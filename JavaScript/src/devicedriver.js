const nanoTime = require('nano-time');

const INIT_ADDRESS = 0X0;
const PROGRAM_COMMAND = 0X40;
const READY_MASK = 0x02;
const READY_NO_ERROR = 0x00;
const TIMEOUT_THRESHOLD = 100_000_000;
const RESET_COMMAND = 0xFF;
const VPP_MASK = 0x20;
const INTERNAL_ERROR_MASK = 0x10;
const PROTECTED_BLOCK_ERROR_MASK = 0X08;

/**
 * This class is used by the operating system to interact with the hardware.
 */
class DeviceDriver {
    constructor(hardware) {
        this.hardware = hardware;
    }

    read(address) {
        return this.hardware.read(address);
    }

    write(address, data) {
        let start = nanoTime();
        this.hardware.write(INIT_ADDRESS, PROGRAM_COMMAND);
        this.hardware.write(address, data);
        var readyByte;
        while (((readyByte = read(INIT_ADDRESS)) & READY_MASK) == 0) {
            if (readyByte != READY_NO_ERROR) {
                this.hardware.write(INIT_ADDRESS, RESET_COMMAND);
                if ((readyByte & VPP_MASK) > 0) {
                    throw new VppException();
                }
                if ((readyByte & INTERNAL_ERROR_MASK) > 0) {
                    throw new InternalErrorException();
                }
                if ((readyByte & PROTECTED_BLOCK_ERROR_MASK) > 0) {
                    throw new ProtectedBlockException();
                }
            }
            if (nanoTime() - start > TIMEOUT_THRESHOLD) {
                throw new TimeoutException('Timeout when trying to read data from memory');
            }
        }
        const actual = read(address);
        if (data != actual) {
            throw ReadFailureException('Failed to read data from memory');
        }
    }
}

class VppException extends Error {
    constructor() {
        super('vpp exception');
    }
}

class InternalErrorException extends Error {
    constructor() {
        super('internal error');
    }
}

class ProtectedBlockException extends Error {
    constructor() {
        super('protected block');
    }
}

class TimeoutException extends Error {
    constructor() {
        super(message);
    }
}

class ReadFailureException extends Error {
    constructor() {
        super(message);
    }
}

module.exports = {
    DeviceDriver,
    VppException,
    InternalErrorException,
    ProtectedBlockException,
    TimeoutException,
    ReadFailureException
};
