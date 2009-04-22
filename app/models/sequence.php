<?php

class Sequence extends AppModel {
    var $name = 'Sequence';

    function getSequence($key = 'default') {

        $data = $this->findByKey($key);

        $id = $data['Sequence']['id'];
        $value = $data['Sequence']['value'];
        $value++;

        $this->id = $id;
        $this->save(array('value'=>$value));
        return $value;

    }

    function setSequence() {

    }

    function resetSequence($key = 'default', $value = 0) {

        $data = $this->findByKey($key);

        $id = $data['Sequence']['id'];

        $this->id = $id;
        $this->save(array('value'=>$value));
        return $value;
        
    }
}

?>