GREUtils.define('ViviPOS.SequenceModel');
ViviPOS.SequenceModel = GeckoJS.Model.extend(
{
    name: 'Sequence',
    getSequence: function(key) {
        return (new this).getSequence(key);
    }
},

{
    name: 'Sequence',
    
    getSequence: function(key) {
        key = key || "default";
        var seq = this.findByIndex('first', {index: 'key', value: key}) ||
                  {id: "", key: key, value: 0};
        seq.value++;
        this.id = seq.id;
        this.save(seq);
        return seq.value;
    }
}
);

