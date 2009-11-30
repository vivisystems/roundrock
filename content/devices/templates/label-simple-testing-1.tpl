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
H15
152100100700010${'Store name'|left:10}[&CR]
1X1100000650006L110003[&CR]
1;1110100440010${item.name|left:10}
190000100300006${'no :'|left:10}
1X1100000290006L080001[&CR]
190000100170006${'catelog :'|left:10}
1X1100000160006L080001[&CR]
190000100040006${'Price :'|left:20}[&CR]
192200200040035${item.price_level1|right:10}[&CR]
1X1100000030006L110001[&CR]
E
{/for}