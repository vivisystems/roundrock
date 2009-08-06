<?php
App::import('Core', array('CakeLog'));

class OrderAddition extends AppModel {
    var $name = 'OrderAddition';
    var $useDbConfig = 'order';

    var $actsAs = array('Sync');

}

?>
