{if duplicate}
[&DWON]${'Bill Copy'|center:21}[&DWOFF]
{/if}
[&QSON]${store.name|center:21}[&QSOFF]
[&DWON]${store.branch|center:21}[&DWOFF]
${store.telephone1|center:42}
Opened:   ${(new Date(order.created)).toLocaleFormat('%Y-%m-%d %H:%M:%S')}
Submitted:${(new Date()).toLocaleFormat('%Y-%m-%d %H:%M:%S')}
Terminal: ${order.terminal_no|left:10} Clerk: ${order.proceeds_clerk_displayname|left:14}
------------------------------------------
{for item in order.display_sequences}
{if item.type == 'item'}
${item.current_qty|right:4} ${item.name|left:12} @${item.current_price|right:6} ${item.current_subtotal|right:12} ${item.current_tax|right:3}
{elseif item.type == 'condiment'}
    {if item.current_price != null && item.current_price != 0}
    ${item.name|left:12} @${item.current_price|right:6}
    {else}
    ${item.name|left:38}
    {/if}
{elseif item.type == 'memo'}
        ${item.name|left:34}
{elseif item.type == 'discount' || item.type == 'surcharge'}
     ${item.name|left:20} ${item.current_subtotal|right:12}
{elseif item.type == 'tray'}
     ${item.name|left:20} ${item.current_subtotal|right:12}
{/if}
{/for}
------------------------------------------
{if order.trans_discount_subtotal != 0 || order.trans_surcharge_subtotal != 0}
{if order.trans_discount_subtotal != 0}Order Discount:  ${txn.formatPrice(order.trans_discount_subtotal)|right:21}
{/if}
{if order.trans_surcharge_subtotal != 0}Order Surcharge: ${txn.formatPrice(order.trans_surcharge_subtotal)|right:21}
{/if}
------------------------------------------
{/if}
Subtotal:  ${txn.formatPrice(order.total - order.tax_subtotal)|right:27}
Tax:       ${txn.formatPrice(order.tax_subtotal)|right:27}
Total:     ${txn.formatPrice(order.total)|right:27}
[&CR]
{for payment in order.trans_payments}
{if payment.name == 'cash'}
Cash:      ${txn.formatPrice(payment.amount)|right:27}
{elseif payment.name == 'creditcard'}
${payment.memo1 + ':'|left:10} ${txn.formatPrice(payment.amount)|right:27}
{elseif payment.name == 'giftcard'}
${payment.memo1 + ':'|left:10} ${txn.formatPrice(payment.amount)|right:27}
{/if}
{/for}
[&CR] 
Received:  ${txn.formatPrice(order.payment_subtotal)|right:27}
CHANGE:    ${txn.formatPrice(0 - order.remain)|right:27}
------------------------------------------
[&CR]
${'Thank you for shopping at ' + store.name +'!'|center:42}
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&PC]
