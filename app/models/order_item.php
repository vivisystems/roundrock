<?php
App::import('Core', array('CakeLog'));

class OrderItem extends AppModel {
    var $name = 'OrderItem';
    var $useDbConfig = 'order';

    var $actsAs = array('Sync');
    
}

?>
