#include "DeviceDriver.h"
/*
 * DeviceDriver is used by the operating system to interact with the hardware 'FlashMemoryDevice'.
 */

const Address init_address = 0x0;

const Byte program_command = 0x40;
const Byte ready_mask = 0x02;
const Byte ready_no_error = 0x00;

// const unsigned long timeout_threshold = 100_000_000;

const Byte reset_command = 0xff;
const Byte vpp_mask = 0x20;
const Byte internal_error_mask = 0x10;
const Byte protected_block_error_mask = 0x08;

Byte driver_read(const Address address)
{
    return device_read(address);
}

DriverStatus driver_write(const Address address, const Byte data)
{
    Byte readyByte;
    // long start = System.nanoTime();
    device_write(init_address, program_command);
    device_write(address, data);

    while (((readyByte = driver_read(init_address)) & ready_mask) == 0) {
        if (readyByte != ready_no_error) {
            device_write(init_address, reset_command);
            if ((readyByte & vpp_mask) > 0) {
                return ErrorWriteVpp;
            }
            if ((readyByte & internal_error_mask) > 0) {
                return ErrorWriteInternal;
            }
            if ((readyByte & protected_block_error_mask) > 0) {
                return ErrorWriteProtectedBlock;
            }
        }
        // if (System.nanoTime() - start > timeout_threshold)
        // {
        //   return ErrorWriteTimeout;
        // }
    }
    Byte actual = driver_read(address);
    if (data != actual) {
        return ErrorReadFailure;
    }

    return Ok;
}
