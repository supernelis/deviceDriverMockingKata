/*
 * FlashMemoryDevice represents the interface to a Flash Memory Device.
 * The hardware has only two methods - 'read' and 'write'
 * However, the interface for using the device is a lot more complex than that.
 * It is outlined in the top-level README file.
 */
typedef unsigned char byte;

extern byte read(const unsigned long address);
extern void write(const unsigned long address, const byte data);
