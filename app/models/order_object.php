<?php
App::import('Core', array('CakeLog'));

class OrderObject extends AppModel {
    var $name = 'OrderObject';
    var $useDbConfig = 'order';

    var $actsAs = array('Sync');

}

?>
