[&QSON]${head.store.name|center:15}[&QSOFF]
[&DWON]${head.store.branch|center:15}[&DWOFF]
${head.store.telephone1|center:42}
${_( 'Terminal' ) + ': '}${head.store.terminal_no + ' '|left:11}${_( 'Clerk' ) + ': '}${head.clerk_displayname|left:14}
${head.start_time} ~ ${head.end_time}

${head.title|center:42}
{for clerk in body}
Clerk:${clerk.name|right:36}
------------------------------------------
${_( 'Term_No.' )|left:8}  ${_( 'Time' )|left:10}  ${_( 'Seq.' )|left:20}
--------  ----------  --------------------
{for order in clerk.orders}
${order.terminal_no|left:8}  ${order.transaction_created|unixTimeToString:'yyyy-M-d'|left:10}  ${order.sequence|left:20}
    ${clerk.associated_clerk} : {if clerk.associated_clerk == 'Proceeds Clerk'}${order.proceeds_clerk_displayname}{/if}{if clerk.associated_clerk == 'Service Clerk'}${order.service_clerk_displayname}{/if}
    
${'    ' + _( 'Total' ) + ': '|left:17}${order.item_subtotal|viviFormatPrices:true}
${'    ' + _( 'Add-on Tax' ) + ': '|left:17}${order.tax_subtotal|viviFormatPrices:true}
${'    ' + _( 'Surcharge' ) + ': '|left:17}${order.surcharge_subtotal|viviFormatPrices:true}
${'    ' + _( 'Discount' ) + ': '|left:17}${order.discount_subtotal|viviFormatPrices:true}
${'    ' + _( 'Payment' ) + ': '|left:17}${order.total|viviFormatPrices:true}
${'    ' + _( 'Cash' ) + ': '|left:17}${order.cash|default:0|viviFormatPrices:true}
${'    ' + _( 'Check' ) + ': '|left:17}${order.check|viviFormatPrices:true}
${'    ' + _( 'Credit Card' ) + ': '|left:17}${order.creditcard|default:0|viviFormatPrices:true}
${'    ' + _( 'Coupon' ) + ': '|left:17}${order.coupon|default:0|viviFormatPrices:true}
${'    ' + _( 'Gift Card' ) + ': '|left:17}${order.giftcard|viviFormatPrices:true}
{/for}
------------------------------------------
${_( 'Summary' )}
${'    ' + _( 'Total' ) + ': '|left:17}${clerk.summary.item_subtotal|viviFormatPrices:true}
${'    ' + _( 'Add-on Tax' ) + ': '|left:17}${clerk.summary.tax_subtotal|viviFormatPrices:true}
${'    ' + _( 'Surcharge' ) + ': '|left:17}${clerk.summary.surcharge_subtotal|viviFormatPrices:true}
${'    ' + _( 'Discount' ) + ': '|left:17}${clerk.summary.discount_subtotal|viviFormatPrices:true}
${'    ' + _( 'Payment' ) + ': '|left:17}${clerk.summary.total|viviFormatPrices:true}
${'    ' + _( 'Cash' ) + ': '|left:17}${clerk.summary.cash|default:0|viviFormatPrices:true}
${'    ' + _( 'Check' ) + ': '|left:17}${clerk.summary.check|viviFormatPrices:true}
${'    ' + _( 'Credit Card' ) + ': '|left:17}${clerk.summary.creditcard|default:0|viviFormatPrices:true}
${'    ' + _( 'Coupon' ) + ': '|left:17}${clerk.summary.coupon|default:0|viviFormatPrices:true}
${'    ' + _( 'Gift Card' ) + ': '|left:17}${clerk.summary.giftcard|viviFormatPrices:true}
------------------------------------------
{/for}
${foot.gen_time}
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&PC]
