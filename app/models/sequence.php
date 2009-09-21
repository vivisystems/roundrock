<?php
App::import('Core', array('CakeLog'));

class Sequence extends AppModel {
    var $name = 'Sequence';

    function getSequence($keys = 'default') {

        $result = array();
        $arKeys = explode(",", $keys);

        $this->begin();

        foreach ($arKeys as $key) {

            $data = $this->findByKey($key);

            if ($data) {
                $id = $data['Sequence']['id'];
                $value = $data['Sequence']['value'];
                $maxValue = $data['Sequence']['max_value'];
                $value++;
                if ($maxValue != 0 && $value > $maxValue) {
                    $value = 1;
                }
                $this->id = $id;
                $success = $this->save(array('value'=>$value));
                if(!$success) {
                    // try again
                    CakeLog::write('warning', 'Error update sequence to ' . $value );
                    $this->save(array('value'=>$value));
                }
            }else {
                $value = 1;
                $this->create();
                $newData = array('id'=> String::uuid() , 'key'=> $key, 'value'=>$value, 'max_value'=>0);
                $success = $this->save($newData);
                if(!$success) {
                    // try again
                    CakeLog::write('warning', 'Error update sequence to ' . $value );
                    $this->save($newData);
                }

            }

            array_push($result, $value);
        }

        $this->commit();

        return implode(",", $result);

    }

    function setSequence($key = 'default', $value = 0) {

        $this->begin();
        
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

        $this->commit();

        return $value;

    }

    function resetSequence($key = 'default', $value = 0) {

        return $this->setSequence($key, $value);
        
    }
}

?>