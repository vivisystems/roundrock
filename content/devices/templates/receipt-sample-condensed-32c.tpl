[&INIT]
{if duplicate}
[&DWON]${'Bill Copy'|center:16}[&DWOFF]
{/if}
[&QSON]${store.name|center:16}[&QSOFF][&CR]
[&DWON]${store.branch|center:16}[&DWOFF][&CR]
[&RESET]${store.telephone1|center:31}[&CR]
${(new Date()).toLocaleFormat('%Y-%m-%d %H:%M:%S')|center:31}[&CR]
${'Terminal:'|left:9}${order.terminal_no|left:22}[&CR]
${'Clerk:'|left:6}${order.proceeds_clerk_displayname|left:25}[&CR]
-------------------------------[&CR]
{for item in order.items_summary}
${item.qty_subtotal + 'X'|left:5}${item.name|left:17}${item.subtotal|viviFormatPrices:true|right:9}[&CR]
{if item.discount_subtotal != 0}${item.discount_subtotal|viviFormatPrices:true|right:31}[&CR]
{/if}
{if item.surcharge_subtotal != 0}${'+' + item.surcharge_subtotal|viviFormatPrices:true|right:31}[&CR]
{/if}
{/for}
-------------------------------[&CR]
{if order.trans_discount_subtotal != 0}${'Order Discount:'|left:14}${order.trans_discount_subtotal|viviFormatPrices:true|right:17}[&CR]
{/if}
{if order.trans_surcharge_subtotal != 0}${'Order Surcharge:'|left:16}${order.trans_surcharge_subtotal|viviFormatPrices:true|right:15}[&CR]
{/if}
{if order.revalue_subtotal != 0}${'Order Revalue:'|left:14}${order.revalue_subtotal|viviFormatPrices:true|right:17}[&CR]
{/if}
{if order.promotion_subtotal != 0}${'Promotion:'|left:10}${order.promotion_subtotal|viviFormatPrices:true|right:21}[&CR]
{/if}
${'Tax:'|left:4}${order.tax_subtotal|viviFormatPrices:true|right:27}[&CR]
${'Total:'|left:6}${order.total|viviFormatPrices:true|right:25}[&CR]
[&CR]
${'Received:'|left:9}${order.payment_subtotal|viviFormatPrices:true|right:22}[&CR]
{if order.remain > 0}
${'BALANCE:'|left:8}${order.remain|viviFormatPrices:true|right:23}[&CR]
{else}
${'CHANGE:'|left:7}${(0 - order.remain)|viviFormatPrices:true|right:24}[&CR]
{/if}
-------------------------------[&CR]
[&CR]
${'Thank you for shopping at'|center:31}[&CR]
[&QSON]${store.name|center:16}[&QSOFF][&CR]
[&RESET]
[&CR]
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
