<?php
App::import('Core', array('CakeLog'));

class Order extends AppModel {
    var $name = 'Order';

    var $useDbConfig = 'order';

    var $hasMany = array('OrderItem', 'OrderAddition', 'OrderPayment', 'OrderAnnotation', 'OrderItemCondiment', 'OrderPromotion');

    var $hasOne = array('OrderObject');

    var $actsAs = array('Sync');

    function saveOrder($data) {

        $conditions = "Order.id='" . $data['Order']['id'] . "'";
        $orderTmp = $this->find('first', array("conditions" => $conditions));

        if ($orderTmp && $data['Order']['lastModifiedTime'] != $orderTmp['Order']['transaction_submitted']) {
            CakeLog::write('saveOrderObject', 'saveOrder fail:::' . $data['Order']['id']);
            return false;
        }

        try {
            
            $this->save($data['Order']);
            try {
            $this->OrderItem->saveAll($data['OrderItem']);
            }catch (Exception $e) {
                CakeLog::write('saveOrder', 'OrderItem ' .
                                      '  OrderItem: ' . $e->getMessage() . "\n" );
            }
            try {
                if ($data['OrderAddition'])
            $this->OrderAddition->saveAll($data['OrderAddition']);
            }catch (Exception $e) {
                CakeLog::write('saveOrder', 'OrderAddition ' .
                                      '  OrderAddition: ' . $e->getMessage() . "\n" );
            }
            try {
                if ($data['OrderPayment'])
            $this->OrderPayment->saveAll($data['OrderPayment']);
            }catch (Exception $e) {
                CakeLog::write('saveOrder', 'OrderPayment ' .
                                      '  OrderPayment: ' . $e->getMessage() . "\n" );
            }
            try {
                if ($data['OrderAnnotation'])
            $this->OrderAnnotation->saveAll($data['OrderAnnotation']);
            }catch (Exception $e) {
                CakeLog::write('saveOrder', 'OrderAnnotation ' .
                                      '  OrderAnnotation: ' . $e->getMessage() . "\n" );
            }
            try {
                if ($data['OrderItemCondiment'])
            $this->OrderItemCondiment->saveAll($data['OrderItemCondiment']);
            }catch (Exception $e) {
                CakeLog::write('saveOrder', 'OrderItemCondiment ' .
                                      '  OrderItemCondiment: ' . $e->getMessage() . "\n" );
            }
            try {
                if ($data['OrderPromotion'])
            $this->OrderPromotion->saveAll($data['OrderPromotion']);
            }catch (Exception $e) {
                CakeLog::write('saveOrder', 'OrderPromotion ' .
                                      '  OrderPromotion: ' . $e->getMessage() . "\n" );
            }

            try {
                if ($data['OrderObject']) {
            $obj['id'] = $data['OrderObject']['id'];
            $obj['order_id'] = $data['OrderObject']['order_id'];
            $obj['object'] = json_encode($data['OrderObject']['object']);
            $this->OrderObject->save($obj);
                }
            }catch (Exception $e) {
                CakeLog::write('saveOrder', 'OrderObject ' .
                                      '  OrderObject: ' . $e->getMessage() . "\n" );
            }
            
        }catch (Exception $e) {

            CakeLog::write('saveOrderDefault', 'An error was encountered while saving order ' .
                                  '  saveOrderDefault: ' . $e->getMessage() . "\n" );
        }

        // return $data;
        return true;

    }

    function getCheckList($conditions) {
        // $conditions = "orders.status='2'";
        return $this->find('all', array("conditions" => array($conditions), "recursive" => 3));
    }

    function unserializeOrder($order_id) {
        try {

            $conditions = "OrderObject.order_id='" . $order_id . "'";

            $orderObject = $this->OrderObject->find('first', array("conditions" => $conditions));



            if($orderObject) {
                // return GeckoJS.BaseObject.unserialize(GREUtils.Gzip.inflate(orderObject.object));
                // return GeckoJS.BaseObject.unserialize(orderObject.object);
                return $orderObject;
            }

        }catch (Exception $e) {

            CakeLog::write('unserializeOrder', 'An error was encountered while unserialize order ' .
                                  '  unserializeOrder: ' . $e->getMessage() . "\n" );
        }

        return null;
    }

    function updateOrderMaster($data) {

        try {

            $r = $this->save(data);

        }catch (Exception $e) {

            CakeLog::write('error', 'An error was encountered while updating order ' .
                                  '  Exception: ' . $e->getMessage() . "\n" );
        }

        return $r;

    }

}

?>
