/*
 * DeviceDriver is used by the operating system to interact with the hardware 'FlashMemoryDevice'.
 */
typedef unsigned char byte;

extern byte read(const unsigned long address);
extern int write(const unsigned long address, const byte data);

const int error_protected_block = 1;
const int error_read_failure = 2;
const int error_write_timeout = 3;
const int error_vpp = 4;
const int error_internal = 5;
