<?php

class Promotion extends AppModel {
    var $name = 'Promotion';

    function getPromotion($id = 'default') {

        $data = $this->findById($id);
        return $data;


    }

    function setPromotion($id, $data) {

    }

    function getPromotions() {

        $datas = $this->find('all');
        return $datas;
    }

}

?>