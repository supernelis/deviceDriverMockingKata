#include "DeviceDriver.h"
#include <sys/time.h>
/*
 * DeviceDriver is used by the operating system to interact with the hardware 'FlashMemoryDevice'.
 */

const Address init_address = 0x0;

const Byte program_command = 0x40;
const Byte ready_mask = 0x02;
const Byte ready_no_error = 0x00;

const long timeout_threshold_microseconds = 100000;

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
    struct timeval start_time;
    struct timeval current_time;
    Byte readyByte;
    long elapsed_microseconds;

    gettimeofday(&start_time, NULL);

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

        /* see https://stackoverflow.com/a/12722972/104143 */
        gettimeofday(&current_time, NULL);
        elapsed_microseconds = (current_time.tv_sec - start_time.tv_sec) * 1000000L + /* */
                               current_time.tv_usec - start_time.tv_usec;
        if (elapsed_microseconds > timeout_threshold_microseconds) {
            return ErrorWriteTimeout;
        }
    }
    Byte actual = driver_read(address);
    if (data != actual) {
        return ErrorReadFailure;
    }

    return Ok;
}
