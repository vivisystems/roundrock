var OrderAnnotationModel = window.OrderAnnotationModel =  GeckoJS.Model.extend({
    name: 'OrderAnnotation',

    useDbConfig: 'order',

    belongsTo: ['Order'],

    behaviors: ['Sync'],

    autoRestoreFromBackup: true
    
});
