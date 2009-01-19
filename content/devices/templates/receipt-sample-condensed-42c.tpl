[&ESC !][0x28]${store.name|center:21}[&ESC !][0x00]
[&ESC !][0x28]${store.branch|center:21}[&ESC !][0x00]
${store.telephone1|center:42}
Opened:   ${order.create_date.toLocaleFormat('%Y-%m-%d %H:%M:%S')}
Closed:   ${order.print_date.toLocaleFormat('%Y-%m-%d %H:%M:%S')}
Terminal: ${order.terminal_no|left:10} Clerk: ${order.proceeds_clerk_displayname|left:14}
------------------------------------------
{for item in order.items_summary}
 ${item.qty_subtotal|right:3} X ${item.name|left:23} ${txn.formatPrice(item.subtotal)|right:10}
{if item.discount_subtotal != 0}${txn.formatPrice(item.discount_subtotal)|right:41}
{/if}
{if item.surcharge_subtotal != 0}${'+' + txn.formatPrice(item.surcharge_subtotal)|right:41}
{/if}
{/for}
------------------------------------------
{if order.trans_discount_subtotal != 0}Order Discount:  ${txn.formatPrice(order.trans_discount_subtotal)|right:24}
{/if}
{if order.trans_surcharge_subtotal != 0}Order Surcharge: ${txn.formatPrice(order.trans_surcharge_subtotal)|right:24}
{/if}
Tax:       ${txn.formatPrice(order.tax_subtotal)|right:30}
Total:     ${txn.formatPrice(order.total)|right:30}

Received:  ${txn.formatPrice(order.payment_subtotal)|right:30}
CHANGE:    ${txn.formatPrice(0 - order.remain)|right:30}
------------------------------------------

${'Thank you for shopping at ' + store.name +'!'|center:42}





[&GS V][0x01]