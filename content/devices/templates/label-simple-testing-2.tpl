{aeval}
counter = 1;
labelList = [];
for(var x = 0 ; x< product.length ; x++){
    for(var y = 0 ; y < product[x].count; y++){
        labelList.push(product[x]);
    }

}
{/eval}
{for item in labelList}
{if counter == 1}
[&INIT]
[&STX]KI70
[&STX]c0000
[&STX]f320
{/if}
[&STX]L
A2
D11
H15
152100100700010${'Store name'|left:10}[&CR]
1X1100000650006L110003[&CR]
1;1110100440006${item.name|left:20}[&CR]
1;1110100440007${item.name|left:20}[&CR]
190000100300030${'no'|left:15}[&CR]
190000100300085${'001003'|left:10}[&CR]

190000100190030${'catelog'|left:18}${'noodle'|left:10}[&CR]


190000100040006${'Price'|left:15}[&CR]


190000200040087${item.price_level1|right:2}${'.00'|right:3}[&CR]
190000200040088${item.price_level1|right:2}${'.00'|right:3}[&CR]
1X1100000030006L110001[&CR]
E
{/for}
