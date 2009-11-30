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
D11
H20
161100100500010${item.name|left:10}[&CR]
190000100030053${'Price :'|left:10}
192200200010090${item.price_level1|left:10}[&CR]
E
{/for}