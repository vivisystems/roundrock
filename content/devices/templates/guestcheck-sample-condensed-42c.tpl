[&REVON][&QSON]${'GUEST CHECK'|center:21}[&QSOFF][&REVOFF]
[&DHON]${store.name|center:42}[&DHOFF]
[&DHON]${store.branch|center:42}[&DHOFF]
${store.telephone1|center:42}
Opened:   ${(new Date(order.created)).toLocaleFormat('%Y-%m-%d %H:%M:%S')}
Printed:${(new Date()).toLocaleFormat('%Y-%m-%d %H:%M:%S')}
Terminal: ${order.terminal_no|left:10} Clerk: ${order.proceeds_clerk_displayname|left:14}
{if order.table_no != null || order.no_of_customers != null}
Table: ${order.table_no|default:''|left:13} Customers: ${order.no_of_customers|default:''|left:10}
{/if}
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
------------------------------------------
[&CR]
${'Thank you for shopping at ' + store.name +'!'|center:42}
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&PC]
