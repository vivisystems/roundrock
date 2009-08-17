( function() {

    if(typeof AppModel == 'undefined') {
        include( 'chrome://viviecr/content/models/app.js' );
    }

    var __model__ = {
    
        name: 'OrderAnnotation',

        useDbConfig: 'order',

        belongsTo: ['Order'],

        behaviors: ['Sync', 'Training'],

        autoRestoreFromBackup: true ,


        mappingTranToOrderAnnotationsFields: function(data) {

            var orderAnnotations = [];

            for (var idx in data.annotations) {

                let annotationItem = {};

                annotationItem['order_id'] = data.id;
                annotationItem['type'] = idx;
                annotationItem['text'] = data.annotations[idx];
                delete (annotationItem['id']);

                orderAnnotations.push(annotationItem);
            }

            return orderAnnotations;

        },

        mappingOrderAnnotationsFieldsToTran: function(orderData, data) {
            
        }

    };

    var OrderAnnotationModel = window.OrderAnnotationModel =  AppModel.extend(__model__);

} )();
