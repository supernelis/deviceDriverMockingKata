<?php
namespace DeviceDriver;

class ReadFailureException extends \Exception
{
    public function __construct($message)
    {
        parent::__construct($message);
    }
}
