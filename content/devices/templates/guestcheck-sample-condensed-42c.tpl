[&INIT]
[&REVON][&QSON]${'GUEST CHECK'|center:21}[&QSOFF][&REVOFF]
[&DHON]${store.name|center:42}[&DHOFF]
[&DHON]${store.branch|center:42}[&DHOFF]
[&RESET]${store.telephone1|center:42}
${'Opened:'|left:10} ${(new Date(order.created * 1000)).toLocaleFormat('%Y-%m-%d %H:%M:%S')}
${'Printed:'|left:10} ${(new Date()).toLocaleFormat('%Y-%m-%d %H:%M:%S')}
${'Terminal:'|left:10} ${order.terminal_no|left:9} ${'Clerk:'|left:6} ${order.proceeds_clerk_displayname|left:14}
{if order.table_no != null || order.no_of_customers != null}
${'Table:'|left:10} ${order.table_no|default:''|left:9} ${'#Cust:'|left:6} ${order.no_of_customers|default:''|left:14}
{/if}
------------------------------------------
{for item in order.display_sequences}
{if item.type == 'item'}
${item.current_qty|right:4} ${item.name|left:16} ${item.current_price|right:6} ${item.current_subtotal|right:12}
{/if}
{if item.type == 'discount' || item.type == 'surcharge'}
    ${item.name|left:24} ${item.current_subtotal|right:12}
{/if}
{if item.type == 'tray' || item.type == 'subtotal'}
    ${_(item.name)|left:24} ${item.current_subtotal|right:12}
{/if}
{/for}
------------------------------------------
{if order.trans_discount_subtotal != 0}${'Order Discount:'|left:15} ${order.trans_discount_subtotal|viviFormatPrices:true|right:26}
{/if}
{if order.trans_surcharge_subtotal != 0}${'Order Surcharge:'|left:15} ${order.trans_surcharge_subtotal|viviFormatPrices:true|right:26}
{/if}
{if order.revalue_subtotal != 0}${'Order Revalue:'|left:15} ${order.revalue_subtotal|viviFormatPrices:true|right:26}
{/if}
{if order.promotion_subtotal != 0}${'Promotion:'|left:15} ${order.promotion_subtotal|viviFormatPrices:true|right:26}
{/if}
${'Tax:'|left:15} ${order.tax_subtotal|viviFormatTaxes:true|right:26}
${'Total:'|left:15} ${order.total|viviFormatPrices:true|right:26}
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
[&CR]
[&CR]
[&CR]
