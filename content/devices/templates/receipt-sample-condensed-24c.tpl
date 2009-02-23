{if duplicate}
[&DWON]${'Bill Copy'|center:12}[&DWOFF]
{/if}
[&QSON]${store.name|center:12}[&QSOFF][&CR]
[&DWON]${store.branch|center:12}[&DWOFF][&CR]
${store.telephone1|center:24}[&CR]
${(new Date(order.modified)).toLocaleFormat('%Y-%m-%d %H:%M:%S')|center:24}[&CR]
Terminal: ${order.terminal_no|left:24}[&CR]
Clerk: ${order.proceeds_clerk_displayname|left:17}[&CR]
-----------------------[&CR]
{for item in order.items_summary}
${item.qty_subtotal|right:3} X ${item.name|left:18}[&CR]
  ${txn.formatPrice(item.subtotal)|right:22}[&CR]
{if item.discount_subtotal != 0}${txn.formatPrice(item.discount_subtotal)|right:24}[&CR]
{/if}
{if item.surcharge_subtotal != 0}${'+' + txn.formatPrice(item.surcharge_subtotal)|right:24}[&CR]
{/if}
{/for}
-----------------------[&CR]
{if order.trans_discount_subtotal != 0}Order Discount: ${txn.formatPrice(order.trans_discount_subtotal)|right:8}[&CR]
{/if}
{if order.trans_surcharge_subtotal != 0}Order Surcharge: ${txn.formatPrice(order.trans_surcharge_subtotal)|right:7}[&CR]
{/if}
Tax:      ${txn.formatPrice(order.tax_subtotal)|right:14}[&CR]
Total:    ${txn.formatPrice(order.total)|right:14}[&CR]
[&CR]
Received: ${txn.formatPrice(order.payment_subtotal)|right:14}[&CR]
CHANGE:   ${txn.formatPrice(0 - order.remain)|right:14}[&CR]
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