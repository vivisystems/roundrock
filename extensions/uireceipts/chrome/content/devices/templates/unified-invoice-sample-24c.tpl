{eval}
  itemCount = 0;
  pageCount = 0;
  pageSize = 6;
  numPages = Math.ceil(order.items_count / pageSize);
  curPage = 1;
  order.receiptPages = numPages;
{/eval}
{for item in order.items}
{if pageCount == 0}
[&QSON]${store.name|center:6}[&QSOFF]
${(new Date()).toLocaleFormat('%Y-%m-%d %H:%M')}
店名: ${store.branch|left:18}
電話: ${store.telephone1|left:18}
機號: ${order.terminal_no|left:18}
櫃員: ${order.proceeds_clerk_displayname|left:18}
序號: ${order.seq|left:9} ${curPage+'/'+numPages|right:6}頁
-----------------------
{/if}
{if item.parent_index == null}
${item.current_qty|right:3}X ${item.name|left:19}
${txn.formatPrice(item.current_subtotal)|right:20} ${item.tax_name|left:3}
{if item.hasDiscount}${item.discount_name|right:8} ${txn.formatPrice(item.current_discount)|right:11}
{/if}
{if item.hasSurcharge}${item.surcharge_name|right:8} ${'+' + txn.formatPrice(item.current_surcharge)|right:11}
{/if}
{eval}
pageCount++;
itemCount++;
{/eval}
{if pageCount == pageSize || itemCount == order.items_count}
-----------------------
{if curPage == numPages}
   ${order.items_count + '項'|left:20}
{if order.trans_discount_subtotal != 0}折扣: ${txn.formatPrice(order.trans_discount_subtotal)|right:14}
{/if}
{if order.trans_surcharge_subtotal != 0}加價: ${txn.formatPrice(order.trans_surcharge_subtotal)|right:14}
{/if}
合計:   [&QSON]${txn.formatPrice(order.total)|right:8}[&QSOFF]
付款:   ${txn.formatPrice(order.payment_subtotal)|right:16}
找零:   [&QSON]${txn.formatPrice(0 - order.remain)|right:8}[&QSOFF]
{/if}
[&FF]
{eval}
  curPage++;
  pageCount = 0;
{/eval}
{/if}
{/if}
{/for}
