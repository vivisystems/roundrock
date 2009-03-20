[&QSON]${head.store.name|center:15}[&QSOFF]
[&DWON]${head.store.branch|center:15}[&DWOFF]
${head.store.telephone1|center:42}
Terminal: ${head.store.terminal_no|left:10} Clerk: ${head.clerk_displayname|left:14}
${head.start_time} ~ ${head.end_time}

${head.title|center:42}
------------------------------------------
Term_No.  Time        Seqequence
--------  ----------  --------------------
{for detail in body}
${detail.terminal_no|left:8}  ${detail.transaction_created|unixTimeToString:'yyyy-M-d'|left:10}  ${detail.sequence|left:19}
    Service    : ${detail.service_clerk_displayname|viviFormatPrices:true}
    Proceeds   : ${detail.proceeds_clerk_displayname|viviFormatPrices:true}
    Total      : ${detail.item_subtotal|viviFormatPrices:true}
    Add-on Tax : ${detail.tax_subtotal|viviFormatPrices:true}
    Surcharge  : ${detail.surcharge_subtotal|viviFormatPrices:true}
    Discount   : ${detail.discount_subtotal|viviFormatPrices:true}
    Payment    : ${detail.total|viviFormatPrices:true}
    Cash       : ${detail.cash|default:0|viviFormatPrices:true}
    Check      : ${detail.check|viviFormatPrices:true}
    Credit Card: ${detail.creditcard|default:0|viviFormatPrices:true}
    Coupon     : ${detail.coupon|default:0|viviFormatPrices:true}
    Gift Card  : ${detail.giftcard|viviFormatPrices:true}
{/for}
------------------------------------------
Summary
    Total      : ${foot.foot_datas.item_subtotal|viviFormatPrices:true}
    Add-on Tax : ${foot.foot_datas.tax_subtotal|viviFormatPrices:true}
    Surcharge  : ${foot.foot_datas.surcharge_subtotal|viviFormatPrices:true}
    Discount   : ${foot.foot_datas.discount_subtotal|viviFormatPrices:true}
    Payment    : ${foot.foot_datas.total|viviFormatPrices:true}
    Cash       : ${foot.foot_datas.cash|default:0|viviFormatPrices:true}
    Check      : ${foot.foot_datas.check|viviFormatPrices:true}
    Credit Card: ${foot.foot_datas.creditcard|default:0|viviFormatPrices:true}
    Coupon     : ${foot.foot_datas.coupon|default:0|viviFormatPrices:true}
    Gift Card  : ${foot.foot_datas.giftcard|viviFormatPrices:true}
------------------------------------------
${foot.gen_time}
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&PC]
