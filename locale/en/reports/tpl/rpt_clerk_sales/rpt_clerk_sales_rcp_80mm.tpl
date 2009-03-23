[&QSON]${head.store.name|center:15}[&QSOFF]
[&DWON]${head.store.branch|center:15}[&DWOFF]
${head.store.telephone1|center:42}
Terminal: ${head.store.terminal_no|left:10} Clerk: ${head.clerk_displayname|left:14}
${head.start_time} ~ ${head.end_time}

${head.title|center:42}
{for clerk in body}
Clerk:${clerk.name|right:36}
------------------------------------------
Term_No.  Time        Seq.
--------  ----------  --------------------
{for order in clerk.orders}
${order.terminal_no|left:8}  ${order.transaction_created|unixTimeToString:'yyyy-M-d'|left:10}  ${order.sequence|left:19}
    ${clerk.associated_clerk} : {if clerk.associated_clerk == 'Proceeds Clerk'}${order.proceeds_clerk_displayname}{/if}{if clerk.associated_clerk == 'Service Clerk'}${order.service_clerk_displayname}{/if}
    
    Total      : ${order.item_subtotal|viviFormatPrices:true}
    Add-on Tax : ${order.tax_subtotal|viviFormatPrices:true}
    Surcharge  : ${order.surcharge_subtotal|viviFormatPrices:true}
    Discount   : ${order.discount_subtotal|viviFormatPrices:true}
    Payment    : ${order.total|viviFormatPrices:true}
    Cash       : ${order.cash|default:0|viviFormatPrices:true}
    Check      : ${order.check|viviFormatPrices:true}
    Credit Card: ${order.creditcard|default:0|viviFormatPrices:true}
    Coupon     : ${order.coupon|default:0|viviFormatPrices:true}
    Gift Card  : ${order.giftcard|viviFormatPrices:true}
{/for}
------------------------------------------
Summary
    Total      : ${clerk.summary.item_subtotal|viviFormatPrices:true}
    Add-on Tax : ${clerk.summary.tax_subtotal|viviFormatPrices:true}
    Surcharge  : ${clerk.summary.surcharge_subtotal|viviFormatPrices:true}
    Discount   : ${clerk.summary.discount_subtotal|viviFormatPrices:true}
    Payment    : ${clerk.summary.total|viviFormatPrices:true}
    Cash       : ${clerk.summary.cash|default:0|viviFormatPrices:true}
    Check      : ${clerk.summary.check|viviFormatPrices:true}
    Credit Card: ${clerk.summary.creditcard|default:0|viviFormatPrices:true}
    Coupon     : ${clerk.summary.coupon|default:0|viviFormatPrices:true}
    Gift Card  : ${clerk.summary.giftcard|viviFormatPrices:true}
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
