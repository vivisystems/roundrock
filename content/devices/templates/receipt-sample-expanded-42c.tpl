{if duplicate}
[&DWON]${'Bill Copy'|center:21}[&DWOFF]
{/if}
[&QSON]${store.name|center:21}[&QSOFF]
[&DWON]${store.branch|center:21}[&DWOFF]
${store.telephone1|center:42}
${'Opened:'|left:10} ${(new Date(order.created * 1000)).toLocaleFormat('%Y-%m-%d %H:%M:%S')}
${'Printed:'|left:10} ${(new Date()).toLocaleFormat('%Y-%m-%d %H:%M:%S')}
${'Terminal:'|left:10} ${order.terminal_no|left:9} ${'Clerk:'|left:6} ${order.proceeds_clerk_displayname|left:14}
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
{if order.trans_discount_subtotal != 0 || order.trans_surcharge_subtotal != 0 || order.revalue_subtotal != 0 || order.promotion_subtotal != 0}
{if order.trans_discount_subtotal != 0}${'Order Discount:'|left:15} ${order.trans_discount_subtotal|viviFormatPrices:true|right:26}
{/if}
{if order.trans_surcharge_subtotal != 0}${'Order Surcharge:'|left:15} ${order.trans_surcharge_subtotal|viviFormatPrices:true|right:26}
{/if}
{if order.revalue_subtotal != 0}${'Order Revalue:'|left:15} ${order.revalue_subtotal|viviFormatPrices:true|right:26}
{/if}
{if order.promotion_subtotal != 0}${'Promotion:'|left:15} ${order.promotion_subtotal|viviFormatPrices:true|right:26}
{/if}
------------------------------------------
{/if}
${'Subtotal:'|left:15} ${txn.formatPrice(order.total - order.tax_subtotal)|right:26}
${'Tax:'|left:15} ${txn.formatPrice(order.tax_subtotal)|right:26}
${'Total:'|left:15} ${txn.formatPrice(order.total)|right:26}
[&CR]
{for payment in order.trans_payments}
{if payment.name == 'cash'}
  ${'Cash:'|left:15} ${payment.amount|viviFormatPrices:true|right:24}
{else}
  ${payment.memo1 + ':'|left:15} ${payment.amount|viviFormatPrices:true|right:24}
{/if}
{/for}
[&CR] 
${'Received:'|left:15} ${order.payment_subtotal|viviFormatPrices:true|right:26}
{if order.remain > 0}
${'BALANCE:'|left:15} ${order.remain|viviFormatPrices:true|right:26}
{else}
${'CHANGE:'|left:15} ${(0 - order.remain)|viviFormatPrices:true|right:26}
{/if}
------------------------------------------
[&CR]
${'Thank you for shopping at ' + store.name +'!'|center:42}
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&PC]
