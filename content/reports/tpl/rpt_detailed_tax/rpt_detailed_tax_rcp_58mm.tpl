[&QSON]${head.store.name|center:15}[&QSOFF]
[&DWON]${head.store.branch|center:14}[&DWOFF]
${head.store.telephone1|center:24}

${_( '(rpt)Terminal' ) + ': '}${head.store.terminal_no}
${_( '(rpt)Clerk' ) + ': '}${head.clerk_displayname}
${head.start_time} ~
${head.end_time}

${head.title|center:24}
{for item in body}
------------------------
${_( '(rpt)Sequence' ) + ':'|left:24}
${item.Order.sequence|right:24}
${_( '(rpt)Time' ) + ':'|left:24}
${item.Order.time|unixTimeToString|right:24}
${_( '(rpt)Total' ) + ':'|left:24}
${item.Order.total|default:0|viviFormatPrices:true|right:24}
${_( '(rpt)Discount' ) + ':'|left:24}
${item.discount_subtotal|default:0|viviFormatPrices:true|right:24}
${_( '(rpt)Promotion' ) + ':'|left:24}
${item.Order.promotion_subtotal|default:0|viviFormatPrices:true|right:24}
${_( '(rpt)Revalue' ) + ':'|left:24}
${item.Order.revalue_subtotal|default:0|viviFormatPrices:true|right:24}
${_( '(rpt)Surcharge' ) + ':'|left:24}
${item.surcharge_subtotal|default:0|viviFormatPrices:true|right:24}
${_( '(rpt)Add-on Tax' ) + ':'|left:24}
${item.Order.tax_subtotal|default:0|viviFormatPrices:true|right:24}
${_( '(rpt)Included Tax' ) + ':'|left:24}
${item.Order.included_tax_subtotal|default:0|viviFormatPrices:true|right:24}
{for tax in taxList}
${tax.no + ':'|left:24}
${item[ tax.no ]|viviFormatPrices:true|right:24}
{/for}
{/for}
------------------------
${_( '(rpt)Summary' )}
${_( '(rpt)Total' ) + ':'|left:24}
${foot.summary.total|default:0|viviFormatPrices:true|right:24}
${_( '(rpt)Discount' ) + ':'|left:24}
${foot.summary.discount_subtotal|default:0|viviFormatPrices:true|right:24}
${_( '(rpt)Promotion' ) + ':'|left:24}
${foot.summary.promotion_subtotal|default:0|viviFormatPrices:true|right:24}
${_( '(rpt)Revalue' ) + ':'|left:24}
${foot.summary.revalue_subtotal|default:0|viviFormatPrices:true|right:24}
${_( '(rpt)Surcharge' ) + ':'|left:24}
${foot.summary.surcharge_subtotal|default:0|viviFormatPrices:true|right:24}
${_( '(rpt)Add-on Tax' ) + ':'|left:24}
${foot.summary.tax_subtotal|default:0|viviFormatPrices:true|right:24}
${_( '(rpt)Included Tax' ) + ':'|left:24}
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
