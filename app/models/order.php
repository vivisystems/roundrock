<?php
App::import('Core', array('CakeLog'));

class Order extends AppModel {
    var $name = 'Order';

    var $useDbConfig = 'order';

    var $hasMany = array('OrderItem', 'OrderAddition', 'OrderPayment', 'OrderAnnotation', 'OrderItemCondiment', 'OrderPromotion','OrderItemTax');

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

        $result = true;

        try {
            $this->begin();

            foreach ($orders as $order) {

                // check if $order is empty
                // if viviecr send empty object to web services, XXXX
                if (empty($order)) {
                    CakeLog::write('warning', 'saveOrders: Empty Order');
                    continue;
                }

                $this->id = $order['id'];
                $r = $this->save($order);

                $result = ($result & !empty($r));
            }

            $this->commit();

        }catch(Exception $e) {

            CakeLog::write('error', 'Exception saveOrders \n' .
                '  Exception: ' . $e->getMessage() . "\n" );

            $this->rollback();
            $result = false;
        }

        return $result;

    }



    /**
     * save and release locked
     * @param <type> $datas
     */
    function saveOrdersFromBackupFormat($datas) {

        $result = array();

        // save order to database
        if (!empty($datas['Order'])) {
        // save order
            $orders = json_decode($datas['Order'], true);
            if (is_array($orders)) {
                $r = $this->saveOrders(array_values($orders));
                $result['Order'] = $r;
            }else {
                CakeLog::write('warning', 'json_decode datas["Order"] return not array' . "\n" . $datas['Order'] ."\n");
            }

        }

        // save order_items to database
        if (!empty($datas['OrderItem'])) {
        // save order_items
            $orderItems = json_decode($datas['OrderItem'], true);
            if (is_array($orderItems)) {
                $r = $this->OrderItem->saveOrderItems(array_values($orderItems));
                $result['OrderItem'] = $r;
            }else {
                CakeLog::write('warning', 'json_decode datas["OrderItem"] return not array' . "\n" . $datas['OrderItem'] ."\n");
            }

        }

        // save order_additions to database
        if (!empty($datas['OrderAddition'])) {
        // save order_additions
            $orderAdditions = json_decode($datas['OrderAddition'], true);
            if (is_array($orderAdditions)) {
                $r = $this->OrderAddition->saveOrderAdditions(array_values($orderAdditions));
                $result['OrderAddition'] = $r;
            }else {
                CakeLog::write('warning', 'json_decode datas["OrderAddition"] return not array' . "\n" . $datas['OrderAddition'] ."\n");
            }

        }

        // save order_payments to database
        if (!empty($datas['OrderPayment'])) {
        // save order_payments
            $orderPayments = json_decode($datas['OrderPayment'], true);
            if (is_array($orderPayments)) {
                $r = $this->OrderPayment->saveOrderPayments(array_values($orderPayments));
                $result['OrderPayment'] = $r;
            }else {
                CakeLog::write('warning', 'json_decode datas["OrderPayment"] return not array' . "\n" . $datas['OrderPayment'] ."\n");
            }

        }

        // save order_annotations to database
        if (!empty($datas['OrderAnnotation'])) {
        // save order_annotations
            $orderAnnotations = json_decode($datas['OrderAnnotation'], true);
            if (is_array($orderAnnotations)) {
		    // remove old annotation
		$this->OrderAnnotation->removeFromOrder($orders);
                $r = $this->OrderAnnotation->saveOrderAnnotations(array_values($orderAnnotations));
                $result['OrderAnnotation'] = $r;
            }else {
                CakeLog::write('warning', 'json_decode datas["OrderAnnotation"] return not array' . "\n" . $datas['OrderAnnotation'] ."\n");
            }

        }

        // save order_item_condiments to database
        if (!empty($datas['OrderItemCondiment'])) {
        // save order_item_condiments
            $orderItemCondiments = json_decode($datas['OrderItemCondiment'], true);
            if (is_array($orderItemCondiments)) {
                $r = $this->OrderItemCondiment->saveOrderItemCondiments(array_values($orderItemCondiments));
                $result['OrderItemCondiment'] = $r;
            }else {
                CakeLog::write('warning', 'json_decode datas["OrderItemCondiment"] return not array' . "\n" . $datas['OrderItemCondiment'] ."\n");
            }

        }

        // save order_promotions to database
        if (!empty($datas['OrderPromotion'])) {
        // save order_promotions
            $orderPromotions = json_decode($datas['OrderPromotion'], true);
            if (is_array($orderPromotions)) {
                $r = $this->OrderPromotion->saveOrderPromotions(array_values($orderPromotions));
                $result['OrderPromotion'] = $r;
            }else {
                CakeLog::write('warning', 'json_decode datas["OrderPromotion"] return not array' . "\n" . $datas['OrderPromotion'] ."\n");
            }

        }

        // save order_item_taxes to database
        if (!empty($datas['OrderItemTax'])) {
        // save order_item_taxes
            $orderItemTaxes = json_decode($datas['OrderItemTax'], true);
            if (is_array($orderItemTaxes)) {
                $r = $this->OrderItemTax->saveOrderItemTaxes(array_values($orderItemTaxes));
                $result['OrderItemTax'] = $r;
            }else {
                CakeLog::write('warning', 'json_decode datas["OrderItemTax"] return not array' . "\n" . $datas['OrderItemTax'] ."\n");
            }

        }

        // save order_objects to database
        if (!empty($datas['OrderObject'])) {
        // save order_objects
            $orderObjects = json_decode($datas['OrderObject'], true);
            if (is_array($orderObjects)) {
                $r = $this->OrderObject->saveOrderObjects(array_values($orderObjects));
                $result['OrderObject'] = $r;
            }else {
                CakeLog::write('warning', 'json_decode datas["OrderObject"] return not array');
            }

        }

        return $result;

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
        foreach ($data['refundPayments'] as $refund) {
            $this->OrderPayment->id = $refund->id;
            $this->OrderPayment->save($refund);
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
        $result = $this->save(array('table_no'=>$newTableNo));

        return (!empty($result));
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