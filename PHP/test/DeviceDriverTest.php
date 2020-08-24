<?php
namespace Test;

use DeviceDriver\DeviceDriver;
use PHPUnit\Framework\TestCase;

class DeviceDriverTest extends TestCase
{

    /** @test */
    public function read_From_Hardware()
    {
        // TODO: replace hardware with a Test Double
        $hardware = null;
        $driver = new DeviceDriver($hardware);

        $data = $driver->read(0xFF);

        $this->assertEquals(0, $data);
    }

}
