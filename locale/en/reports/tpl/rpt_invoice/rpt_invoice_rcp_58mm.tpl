[&QSON]${head.store.name|center:15}[&QSOFF]
[&DWON]${head.store.branch|center:14}[&DWOFF]
${head.store.telephone1|center:24}

機器編號: ${head.store.terminal_no}
收銀員: ${head.clerk_displayname}
${head.start_time} ~
${head.end_time}

${head.title|center:24}
{for item in body}
------------------------
${'時間:'|left:24}
${item.created|right:24}
${'班別:'|left:24}
${item.shift_number|right:24}
${'發票號碼:'|left:24}
${item.invoice_no|right:24}
${'統一編號:'|left:24}
${item.uniform_buisness_number|right:24}
${'備註:'|left:24}
${item.status|right:24}
${'發票張數:'|left:24}
${item.num_invoices|right:24}
${'總計:'|left:24}
${item.Order.total|default:0|viviFormatPrices:true|right:24}
${'折扣金額:'|left:24}
${item.discount_subtotal|default:0|viviFormatPrices:true|right:24}
${'附加費:'|left:24}
${item.surcharge_subtotal|default:0|viviFormatPrices:true|right:24}
${'外加稅:'|left:24}
${item.Order.tax_subtotal|default:0|viviFormatPrices:true|right:24}
${'內含稅:'|left:24}
${item.Order.included_tax_subtotal|default:0|viviFormatPrices:true|right:24}
{for tax in taxList}
${tax.no + ':'|left:24}
${item[ tax.no ]|viviFormatPrices:true|right:24}
{/for}
{/for}
------------------------
總計
${'發票張數'|left:24}
${foot.summary.num_invoices|default:0|right:24}
${'總計:'|left:24}
${foot.summary.total|default:0|viviFormatPrices:true|right:24}
${'折扣金額:'|left:24}
${foot.summary.discount_subtotal|default:0|viviFormatPrices:true|right:24}
${'附加費:'|left:24}
${foot.summary.surcharge_subtotal|default:0|viviFormatPrices:true|right:24}
${'外加稅:'|left:24}
${foot.summary.tax_subtotal|default:0|viviFormatPrices:true|right:24}
${'內含稅:'|left:24}
${foot.summary.included_tax_subtotal|default:0|viviFormatPrices:true|right:24}
{for tax in taxList}
${tax.no + ':'|left:24}
${foot.summary[ tax.no ]|viviFormatPrices:true|right:24}
{/for}
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