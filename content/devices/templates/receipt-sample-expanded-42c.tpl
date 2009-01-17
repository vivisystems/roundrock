[&ESC !][0x28]${data.store.name|center:21}[&ESC !][0x01]
[&ESC !][0x28]${data.store.branch|center:21}[&ESC !][0x01]
${data.store.telephone1|center:42}
Opened:   ${data.create_date.toLocaleFormat('%Y-%m-%d %H:%M:%S')}
Closed:   ${data.print_date.toLocaleFormat('%Y-%m-%d %H:%M:%S')}
Terminal: ${data.terminal_no|left:10} Clerk: ${data.proceeds_clerk_displayname|left:14}
------------------------------------------
{for item in data.display_sequences}
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
{if data.trans_discount_subtotal != 0 || data.trans_surcharge_subtotal != 0}
{if data.trans_discount_subtotal != 0}Order Discount:  ${formatPrice(data.trans_discount_subtotal)|right:21}
{/if}
{if data.trans_surcharge_subtotal != 0}Order Surcharge: ${formatPrice(data.trans_surcharge_subtotal)|right:21}
{/if}
------------------------------------------
{/if}
Subtotal:  ${formatPrice(data.total - data.tax_subtotal)|right:27}
Tax:       ${formatPrice(data.tax_subtotal)|right:27}
Total:     ${formatPrice(data.total)|right:27}

{for payment in data.trans_payments}
{if payment.name == 'cash'}
Cash:      ${formatPrice(payment.amount)|right:27}
{elseif payment.name == 'creditcard'}
${payment.memo1 + ':'|left:10} ${formatPrice(payment.amount)|right:27}
{elseif payment.name == 'giftcard'}
${payment.memo1 + ':'|left:10} ${formatPrice(payment.amount)|right:27}
{/if}
{/for}
  
Received:  ${formatPrice(data.payment_subtotal)|right:27}
CHANGE:    ${formatPrice(0 - data.remain)|right:27}
------------------------------------------

${'Thank you for shopping at ' + data.store.name +'!'|center:42}





[&GS V][0x01]