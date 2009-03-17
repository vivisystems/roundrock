[&QSON]${head.store.name|center:15}[&QSOFF]
[&DWON]${head.store.branch|center:14}[&DWOFF]
${head.store.telephone1|center:24}

Terminal: ${head.store.terminal_no}
Clerk: ${head.clerk_displayname}
${head.start_time} ~
${head.end_time}

${head.title|center:24}
{for item in body}
------------------------
${'Sequence:'|left:24}
${item.Order.sequence|right:24}
${'Total:'|left:24}
${item.Order.total|default:0|viviFormatPrices:true|right:24}
${'Discount:'|left:24}
${item.discount_subtotal|default:0|viviFormatPrices:true|right:24}
${'Surcharge:'|left:24}
${item.surcharge_subtotal|default:0|viviFormatPrices:true|right:24}
${'Add-on Tax:'|left:24}
${item.Order.tax_subtotal|default:0|viviFormatPrices:true|right:24}
${'Included Tax:'|left:24}
${item.Order.included_tax_subtotal|default:0|viviFormatPrices:true|right:24}
{for tax in taxList}
${tax.no + ':'|left:24}
${item[ tax.no ]|viviFormatPrices:true|right:24}
{/for}
{/for}
------------------------
Summary
${'Total:'|left:24}
${foot.summary.total|default:0|viviFormatPrices:true|right:24}
${'Discount:'|left:24}
${foot.summary.discount_subtotal|default:0|viviFormatPrices:true|right:24}
${'Surcharge:'|left:24}
${foot.summary.surcharge_subtotal|default:0|viviFormatPrices:true|right:24}
${'Add-on Tax:'|left:24}
${foot.summary.tax_subtotal|default:0|viviFormatPrices:true|right:24}
${'Included Tax:'|left:24}
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
