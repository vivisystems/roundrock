{eval}
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
H20
162100100550010${'FEC'|left:10}[&CR]
162100100550011${'FEC'|left:10}[&CR]
190000100470012${'FIRICH ENTERPRISES CO'|left:22}[&CR]
1X1100000450006L110002[&CR]
1;1000100300010${item.name|left:10}
190000100030064${'Price :'|left:10}
192200200010090${item.price_level1|left:10}[&CR]
E
{/for}