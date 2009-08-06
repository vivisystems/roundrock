<?php
App::import('Core', array('CakeLog'));

class OrderAnnotation extends AppModel {
    var $name = 'OrderAnnotation';
    var $useDbConfig = 'order';

    var $actsAs = array('Sync');
}

?>
