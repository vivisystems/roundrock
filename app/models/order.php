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
            $this->begin();

            if (!$this->save($data['Order'])) throw new Exception('save Order error.');
            if ($data['OrderItem'])
                if (!$this->OrderItem->saveAll($data['OrderItem'])) throw new Exception('save OrderItem error.');
            if ($data['OrderAddition'])
                if (!$this->OrderAddition->saveAll($data['OrderAddition'])) throw new Exception('save OrderAddition error.');
            if ($data['OrderPayment'])
                if (!$this->OrderPayment->saveAll($data['OrderPayment'])) throw new Exception('save OrderPayment error.');
            if ($data['OrderAnnotation'])
                if (!$this->OrderAnnotation->saveAll($data['OrderAnnotation'])) throw new Exception('save OrderAnnotation error.');
            if ($data['OrderItemCondiment'])
                if (!$this->OrderItemCondiment->saveAll($data['OrderItemCondiment'])) throw new Exception('save OrderItemCondiment error.');
            if ($data['OrderPromotion'])
                if (!$this->OrderPromotion->saveAll($data['OrderPromotion'])) throw new Exception('save OrderPromotion error.');

            if ($data['OrderObject']) {
                $obj['id'] = $data['OrderObject']['id'];
                $obj['order_id'] = $data['OrderObject']['order_id'];
                $obj['object'] = json_encode($data['OrderObject']['object']);
                if (!$this->OrderObject->save($obj)) throw new Exception('save OrderObject error.');
            }
            
            $this->commit();
            
        }catch (Exception $e) {

            $this->rollback();

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
