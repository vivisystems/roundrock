<?php

class TableBookingsController extends AppController {

    var $name = 'TableBookings';

    var $uses = array('TableBooking', 'Table', 'TableSetting', 'TableStatus');

    var $components = array('SyncHandler', 'Security');


    /**
     * getTableBookings
     */
    function getTableBookings($startTime, $endTime =0) {

        $bookings = $this->TableBooking->getTableBookings($startTime, $endTime);

        $result = array('status' => 'ok', 'code' => 200 ,
            'response_data' => $bookings
        );

        $responseResult = $this->SyncHandler->prepareResponse($result, 'json'); // php response type

        echo $responseResult;

        exit;
    }


    function removeTableBooking($id='') {

        $success = false;

        if (!empty($id)) {
            $success = $this->TableBooking->removeTableBooking($id);
        }

        $result = array('status' => 'ok', 'code' => 200 ,
            'response_data' => $success
        );

        $responseResult = $this->SyncHandler->prepareResponse($result, 'json'); // php response type

        echo $responseResult;

        exit;
    }


    function getAllTables() {


        $tables = $this->TableBooking->getAllTables();

        $result = array('status' => 'ok', 'code' => 200 ,
            'response_data' => $tables
        );

        $responseResult = $this->SyncHandler->prepareResponse($result, 'json'); // php response type

        echo $responseResult;

        exit;
    }

    function getAvailableTables($bookingTime, $partySize=1, $bookingId='') {


        $tables = $this->TableBooking->getAvailableTables($bookingTime, $partySize, $bookingId);

        $result = array('status' => 'ok', 'code' => 200 ,
            'response_data' => $tables
        );

        $responseResult = $this->SyncHandler->prepareResponse($result, 'json'); // php response type

        echo $responseResult;

        exit;
    }


    function addTableBooking() {

        if(!empty($_REQUEST['request_data'])) {
            // file_put_contents("/tmp/addTableBooking.req", $_REQUEST['request_data']); // for debug
            $request_data = $_REQUEST['request_data'];
        }else {
            $request_data = "{}";
            // $request_data = file_get_contents("/tmp/addTableBooking.req"); // for debug
        }
       
        $data = json_decode($request_data, true);

        $return = false;
        if (is_array($data)) {
            $return = $this->TableBooking->addTableBooking($data);
        }
        
        $result = array('status' => 'ok', 'code' => 200 ,
            'response_data' => $return
        );

        $responseResult = $this->SyncHandler->prepareResponse($result, 'json'); // php response type

        echo $responseResult;
        exit;
        
    }
    
    function updateTableBooking($id) {

        if(!empty($_REQUEST['request_data'])) {
            //file_put_contents("/tmp/addTableBooking.req", $_REQUEST['request_data']); // for debug
            $request_data = $_REQUEST['request_data'];
        }else {
            $request_data = "{}";
        }

        $data = json_decode($request_data, true);

        $return = false;
        if (is_array($data)) {
            $return = $this->TableBooking->updateTableBooking($id, $data);
        }

        $result = array('status' => 'ok', 'code' => 200 ,
            'response_data' => $return
        );

        $responseResult = $this->SyncHandler->prepareResponse($result, 'json'); // php response type

        echo $responseResult;
        exit;

    }
}
?>