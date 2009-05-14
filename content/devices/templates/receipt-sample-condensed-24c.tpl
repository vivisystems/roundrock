{if duplicate}
[&DWON]${'Bill Copy'|center:12}[&DWOFF]
{/if}
[&QSON]${store.name|center:12}[&QSOFF][&CR]
[&DWON]${store.branch|center:12}[&DWOFF][&CR]
${store.telephone1|center:24}[&CR]
${(new Date()).toLocaleFormat('%Y-%m-%d %H:%M:%S')|center:24}[&CR]
Terminal: ${order.terminal_no|left:24}[&CR]
Clerk: ${order.proceeds_clerk_displayname|left:17}[&CR]
-----------------------[&CR]
{for item in order.items_summary}
${item.qty_subtotal|right:3} X ${item.name|left:18}[&CR]
  ${item.subtotal|viviFormatPrices:true|right:22}[&CR]
{if item.discount_subtotal != 0}${item.discount_subtotal|viviFormatPrices:true|right:24}[&CR]
{/if}
{if item.surcharge_subtotal != 0}${'+' + item.surcharge_subtotal|viviFormatPrices:true|right:24}[&CR]
{/if}
{/for}
-----------------------[&CR]
{if order.trans_discount_subtotal != 0}Order Discount: ${order.trans_discount_subtotal|viviFormatPrices:true|right:8}[&CR]
{/if}
{if order.trans_surcharge_subtotal != 0}Order Surcharge: ${order.trans_surcharge_subtotal|viviFormatPrices:true|right:7}[&CR]
{/if}
{if order.revalue_subtotal != 0}Order Revalue:   ${order.revalue_subtotal|viviFormatPrices:true|right:7}
{/if}
{if order.promotion_subtotal != 0}Promotion:       ${order.promotion_subtotal|viviFormatPrices:true|right:7}
{/if}
Tax:      ${order.tax_subtotal|viviFormatPrices:true|right:14}[&CR]
Total:    ${order.total|viviFormatPrices:true|right:14}[&CR]
[&CR]
Received: ${order.payment_subtotal|viviFormatPrices:true|right:14}[&CR]
{if order.remain > 0}
BALANCE:  ${order.remain|viviFormatPrices:true|right:14}[&CR]
{else}
CHANGE:   ${(0 - order.remain)|viviFormatPrices:true|right:14}[&CR]
{/if}
-----------------------[&CR]
[&CR]
${'Thank you for shopping at'|center:24}[&CR]
[&QSON]${store.name|center:12}[&QSOFF][&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&PC]