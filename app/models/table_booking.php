<?php
App::import('Model', 'TableSetting');
App::import('Model', 'TableMark');

class TableBooking extends AppModel {
    
    var $name = 'TableBooking';

    //var $useDbConfig = 'table';

    var $belongsTo = array('Table');


    function getTableBookings($startTime, $endTime) {
        $result = $this->find('all', array('recursive' => 0, 'conditions' => 'booking >=' .$startTime. ' AND booking <=' . $endTime, 'order'=>'booking' ));
        return $result;
    }

    
    function getAllTables() {

        $table = new Table();
        $table->unbindModel(array('hasMany'=> array('TableBooking', 'TableOrder'), 'hasOne'=>array('TableStatus')));
        $results =$table->find('all');

        return $results;

    }
    
    function getAvailableTables($bookingTime, $partySize=1, $bookingId='') {
        
        $tableSetting = new TableSetting();
        $tableBookingTimeout = $tableSetting->getSettingValue('TableBookingTimeout') ;
        $tablePeriodLimit = $tableSetting->getSettingValue('TablePeriodLimit');
        
        if(empty($tableBookingTimeout)) $tableBookingTimeout = 30;
        if(empty($tablePeriodLimit)) $tablePeriodLimit = 30;

        $startTime = $bookingTime - $tablePeriodLimit*60;
        $endTime = $startTime + $tableBookingTimeout*60 + $tablePeriodLimit*60;

        $condition = "Table.id NOT IN (SELECT table_id FROM table_bookings WHERE (booking >= $startTime AND booking <= $endTime AND id != '$bookingId')) AND (Table.seats >= $partySize)";

        $table = new Table();

        $table->unbindModel(array('hasMany'=> array('TableBooking', 'TableOrder'), 'hasOne'=>array('TableStatus')));
        $results =$table->find('all', array('conditions'=>$condition));

        return $results;

    }

    function addTableBooking($data) {

        if (empty($data['table_id'])) return false;
        
        $table_id = $data['table_id'];
        $table_no = intval($data['table_no']);

        $this->create();
        $result = $this->save($data);
        
        $this->removeExpireBooking();
        
        $tableStatus = new TableStatus();
        $tableStatus->updateOrderStatusById($table_id, $table_no, false);

        return ($result != false );
    }

    function updateTableBooking($id, $data) {
        
        if (empty($data['table_id'])) return false;

        $table_id = $data['table_id'];
        $table_no = intval($data['table_no']);

        $this->id = $id ;
        $result = $this->save($data);

        $this->removeExpireBooking();
        
        $tableStatus = new TableStatus();
        $tableStatus->updateOrderStatusById($table_id, $table_no, false);

        return ($result != false );
    }


    function removeTableBooking($id) {

        $book = $this->findById($id);

        if (!$book) return false ;

        $this->del($id);

        $this->removeExpireBooking();

        $table_id = $book['TableBooking']['table_id'];
        
        $tableStatus = new TableStatus();
        $tableStatus->updateOrderStatusById($table_id, false, false);

        return true;
    }


    function removeExpireBooking($days=7) {

        $now = time();
        $expireTime = $now - 86400*$days;

        $this->query("DELETE FROM table_bookings WHERE booking < $expireTime");
        
        return true;
    }
}

?>
