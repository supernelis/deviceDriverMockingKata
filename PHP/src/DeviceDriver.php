<?php
namespace DeviceDriver;

/**
 * This class is used by the operating system to interact
 * with the hardware 'FlashMemoryDevice'.
 */
class DeviceDriver
{

    const INIT_ADDRESS = 0x00;

    const PROGRAM_COMMAND = 0x40;
    const READY_MASK = 0x02;
    const READY_NO_ERROR = 0x00;

    const TIMEOUT_THRESHOLD = 100000000;

    const RESET_COMMAND = 0xFF;
    const VPP_MASK = 0x20;
    const INTERNAL_ERROR_MASK = 0x10;
    const PROTECTED_BLOCK_ERROR_MASK = 0x08;

    private $hardware;

    public function __construct(FlashMemoryDevice $hardware)
    {
        $this->hardware = $hardware;
    }

    public function read($address)
    {
        return $this->hardware->read($address);
    }

    public function write($address, $data)
    {
        $start = hrtime(false)[1];
        $this->hardware->write(self::INIT_ADDRESS, self::PROGRAM_COMMAND);
        $this->hardware->write($address, $data);
        $readyByte = 0;
        while ((($readyByte = $this->read(self::INIT_ADDRESS)) & self::READY_MASK) == 0) {
            if ($readyByte != self::READY_NO_ERROR) {
                $this->hardware->write(self::INIT_ADDRESS, self::RESET_COMMAND);
                if (($readyByte & self::VPP_MASK) > 0) {
                    throw new VppException();
                }
                if (($readyByte & self::INTERNAL_ERROR_MASK) > 0) {
                    throw new InternalErrorException();
                }
                if (($readyByte & self::PROTECTED_BLOCK_ERROR_MASK) > 0) {
                    throw new ProtectedBlockException();
                }
            }
            if (hrtime(false)[1] - $start > self::TIMEOUT_THRESHOLD) {
                throw new TimeoutException("Timeout when trying to read data from memory");
            }
        }
        $actual = $this->read($address);
        if ($data != $actual) {
            throw new ReadFailureException("Failed to read data from memory");
        }
    }
}
