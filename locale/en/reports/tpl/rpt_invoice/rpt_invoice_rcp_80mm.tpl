[&QSON]${head.store.name|center:15}[&QSOFF]
[&DWON]${head.store.branch|center:15}[&DWOFF]
${head.store.telephone1|center:42}
機器編號: ${head.store.terminal_no|left:10}收銀員: ${head.clerk_displayname|left:14}
${head.start_time} ~ ${head.end_time}

${head.title|center:42}
{for item in body}
------------------------------------------
${'時間:'|left:14}${item.created|right:28}
${'班別:'|left:14}${item.shift_number|right:28}
${'發票號碼:'|left:14}${item.invoice_no|right:28}
${'統一編號:'|left:14}${item.uniform_business_number|right:28}
${'備註:'|left:14}${item.status|right:28}
${'發票張數:'|left:14}${item.num_invoices|right:28}
${'總計:'|left:14}${item.Order.total|default:0|viviFormatPrices:true|right:28}
${'折扣金額:'|left:14}${item.discount_subtotal|default:0|viviFormatPrices:true|right:28}
${'附加費:'|left:14}${item.surcharge_subtotal|default:0|viviFormatPrices:true|right:28}
${'外加稅:'|left:14}${item.Order.tax_subtotal|default:0|viviFormatPrices:true|right:28}
${'內含稅:'|left:14}${item.Order.included_tax_subtotal|default:0|viviFormatPrices:true|right:28}
{for tax in taxList}
${tax.no + ':'|left:14}${item[ tax.no ]|viviFormatPrices:true|right:28}
{/for}
{/for}
------------------------------------------
總計
${'發票張數:'|left:14}${foot.summary.num_invoices|default:0|viviFormatPrices:true|right:28}
${'總計:'|left:14}${foot.summary.total|default:0|viviFormatPrices:true|right:28}
${'折扣金額:'|left:14}${foot.summary.discount_subtotal|default:0|viviFormatPrices:true|right:28}
${'附加費:'|left:14}${foot.summary.surcharge_subtotal|default:0|viviFormatPrices:true|right:28}
${'外加稅:'|left:14}${foot.summary.tax_subtotal|default:0|viviFormatPrices:true|right:28}
${'內含稅:'|left:14}${foot.summary.included_tax_subtotal|default:0|viviFormatPrices:true|right:28}
{for tax in taxList}
${tax.no + ':'|left:14}${foot.summary[ tax.no ]|viviFormatPrices:true|right:28}
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