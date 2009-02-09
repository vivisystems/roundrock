${(new Date(order.modified)).toLocaleFormat('%Y-%m-%d %H:%M')}
店名: ${store.branch|left:18}
電話: ${store.telephone1|left:18}
機號: ${order.terminal_no|left:18}
櫃員: ${order.proceeds_clerk_displayname|left:18}
序號: ${order.seq|left:18}
-----------------------
{for item in order.items_summary}
${item.qty_subtotal|right:3} X ${item.name|left:18}
  ${txn.formatPrice(item.subtotal)|right:22}
{if item.discount_subtotal != 0}${txn.formatPrice(item.discount_subtotal)|right:24}
{/if}
{if item.surcharge_subtotal != 0}${'+' + txn.formatPrice(item.surcharge_subtotal)|right:24}
{/if}
{/for}
-----------------------
{if order.trans_discount_subtotal != 0}Order Discount: ${txn.formatPrice(order.trans_discount_subtotal)|right:8}
{/if}
{if order.trans_surcharge_subtotal != 0}Order Surcharge: ${txn.formatPrice(order.trans_surcharge_subtotal)|right:7}
{/if}
${order.items_count|right:3}項   合計: ${txn.formatPrice(order.total)|right:10}
[&CR]
付款:   ${txn.formatPrice(order.payment_subtotal)|right:16}
找零:   ${txn.formatPrice(0 - order.remain)|right:16}
-----------------------
1
[&GSFF]
