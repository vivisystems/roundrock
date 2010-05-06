{eval}
counter = 1;
labelList = [];
for(var x = 0 ; x< product.length ; x++){
    for(var y = 0 ; y < product[x].count; y++){
        labelList.push(product[x]);
    }

}

  myModifiers = {

   decimal: function(price){

        return price +".00";
   },

   coor: function(s){

      var limit = 85;
      for(var a = 5 ; a< s.length ; a++){

            limit = limit - 5 ;
      }
         return GeckoJS.String.padLeft(limit, 2, '0')
   },

   coorPlus: function(s){

      var limit = 86;
      for(var a = 5 ; a< s.length ; a++){

            limit = limit - 5 ;
      }
         return GeckoJS.String.padLeft(limit, 2, '0')
   }

};
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
1${barcodeType}2102500600010${item.barcode}[&CR]
1X1100000590006L110001
1;1110100440006${item.name|wleft:20}[&CR]
1;1110100440007${item.name|wleft:20}[&CR]
190000100300030${'no'|wleft:15}[&CR]
190000100300050${item.no|wleft:10}[&CR]
190000100060006${'Price'|wleft:15}[&CR]
1900002000600${myModifiers.coor(item.selectedPrice)}${item.selectedPrice}[&CR]
1900002000600${myModifiers.coorPlus(item.selectedPrice)}${item.selectedPrice}[&CR]
1X1100000050006L110001[&CR]
1X1100000010000b0125009700020002<CR>
E
{/for}
