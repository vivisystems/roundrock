{if duplicate}
[&DWON]${'Bill Copy'|center:21}[&DWOFF]
{/if}
[&QSON]${store.name|center:21}[&QSOFF]
[&DWON]${store.branch|center:21}[&DWOFF]
${store.telephone1|center:42}
Opened:   ${(new Date(order.created * 1000)).toLocaleFormat('%Y-%m-%d %H:%M:%S')}
Printed:  ${(new Date()).toLocaleFormat('%Y-%m-%d %H:%M:%S')}
Terminal: ${order.terminal_no|left:10} Clerk: ${order.proceeds_clerk_displayname|left:14}
------------------------------------------
{for item in order.items_summary}
 ${item.qty_subtotal|right:3} X ${item.name|left:23} ${item.subtotal|viviFormatPrices:true|right:10}
{if item.discount_subtotal != 0}${item.discount_subtotal|viviFormatPrices:true|right:41}
{/if}
{if item.surcharge_subtotal != 0}${'+' + item.surcharge_subtotal|viviFormatPrices:true|right:41}
{/if}
{/for}
------------------------------------------
{if order.trans_discount_subtotal != 0}Order Discount:  ${order.trans_discount_subtotal|viviFormatPrices:true|right:24}
{/if}
{if order.trans_surcharge_subtotal != 0}Order Surcharge: ${order.trans_surcharge_subtotal|viviFormatPrices:true|right:24}
{/if}
{if order.revalue_subtotal != 0}Order Revalue:   ${order.revalue_subtotal|viviFormatPrices:true|right:24}
{/if}
{if order.promotion_subtotal != 0}Promotion:       ${order.promotion_subtotal|viviFormatPrices:true|right:24}
{/if}
Tax:       ${order.tax_subtotal|viviFormatPrices:true|right:30}
Total:     ${order.total|viviFormatPrices:true|right:30}
[&CR]
Received:  ${order.payment_subtotal|viviFormatPrices:true|right:30}
{if order.remain > 0}
BALANCE:   ${order.remain|viviFormatPrices:true|right:30}
{else}
CHANGE:    ${(0 - order.remain)|viviFormatPrices:true|right:30}
{/if}
------------------------------------------
[&CR]
${'Thank you for shopping at ' + store.name +'!'|center:42}
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&PC]
