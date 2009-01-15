[&ESC !][0x28]${data.store.name|center:21}[&ESC !][0x01]
${data.store.telephone1|center:42}
Opened:   ${data.create_date.toLocaleFormat('%Y-%m-%d %H:%M:%S')}
Closed:   ${data.print_date.toLocaleFormat('%Y-%m-%d %H:%M:%S')}
Terminal: ${data.terminal_no|left:10} Clerk: ${data.proceeds_clerk_displayname|left:14}
------------------------------------------
{for item in data.items_summary}
 ${item.qty_subtotal|right:3} X ${item.name|left:23} ${formatPrice(item.subtotal)|right:10}
{if item.discount_subtotal != 0}${formatPrice(item.discount_subtotal)|right:41}
{/if}
{if item.surcharge_subtotal != 0}${'+' + formatPrice(item.surcharge_subtotal)|right:41}
{/if}
{/for}
------------------------------------------
Discount:  ${formatPrice(data.discount_subtotal)|right:30}
Surcharge: ${formatPrice(data.surcharge_subtotal)|right:30}
Tax:       ${formatPrice(data.tax_subtotal)|right:30}
Total:     ${formatPrice(data.total)|right:30}

Received:  ${formatPrice(data.payment_subtotal)|right:30}
CHANGE:    ${formatPrice(0 - data.remain)|right:30}
------------------------------------------

${'Thank you for shopping at ' + data.store.name +'!'|center:42}
