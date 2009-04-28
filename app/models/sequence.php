<?php

class Sequence extends AppModel {
    var $name = 'Sequence';

    function getSequence($key = 'default') {

        $data = $this->findByKey($key);

        if ($data) {
            $id = $data['Sequence']['id'];
            $value = $data['Sequence']['value'];
            $value++;
            $this->id = $id;
            $this->save(array('value'=>$value));
        }else {
            $value = 1;
            $this->create();
            $newData = array('id'=> String::uuid() , 'key'=> $key, 'value'=>$value);
            $this->save($newData);
        }

        return $value;

    }

    function setSequence($key = 'default', $value = 0) {
        
        $data = $this->findByKey($key);

        if ($data) {
            $id = $data['Sequence']['id'];
            $this->id = $id;
            $this->save(array('value'=>$value));

        }else {
            $this->create();
            $newData = array('id'=> String::uuid() , 'key'=> $key, 'value'=>$value);
            $this->save($newData);
        }

        return $value;

    }

    function resetSequence($key = 'default', $value = 0) {

        return $this->setSequence($key, $value);
        
    }
}

?>
