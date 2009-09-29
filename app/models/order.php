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

        $this->begin();

        try {
            foreach ($orders as $order) {
                $this->id = $order['id'];
                $this->save($order);
            }
        }catch(Exception $e) {
            CakeLog::write('error', 'Exception saveOrders \n' .
                '  Exception: ' . $e->getMessage() . "\n" );
        }

        $this->commit();
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
                $this->OrderAnnotation->saveOrderAnnotations(array_values($orderAnnotations));
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

        // save order_item_taxes to database
        if (!empty($datas['OrderItemTax'])) {
        // save order_item_taxes
            $orderItemTaxes = json_decode($datas['OrderItemTax'], true);
            if (is_array($orderItemTaxes)) {
                $this->OrderItemTax->saveOrderItemTaxes(array_values($orderItemTaxes));
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