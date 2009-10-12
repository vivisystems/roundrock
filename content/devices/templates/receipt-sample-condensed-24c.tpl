{if order.split_payments}
{eval}
splitPayments=[];
for (tp in order.trans_payments) {
   splitPayments.push( order.trans_payments[tp].amount);
}
{/eval}
{else}
{eval}
splitPayments=[order.payment_subtotal];
{/eval}
{/if}
{for receivePayment in splitPayments}
[&INIT]
{if duplicate}
[&DWON]${'Bill Copy'|center:12}[&DWOFF]
{/if}
[&QSON]${store.name|center:12}[&QSOFF][&CR]
[&DWON]${store.branch|center:12}[&DWOFF][&CR]
[&RESET]${store.telephone1|center:24}[&CR]
${(new Date()).toLocaleFormat('%Y-%m-%d %H:%M:%S')|center:24}[&CR]
${'Terminal:'|left:10} ${order.terminal_no|left:13}[&CR]
${'Clerk:'|left:10} ${order.proceeds_clerk_displayname|left:13}[&CR]
------------------------[&CR]
{for item in order.items_summary}
${item.qty_subtotal|right:3} X ${item.name|left:18}[&CR]
  ${item.subtotal|viviFormatPrices:true|right:22}[&CR]
{if item.discount_subtotal != 0}${item.discount_subtotal|viviFormatPrices:true|right:24}[&CR]
{/if}
{if item.surcharge_subtotal != 0}${'+' + item.surcharge_subtotal|viviFormatPrices:true|right:24}[&CR]
{/if}
{/for}
------------------------[&CR]
{if order.trans_discount_subtotal != 0}${'Order Discount:'|left:15} ${order.trans_discount_subtotal|viviFormatPrices:true|right:8}[&CR]
{/if}
{if order.trans_surcharge_subtotal != 0}${'Order Surcharge:'|left:15} ${order.trans_surcharge_subtotal|viviFormatPrices:true|right:8}[&CR]
{/if}
{if order.revalue_subtotal != 0}${'Order Revalue:'|left:15} ${order.revalue_subtotal|viviFormatPrices:true|right:8}[&CR]
{/if}
{if order.promotion_subtotal != 0}${'Promotion:'|left:15} ${order.promotion_subtotal|viviFormatPrices:true|right:8}[&CR]
{/if}
${'Tax:'|left:15} ${order.tax_subtotal|viviFormatPrices:true|right:8}[&CR]
${'Total:'|left:15} ${order.total|viviFormatPrices:true|right:8}[&CR]
[&CR]
${'Received:'|left:15} ${receivePayment|viviFormatPrices:true|right:8}[&CR]
{if order.remain > 0}
${'BALANCE:'|left:15} ${order.remain|viviFormatPrices:true|right:8}[&CR]
{else}
${'CHANGE:'|left:15} ${(0 - order.remain)|viviFormatPrices:true|right:8}[&CR]
{/if}
------------------------[&CR]
[&CR]
${'Thank you for shopping at'|center:24}[&CR]
[&QSON]${store.name|center:12}[&QSOFF][&CR]
[&RESET]
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&PC]
[&CR]
[&CR]
[&CR]
{/for}