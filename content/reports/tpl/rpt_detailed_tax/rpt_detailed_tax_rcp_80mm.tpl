[&QSON]${head.store.name|center:15}[&QSOFF]
[&DWON]${head.store.branch|center:15}[&DWOFF]
${head.store.telephone1|center:42}
${_( '(rpt)Terminal' ) + ': '}${head.store.terminal_no + ' '|left:10}${_( '(rpt)Clerk' ) + ': '}${head.clerk_displayname|left:14}
${head.start_time} ~ ${head.end_time}

${head.title|center:42}
{for item in body}
------------------------------------------
${_( '(rpt)sequence' ) + ':'|left:14}${item.Order.sequence|right:28}
${_( '(rpt)Total' ) + ':'|left:14}${item.Order.total|default:0|viviFormatPrices:true|right:28}
${_( '(rpt)Discount' ) + ':'|left:14}${item.discount_subtotal|default:0|viviFormatPrices:true|right:28}
${_( '(rpt)Surcharge' ) + ':'|left:14}${item.surcharge_subtotal|default:0|viviFormatPrices:true|right:28}
${_( '(rpt)Add-on Tax' ) + ':'|left:14}${item.Order.tax_subtotal|default:0|viviFormatPrices:true|right:28}
${_( '(rpt)Included Tax' ) + ':'|left:14}${item.Order.included_tax_subtotal|default:0|viviFormatPrices:true|right:28}
{for tax in taxList}
${tax.no + ':'|left:14}${item[ tax.no ]|viviFormatPrices:true|right:28}
{/for}
{/for}
------------------------------------------
${_( '(rpt)Summary' )}
${_( '(rpt)Total' ) + ':'|left:14}${foot.summary.total|default:0|viviFormatPrices:true|right:28}
${_( '(rpt)Discount' ) + ':'|left:14}${foot.summary.discount_subtotal|default:0|viviFormatPrices:true|right:28}
${_( '(rpt)Surcharge' ) + ':'|left:14}${foot.summary.surcharge_subtotal|default:0|viviFormatPrices:true|right:28}
${_( '(rpt)Add-on Tax' ) + ':'|left:14}${foot.summary.tax_subtotal|default:0|viviFormatPrices:true|right:28}
${_( '(rpt)Included Tax' ) + ':'|left:14}${foot.summary.included_tax_subtotal|default:0|viviFormatPrices:true|right:28}
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
