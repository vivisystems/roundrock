<?php
App::import('Core', array('CakeLog'));

class OrderQueue extends AppModel {

    var $name = 'OrderQueue';
    var $useDbConfig = 'order';

    //var $actsAs = array('Sync');

    function pushQueue($id, $datas) {

        $result = false;

        try {

            $this->begin();

            $this->id;
            $r = $this->save($datas);

            if (!empty($r)) $result = true;

            $this->commit();

        }catch(Exception $e) {

            CakeLog::write('error', 'Exception pushQueue \n' .
                '  Exception: ' . $e->getMessage() . "\n" );

            $this->rollback();
            $result = false;
        }

        return $result;
    }

    function popQueue($id) {
        
        if (empty($id)) return null;

        $result = $this->findById($id);

        if ($result) {

            $obj = $result['OrderQueue']['object'];

            $this->id = $id;
            $this->save(array('object'=>'', 'status'=> -1));

            return $obj;
        }
        
        return null;

    }

    function getQueueSummaries($user, $mode) {

       $conditions = array();

       if (!empty($user) && $user != '__ALL__') $conditions['user'] = $user;
       $conditions['mode'] = $mode;
       $conditions['status'] = 1;

       $result = $this->find('all', array('conditions' => $conditions, 'fields'=>'id,user,seq,summary,created'));
       
       return Set::classicExtract($result, '{n}.OrderQueue');
       
    }

    function getUserQueueCount($user) {

        if (empty($user)) return 0;

        $count = $this->find('count', array('conditions' => "user='$user'"));

        return $count;
    }


    function removeUserQueue($user) {

        if (empty($user)) return 0;

        $result = $this->query("UPDATE " . $this->table . " SET status=-1, object=NULL WHERE user='" . $user ."'");

        return $result;
        
    }
}

?>