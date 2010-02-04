<?php
App::import('Core', array('CakeLog'));

class Sequence extends AppModel {
    var $name = 'Sequence';


    /**
     * getSequence
     * @param <type> $keys
     * @return <type> 
     */
    function getSequence($keys = 'default', $initial = 1, $increment = true) {

        $result = array();
        $arKeys = explode(",", $keys);

        $this->beginExclusive();

        foreach ($arKeys as $key) {

            $data = $this->findByKey($key);

            if ($data) {
                $id = $data['Sequence']['id'];
                $value = $data['Sequence']['value'];
                $maxValue = $data['Sequence']['max_value'];
                if ($increment) {
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
		}
            }else {
                $value = $initial;
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


    /**
     * setSequence
     * @param <type> $key
     * @param <type> $value
     * @return <type> 
     */
    function setSequence($key = 'default', $value = 0) {

        $this->beginExclusive();
        
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


    /**
     * setSequenceMaxValue
     * @param <type> $key
     * @param <type> $value
     * @return <type> 
     */
    function setSequenceMaxValue($key = 'default', $value = 0) {

        $this->beginExclusive();
        
        $data = $this->findByKey($key);

        if ($data) {
            $id = $data['Sequence']['id'];
            $this->id = $id;
            $this->save(array('max_value'=>$value));

        }else {
            $this->create();
            $newData = array('id'=> String::uuid() , 'key'=> $key, 'value'=>'0', 'max_value'=>$value);
            $this->save($newData);
        }

        $this->commit();

        return $value;

    }
    

    /**
     * resetSequence
     * @param <type> $key
     * @param <type> $value
     * @return <type> 
     */
    function resetSequence($key = 'default', $value = 0) {

        return $this->setSequence($key, $value);
        
    }

    function removeSequence($key = 'default') {
        $data = $this->findByKey($key);

        if ($data) {
            return $this->delete($data['Sequence']['id']);
        }
        else
            return -1;
    }
}

?>
