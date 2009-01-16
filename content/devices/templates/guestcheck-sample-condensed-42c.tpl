[&ESC !][0x28]${data.store.name|center:21}[&ESC !][0x01]
[&ESC !][0x28]${data.store.branch|center:21}[&ESC !][0x01]
${data.store.telephone1|center:42}
Opened:   ${data.create_date.toLocaleFormat('%Y-%m-%d %H:%M:%S')}
Closed:   ${data.print_date.toLocaleFormat('%Y-%m-%d %H:%M:%S')}
Terminal: ${data.terminal_no|left:10} Clerk: ${data.proceeds_clerk_displayname|left:14}
------------------------------------------
{for item in data.display_sequences}
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
{if data.trans_discount_subtotal != 0}Order Discount:  ${formatPrice(data.trans_discount_subtotal)|right:24}
{/if}
{if data.trans_surcharge_subtotal != 0}Order Surcharge: ${formatPrice(data.trans_surcharge_subtotal)|right:24}
{/if}
Tax:       ${formatPrice(data.tax_subtotal)|right:30}
Total:     ${formatPrice(data.total)|right:30}

Received:  ${formatPrice(data.payment_subtotal)|right:30}
CHANGE:    ${formatPrice(0 - data.remain)|right:30}
------------------------------------------

${'Thank you for shopping at ' + data.store.name +'!'|center:42}





[&GS V][0x01]