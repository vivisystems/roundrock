<?php
App::import('Core', array('CakeLog'));

class OrderPromotion extends AppModel {
    var $name = 'OrderPromotion';
    var $useDbConfig = 'order';

    var $actsAs = array('Sync');
}

?>
