<?php
App::import('Core', array('CakeLog'));

class Order extends AppModel {
    var $name = 'Order';

    var $useDbConfig = 'order';

    var $hasMany = array('OrderItem', 'OrderAddition', 'OrderPayment', 'OrderAnnotation', 'OrderItemCondiment', 'OrderPromotion');

    var $hasOne = array('OrderObject');

    var $actsAs = array('Sync');

    function saveOrder($data) {

        // if ($this->lockTable( array('WRITE', array('order', 'OrderItem', 'OrderAddition', 'OrderPayment', 'OrderAnnotation', 'OrderItemCondiment', 'OrderPromotion')))) {
//        if ($this->lockTable('WRITE')) {
//            CakeLog::write('saveOrderObject', 'lockTable fail:::');
//            return false;
//        }

        $conditions = "Order.id='" . $data['Order']['id'] . "'";
        $orderTmp = $this->find('first', array("conditions" => $conditions));

        if ($orderTmp && $data['Order']['lastModifiedTime'] != $orderTmp['Order']['transaction_submitted']) {
            CakeLog::write('saveOrderObject', 'saveOrder fail:::' . $data['Order']['id']);
            return false;
        }

        try {
            // if (!$this->begin()) throw new Exception('save Order error when begin transaction.');
            // $this->begin();

            if (!$this->save($data['Order'])) throw new Exception('save Order error.');
            if ($data['OrderItem'])
                // if (!$this->OrderItem->saveAll($data['OrderItem'])) throw new Exception('save OrderItem error.');
                $this->OrderItem->saveAll($data['OrderItem']);
            if ($data['OrderAddition'])
                // if (!$this->OrderAddition->saveAll($data['OrderAddition'])) throw new Exception('save OrderAddition error.');
                $this->OrderAddition->saveAll($data['OrderAddition']);
            if ($data['OrderPayment'])
                // if (!$this->OrderPayment->saveAll($data['OrderPayment'])) throw new Exception('save OrderPayment error.');
                $this->OrderPayment->saveAll($data['OrderPayment']);
            if ($data['OrderAnnotation'])
                // if (!$this->OrderAnnotation->saveAll($data['OrderAnnotation'])) throw new Exception('save OrderAnnotation error.');
                $this->OrderAnnotation->saveAll($data['OrderAnnotation']);
            if ($data['OrderItemCondiment'])
                // if (!$this->OrderItemCondiment->saveAll($data['OrderItemCondiment'])) throw new Exception('save OrderItemCondiment error.');
                $this->OrderItemCondiment->saveAll($data['OrderItemCondiment']);
            if ($data['OrderPromotion'])
                // if (!$this->OrderPromotion->saveAll($data['OrderPromotion'])) throw new Exception('save OrderPromotion error.');
                $this->OrderPromotion->saveAll($data['OrderPromotion']);

            if ($data['OrderObject']) {
                $obj['id'] = $data['OrderObject']['id'];
                $obj['order_id'] = $data['OrderObject']['order_id'];
                $obj['object'] = json_encode($data['OrderObject']['object']);
                if (!$this->OrderObject->save($obj)) throw new Exception('save OrderObject error.');
            }
            
            // if (!$this->commit()) throw new Exception('save Order error when commit transaction.');
            $this->commit();
            
        }catch (Exception $e) {

            // if (!$this->rollback()) throw new Exception('save Order error when rollback transaction.');
            $this->rollback();

//            $this->unlockTable(array('order', 'OrderItem', 'OrderAddition', 'OrderPayment', 'OrderAnnotation', 'OrderItemCondiment', 'OrderPromotion'));

            CakeLog::write('saveOrderDefault', 'An error was encountered while saving order ' .
                                  '  saveOrderDefault: ' . $e->getMessage() . "\n" );
            return false;

        }

//        $this->unlockTable(array('order', 'OrderItem', 'OrderAddition', 'OrderPayment', 'OrderAnnotation', 'OrderItemCondiment', 'OrderPromotion'));

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
