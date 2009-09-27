<?php
App::import('Core', array('CakeLog'));

class Order extends AppModel {
    var $name = 'Order';

    var $useDbConfig = 'order';

    var $hasMany = array('OrderItem', 'OrderAddition', 'OrderPayment', 'OrderAnnotation', 'OrderItemCondiment', 'OrderPromotion');

    var $hasOne = array('OrderObject');

    var $actsAs = array('Sync');


    /**
     * unbindHasManyModels
     */
    function unbindHasManyModels() {
        $this->unbindModel(array('hasMany' => array('OrderItem', 'OrderAddition', 'OrderPayment', 'OrderAnnotation', 'OrderItemCondiment', 'OrderPromotion')));
    }


    /**
     *
     * @param <type> $orders 
     */
    function saveOrders($orders) {

        $this->begin();

        foreach ($orders as $order) {
            $this->id = $order['id'];
            $this->save($order);
        }

        $this->commit();
    }


    /**
     *
     * @param <type> $data
     * @return <type>
     */
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


    /**
     * save and release locked
     * @param <type> $datas
     */
    function saveOrdersFromBackupFormat($datas) {

    // save order to database
        if (!empty($datas['Order'])) {
        // save order
            $orders = json_decode($datas['Order'], true);
            if (is_array($orders)) {
                $this->saveOrders(array_values($orders));
            }

        }

        // save order_items to database
        if (!empty($datas['OrderItem'])) {
        // save order_items
            $orderItems = json_decode($datas['OrderItem'], true);
            if (is_array($orderItems)) {
                $this->OrderItem->saveOrderItems(array_values($orderItems));
            }

        }

        // save order_additions to database
        if (!empty($datas['OrderAddition'])) {
        // save order_additions
            $orderAdditions = json_decode($datas['OrderAddition'], true);
            if (is_array($orderAdditions)) {
                $this->OrderAddition->saveOrderAdditions(array_values($orderAdditions));
            }

        }

        // save order_payments to database
        if (!empty($datas['OrderPayment'])) {
        // save order_payments
            $orderPayments = json_decode($datas['OrderPayment'], true);
            if (is_array($orderPayments)) {
                $this->OrderPayment->saveOrderPayments(array_values($orderPayments));
            }

        }

        // save order_annotations to database
        if (!empty($datas['OrderAnnotation'])) {
        // save order_annotations
            $orderAnnotations = json_decode($datas['OrderAnnotation'], true);
            if (is_array($orderAnnotations)) {
                $this->OrderAnnotation->saveOrderAnnotation(array_values($orderAnnotations));
            }
        }

        // save order_item_condiments to database
        if (!empty($datas['OrderItemCondiment'])) {
        // save order_item_condiments
            $orderItemCondiments = json_decode($datas['OrderItemCondiment'], true);
            if (is_array($orderItemCondiments)) {
                $this->OrderItemCondiment->saveOrderItemCondiments(array_values($orderItemCondiments));
            }
        }

        // save order_promotions to database
        if (!empty($datas['OrderPromotion'])) {
        // save order_promotions
            $orderPromotions = json_decode($datas['OrderPromotion'], true);
            if (is_array($orderPromotions)) {
                $this->OrderPromotion->saveOrderPromotions(array_values($orderPromotions));
            }
        }

        // save order_objects to database
        if (!empty($datas['OrderObject'])) {
        // save order_objects
            $orderObjects = json_decode($datas['OrderObject'], true);
            if (is_array($orderObjects)) {
                $this->OrderObject->saveOrderObjects(array_values($orderObjects));
            }
        }

    }


    /**
     *
     * @param <type> $orderId
     * @return <type> 
     */
    function readOrderToBackupFormat($orderId) {

        $this->id = $orderId ;
        $order = $this->read();
        return $order;

    }


    /**
     *
     * @param <type> $id
     * @param <type> $data
     * @return <type> 
     */
    function voidOrder($id, $data) {

        // update order
        $this->id = $id;
        $result = $this->save($data);

        // update refund payments
        for ($i = 0; $i < $data['refundPayments']; $i++) {
            $this->OrderPayment->create();
            $this->OrderPayment->save($data['refundPayments'][i]);
        }

        return $result;
    }

    /**
     *
     * @param <type> $id
     * @param <type> $data
     * @return <type>
     */
    function transferTable($orderId, $orgTableId, $newTableId) {

        $tableModel = new Table();
        $tableIdToNos = $tableModel->getTableIdToNos();

        $orgTableNo = $tableIdToNos[$orgTableId];
        $newTableNo = $tableIdToNos[$newTableId];

        $this->id = $orderId;
        $this->save(array('table_no'=>$newTableNo));

        return $result;
    }

    /**
     * changeClerk
     * @param <type> $id
     * @param <type> $data
     * @return <type>
     */
    function changeClerk($id, $data) {

        // update order
        $this->id = $id;
        $result = $this->save($data);

        return $result;
    }


}

?>