package devicedriver;

import org.junit.jupiter.api.Test;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.is;

class DeviceDriverTest {

  @Test
  void foo() {
    FlashMemoryDevice hardware = null;
    final DeviceDriver deviceDriver = new DeviceDriver(hardware);

    final byte bytesRead = deviceDriver.read(0x00);

    assertThat(bytesRead, is(0));
  }
}
