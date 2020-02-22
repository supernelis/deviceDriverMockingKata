#include "DeviceDriver.h"
#include <stdio.h> /* printf */

int main()
{
    DriverStatus result = driver_write(100, 20);
    printf("write status %d\n", result);

    return 0;
}

/* fake devide methods */
Byte device_read(const Address address)
{
    printf("device_read %d\n", address);
    if (address == 0) {
        return 2; /* ready */
    }
    if (address == 100) {
        return 20; /* verify write */
    }
    return 1;
}
void device_write(const Address address, const Byte data)
{
    printf("device_write %d: %d\n", address, data);
}
