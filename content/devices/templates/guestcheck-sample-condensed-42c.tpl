[&REVON][&QSON]${'GUEST CHECK'|center:21}[&QSOFF][&REVOFF]
[&QSON]${store.name|center:21}[&QSOFF]
[&DWON]${store.branch|center:21}[&DWOFF]
${store.telephone1|center:42}
Opened:   ${(new Date(order.created)).toLocaleFormat('%Y-%m-%d %H:%M:%S')}
Submitted:${(new Date(order.modified)).toLocaleFormat('%Y-%m-%d %H:%M:%S')}
Terminal: ${order.terminal_no|left:10} Clerk: ${order.proceeds_clerk_displayname|left:14}
------------------------------------------
{for item in order.display_sequences}
{if item.type == 'item'}
${item.current_qty|right:4} ${item.name|left:12} ${item.current_price|left:7} ${item.current_subtotal|right:15}
{/if}
{if item.type == 'discount' || item.type == 'surcharge'}
  ${item.name|left:23} ${item.current_subtotal|right:15}
{/if}
{if item.type == 'tray' || item.type == 'subtotal'}
  ${item.name|left:23} ${item.current_subtotal|right:15}
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





[&PC]
