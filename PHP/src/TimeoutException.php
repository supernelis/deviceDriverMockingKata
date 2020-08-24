<?php
namespace DeviceDriver;

class TimeoutException extends \Exception
{
    public function __construct($message)
    {
        parent::__construct($message);
    }
}
