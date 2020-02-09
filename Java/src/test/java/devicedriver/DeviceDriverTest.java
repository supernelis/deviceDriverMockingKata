package devicedriver;

import org.junit.jupiter.api.Test;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.is;

class DeviceDriverTest {

  @Test
  void read_From_Hardware() {
    // TODO: replace hardware with a Test Double
    FlashMemoryDevice hardware = null;
    final DeviceDriver driver = new DeviceDriver(hardware);

    final byte data = driver.read(0xFF);

    assertThat(data, is(0));
  }
}
