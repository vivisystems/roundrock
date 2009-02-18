[&QSON]${head.store.name|center:21}[&QSOFF]
[&DWON]${head.store.branch|center:21}[&DWOFF]
${head.store.telephone1|center:42}
Terminal: ${head.store.terminal_no|left:10} Clerk: ${head.clerk_displayname|left:14}
${head.start_time} ~ ${head.end_time}
------------------------------------------
Term_No.  Time        Seq.    Invoice No
--------  ----------  ------  ------------
{for detail in body}
${detail.terminal_no|8}  ${detail.transaction_created|10}  ${detail.sequence|6}  ${detail.invoice_no|12}
    Total      : ${detail.total|viviFormatPrices:true}
    Surcharge  : ${detail.surcharge_subtotal|viviFormatPrices:true}
    Discount   : ${detail.discount_subtotal|viviFormatPrices:true}
    Cash       : ${detail.cash|default:0|viviFormatPrices:true}
    Credit Card: ${detail.creditcard|default:0|viviFormatPrices:true}
    Coupon     : ${detail.coupon|default:0|viviFormatPrices:true}"
{/for}
------------------------------------------
${foot.gen_time}
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&PC]