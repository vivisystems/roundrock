[&QSON]${head.store.name|center:15}[&QSOFF]
[&DWON]${head.store.branch|center:14}[&DWOFF]
${head.store.telephone1|center:24}

Terminal: ${head.store.terminal_no}
Clerk: ${head.clerk_displayname}
${head.start_time} ~
${head.end_time}

${head.title|center:24}
------------------------
{for detail in body}
Term_No.   :
${detail.terminal_no|right:24}
Time       :
${detail.transaction_created|unixTimeToString:'yyyy-M-d'|right:24}
Sequence   :
${detail.sequence|right:24}
Service    :
${detail.service_clerk_displayname|viviFormatPrices:true|right:24}
Proceeds   :
${detail.proceeds_clerk_displayname|viviFormatPrices:true|right:24}
Total      :
${detail.item_subtotal|viviFormatPrices:true|right:24}
Add-on Tax :
${detail.tax_subtotal|viviFormatPrices:true|right:24}
Surcharge  :
${detail.surcharge_subtotal|viviFormatPrices:true|right:24}
Discount   :
${detail.discount_subtotal|viviFormatPrices:true|right:24}
Payment    :
${detail.total|viviFormatPrices:true|right:24}
Cash       :
${detail.cash|default:0|viviFormatPrices:true|right:24}
Check      :
${detail.check|viviFormatPrices:true|right:24}
Credit Card:
${detail.creditcard|default:0|viviFormatPrices:true|right:24}
Coupon     :
${detail.coupon|default:0|viviFormatPrices:true|right:24}
Gift Card  :
${detail.giftcard|viviFormatPrices:true|right:24}
{/for}
------------------------
Summary
Total      :
${foot.foot_datas.item_subtotal|viviFormatPrices:true|right:24}
Add-on Tax :
${foot.foot_datas.tax_subtotal|viviFormatPrices:true|right:24}
Surcharge  :
${foot.foot_datas.surcharge_subtotal|viviFormatPrices:true|right:24}
Discount   :
${foot.foot_datas.discount_subtotal|viviFormatPrices:true|right:24}
Payment    :
${foot.foot_datas.total|viviFormatPrices:true|right:24}
Cash       :
${foot.foot_datas.cash|default:0|viviFormatPrices:true|right:24}
Check      :
${foot.foot_datas.check|viviFormatPrices:true|right:24}
Credit Card:
${foot.foot_datas.creditcard|default:0|viviFormatPrices:true|right:24}
Coupon     :
${foot.foot_datas.coupon|default:0|viviFormatPrices:true|right:24}
Gift Card  :
${foot.foot_datas.giftcard|viviFormatPrices:true|right:24}
------------------------
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
