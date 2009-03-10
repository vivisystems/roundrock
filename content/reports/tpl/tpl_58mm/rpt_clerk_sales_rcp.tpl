[&QSON]${head.store.name|center:15}[&QSOFF]
[&DWON]${head.store.branch|center:14}[&DWOFF]
${head.store.telephone1|center:24}

Terminal: ${head.store.terminal_no}
Clerk: ${head.clerk_displayname}
${head.start_time} ~
${head.end_time}

${head.title|center:24}
{for clerk in body}

Clerk:
${clerk.name|right:24}
{for order in clerk.orders}
------------------------
Term_No.   :
${order.terminal_no|right:24}
${clerk.associated_clerk}:
{if clerk.associated_clerk == 'Proceeds Clerk'}${order.proceeds_clerk_displayname|right:24}{/if}{if clerk.associated_clerk == 'Service Clerk'}${order.service_clerk_displayname|right:24}{/if}
[&CR]
Time       :
${order.transaction_created|unixTimeToString:'yyyy-M-d'|right:24}
Seq.       :
${order.sequence|right:24}
Invoice No.:
${order.invoice_no|right:24}
Total      :
${order.item_subtotal|viviFormatPrices:true|right:24}
Add-on Tax :
${order.tax_subtotal|viviFormatPrices:true|right:24}
Surcharge  :
${order.surcharge_subtotal|viviFormatPrices:true|right:24}
Discount   :
${order.discount_subtotal|viviFormatPrices:true|right:24}
Payment    :
${order.total|viviFormatPrices:true|right:24}
Cash       :
${order.cash|default:0|viviFormatPrices:true|right:24}
Check      :
${order.check|viviFormatPrices:true|right:24}
Credit Card:
${order.creditcard|default:0|viviFormatPrices:true|right:24}
Coupon     :
${order.coupon|default:0|viviFormatPrices:true|right:24}
Gift Card  :
${order.giftcard|viviFormatPrices:true|right:24}
{/for}
------------------------
Summary
Total      :
${clerk.summary.item_subtotal|viviFormatPrices:true|right:24}
Add-on Tax :
${clerk.summary.tax_subtotal|viviFormatPrices:true|right:24}
Surcharge  :
${clerk.summary.surcharge_subtotal|viviFormatPrices:true|right:24}
Discount   :
${clerk.summary.discount_subtotal|viviFormatPrices:true|right:24}
Payment    :
${clerk.summary.total|viviFormatPrices:true|right:24}
Cash       :
${clerk.summary.cash|default:0|viviFormatPrices:true|right:24}
Check      :
${clerk.summary.check|viviFormatPrices:true|right:24}
Credit Card:
${clerk.summary.creditcard|default:0|viviFormatPrices:true|right:24}
Coupon     :
${clerk.summary.coupon|default:0|viviFormatPrices:true|right:24}
Gift Card  :
${clerk.summary.giftcard|viviFormatPrices:true|right:24}
------------------------
{/for}
${foot.gen_time}
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&PC]
