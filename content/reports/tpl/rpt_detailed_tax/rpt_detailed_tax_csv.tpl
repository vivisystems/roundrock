"${head.store.name}"
"${head.store.branch}"
"${_( '(rpt)Telphone' ) + ':'}","${head.store.telephone1}"
"${_( '(rpt)Terminal' ) + ':'}","${head.store.terminal_no}"
"${_( '(rpt)Clerk' ) + ':'}","${head.clerk_displayname}"
"${_( '(rpt)Printed Time' ) + ':'}","${foot.gen_time}"
"${_( '(rpt)Start' ) + ':'}","${head.start_time}"
"${_( '(rpt)End' ) + ':'}","${head.end_time}"

"${_( '(rpt)Sequence' )}","${_( '(rpt)Total' )}","${_( '(rpt)Discount' )}","${_( '(rpt)Surcharge' )}","${_( '(rpt)Add-on Tax' )}","${_( '(rpt)Included Tax' )}"{for tax in taxList},"${tax.no}"{/for}
{for item in body}
,""
"${item.Order.sequence}","${item.Order.total|default:0|viviFormatPrices:true}","${item.discount_subtotal|default:0|viviFormatPrices:true}","${item.surcharge_subtotal|default:0|viviFormatPrices:true}","${item.Order.tax_subtotal|default:0|viviFormatPrices:true}","${item.Order.included_tax_subtotal|default:0|viviFormatPrices:true}"{for tax in taxList},"${item[ tax.no ]|viviFormatPrices:true}"{/for}
{/for}
,""
"${_( '(rpt)Summary' ) + ':'}","${foot.summary.total|default:0|viviFormatPrices:true}","${foot.summary.discount_subtotal|default:0|viviFormatPrices:true}","${foot.summary.surcharge_subtotal|default:0|viviFormatPrices:true}","${foot.summary.tax_subtotal|default:0|viviFormatPrices:true}","${foot.summary.included_tax_subtotal|default:0|viviFormatPrices:true}"{for tax in taxList},"${foot.summary[ tax.no ]|viviFormatPrices:true}"{/for}
