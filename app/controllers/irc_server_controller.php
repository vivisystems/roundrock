<?php

class IrcServerController extends AppController {

    var $name = 'IrcServer';

    var $uses = null;

    var $components = array('SyncHandler', 'Security', 'Irc');


    /**
     * getPackages
     */
    function getPackages() {
        
        $result = array('status' => 'error', 'code' => 400 );

        $packages = $this->Irc->getPackages();

        if (is_array($packages)) {
            $result = array('status' => 'ok', 'code' => 200 );
            $result['response_data'] = $packages;
        }

        $responseResult = $this->SyncHandler->prepareResponse($result, 'json');

        echo $responseResult ;
        exit;

    }


    /**
     * create package
     */
    function createPackage() {

        $result = array('status' => 'error', 'code' => 400 );

        $success = false;

        $modules = $_REQUEST['modules'];
        $moduleLabels = $_REQUEST['module_labels'];
        $activation = $_REQUEST['activation'];
        $description = $_REQUEST['description'];

        $success = $this->Irc->createPackage($activation, $modules, $description, $moduleLabels);

        if ($success) {
            $result = array('status' => 'ok', 'code' => 200 );
            $result['response_data'] = $success;
        }

        $responseResult = $this->SyncHandler->prepareResponse($result, 'json');

        echo $responseResult ;
        exit;

    }


    /**
     * remove package
     */
    function removePackage($file) {

        $result = array('status' => 'error', 'code' => 400 );

        $success = false;

        $success = $this->Irc->removePackage($file);

        if ($success) {
            $result = array('status' => 'ok', 'code' => 200 );
            $result['response_data'] = $success;
        }

        $responseResult = $this->SyncHandler->prepareResponse($result, 'json');

        echo $responseResult ;
        exit;

    }

    /**
     * unpack package
     */
    function unpackPackage($file) {

        $result = array('status' => 'error', 'code' => 400 );

        $success = false;

        $success = $this->Irc->unpackPackage($file);

        if ($success) {
            $result = array('status' => 'ok', 'code' => 200 );
            $result['response_data'] = $success;
        }

        $responseResult = $this->SyncHandler->prepareResponse($result, 'json');

        echo $responseResult ;
        exit;

    }


    /**
     * create package full settings
     */
    function createFullPackage() {

        $result = array('status' => 'error', 'code' => 400 );

        $success = false;

        $activation = time();

        $success = $this->Irc->createPackage($activation, '', 'FULL IRC PACKAGE', '');

        if ($success) {
            $result = array('status' => 'ok', 'code' => 200 );
            $result['response_data'] = $success;
        }

        $responseResult = $this->SyncHandler->prepareResponse($result, 'json');

        echo $responseResult ;
        exit;

    }


    /**
     * getAvailablePackagesList
     */
    function getAvailablePackagesList() {

        $result = array('status' => 'error', 'code' => 400 );

        $now = time();

        $stocks = $this->StockRecord->getLastModifiedRecords($lastModified);

        if (is_array($stocks)) {

            $result = array('status' => 'ok', 'code' => 200 );
            // $result['response_data'] = $stocks;
            $result['response_data'] = $this->SyncHandler->prepareResponse($stocks, 'bgz_json');

        }

        $responseResult = $this->SyncHandler->prepareResponse($result, 'json');

        echo $responseResult ;
        exit;

    }

    /**
     * downloadAvailablePackage
     */
    function downloadAvailablePackage() {

        $result = array('status' => 'error', 'code' => 400 );

        $now = time();

        $stocks = $this->StockRecord->getLastModifiedRecords($lastModified);

        if (is_array($stocks)) {

            $result = array('status' => 'ok', 'code' => 200 );
            // $result['response_data'] = $stocks;
            $result['response_data'] = $this->SyncHandler->prepareResponse($stocks, 'bgz_json');

        }

        $responseResult = $this->SyncHandler->prepareResponse($result, 'json');

        echo $responseResult ;
        exit;

    }


    /**
     * Check master available packages and download it.
     */
    function downloadPackages() {
        
    }


}
?>