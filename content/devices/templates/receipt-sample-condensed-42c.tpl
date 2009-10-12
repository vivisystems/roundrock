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
[&DWON]${'Bill Copy'|center:21}[&DWOFF]
{/if}
[&QSON]${store.name|center:21}[&QSOFF]
[&DWON]${store.branch|center:21}[&DWOFF]
[&RESET]${store.telephone1|center:42}
${'Opened:'|left:10}${(new Date(order.created * 1000)).toLocaleFormat('%Y-%m-%d %H:%M:%S')}
${'Printed:'|left:10}${(new Date()).toLocaleFormat('%Y-%m-%d %H:%M:%S')}
${'Terminal:'|left:10}${order.terminal_no|left:10} ${'Clerk:'|left:6}${order.proceeds_clerk_displayname|left:15}
------------------------------------------
{for item in order.items_summary}
 ${item.qty_subtotal|right:3} X ${item.name|left:23} ${item.subtotal|viviFormatPrices:true|right:10}
{if item.discount_subtotal != 0}${item.discount_subtotal|viviFormatPrices:true|right:41}
{/if}
{if item.surcharge_subtotal != 0}${'+' + item.surcharge_subtotal|viviFormatPrices:true|right:41}
{/if}
{/for}
------------------------------------------
{if order.trans_discount_subtotal != 0}${'Order Discount:'|left:15} ${order.trans_discount_subtotal|viviFormatPrices:true|right:26}
{/if}
{if order.trans_surcharge_subtotal != 0}${'Order Surcharge:'|left:15} ${order.trans_surcharge_subtotal|viviFormatPrices:true|right:26}
{/if}
{if order.revalue_subtotal != 0}${'Order Revalue:'|left:15} ${order.revalue_subtotal|viviFormatPrices:true|right:26}
{/if}
{if order.promotion_subtotal != 0}${'Promotion:'|left:15} ${order.promotion_subtotal|viviFormatPrices:true|right:26}
{/if}
${'Tax:'|left:15} ${order.tax_subtotal|viviFormatPrices:true|right:26}
${'Total:'|left:15} ${order.total|viviFormatPrices:true|right:26}
[&CR]
${'Received:'|left:15} ${receivePayment|viviFormatPrices:true|right:26}
{if order.remain > 0}
${'BALANCE:'|left:15} ${order.remain|viviFormatPrices:true|right:26}
{else}
${'CHANGE:'|left:15} ${(0 - order.remain)|viviFormatPrices:true|right:26}
{/if}
------------------------------------------
[&CR]
${'Thank you for shopping at ' + store.name +'!'|center:42}
[&RESET]
[&CR]
[&CR]
[&CR]
[&CR]
[&PC]
[&CR]
[&CR]
[&CR]
{/for}