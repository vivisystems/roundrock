[&QSON]${head.store.name|center:15}[&QSOFF]
[&DWON]${head.store.branch|center:15}[&DWOFF]
${head.store.telephone1|center:42}
Terminal: ${head.store.terminal_no|left:10} Clerk: ${head.clerk_displayname|left:14}
${head.start_time} ~ ${head.end_time}

${head.title|center:42}
------------------------------------------
Term_No.  Time        Sequence
--------  ----------  --------------------
{for detail in body}
${detail.terminal_no|left:8}  ${detail.transaction_created|unixTimeToString:'yyyy-M-d'|left:10}  ${detail.sequence|left:20}
	Service Clerk: ${detail.service_clerk_displayname}
    Status:     ${detail.status}
    Total:      ${detail.item_subtotal|viviFormatPrices:true}
    Add-on Tax: ${detail.tax_subtotal|viviFormatPrices:true}
    Surcharge:  ${detail.surcharge_subtotal|viviFormatPrices:true}
    Discount:   ${detail.discount_subtotal|viviFormatPrices:true}
    Payment:    ${detail.total|viviFormatPrices:true}
{/for}
------------------------------------------
Summary
    Total:      ${foot.foot_datas.item_subtotal|viviFormatPrices:true}
    Add-on Tax: ${foot.foot_datas.tax_subtotal|viviFormatPrices:true}
    Surcharge:  ${foot.foot_datas.surcharge_subtotal|viviFormatPrices:true}
    Discount:   ${foot.foot_datas.discount_subtotal|viviFormatPrices:true}
    Payment:    ${foot.foot_datas.total|viviFormatPrices:true}
------------------------------------------
${foot.gen_time}
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&PC]
