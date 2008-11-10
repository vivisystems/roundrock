GREUtils.define('ViviPOS.SequenceModel');
ViviPOS.SequenceModel = GeckoJS.Model.extend(
{
    getSequence: function(key) {
        return (new this).getSequence(key);
    },

    resetSequence: function(key, value) {
        return (new this).resetSequence(key, value);
    }
}
,
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
    },

    resetSequence: function(key, value) {
        key = key || "default";

	if (value == null) {value = 0;}

        var seq = this.findByIndex('first', {index: 'key', value: key}) ||
                  {id: "", key: key, value: 0};
        seq.value = value;
        this.id = seq.id;
        this.save(seq);
        return seq.value;
    }
}
);

