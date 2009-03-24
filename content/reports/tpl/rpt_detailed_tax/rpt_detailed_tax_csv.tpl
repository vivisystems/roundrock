"${head.store.name}"
"${head.store.branch}"
"${_( 'Telphone' ) + ':'}","'${head.store.telephone1}"
"${_( 'Terminal' ) + ':'}","'${head.store.terminal_no}"
"${_( 'Clerk' ) + ':'}","'${head.clerk_displayname}"
"${_( 'Printed Time' ) + ':'}","${foot.gen_time}"
"${_( 'Start' ) + ':'}","${head.start_time}"
"${_( 'End' ) + ':'}","${head.end_time}"

"${_( 'Sequence' )}","${_( 'Total' )}","${_( 'Discount' )}","${_( 'Surcharge' )}","${_( 'Add-on Tax' )}","${_( 'Included Tax' )}"{for tax in taxList},"${tax.no}"{/for}
{for item in body}
,""
"${item.Order.sequence}","${item.Order.total|default:0|viviFormatPrices:true}","${item.discount_subtotal|default:0|viviFormatPrices:true}","${item.surcharge_subtotal|default:0|viviFormatPrices:true}","${item.Order.tax_subtotal|default:0|viviFormatPrices:true}","${item.Order.included_tax_subtotal|default:0|viviFormatPrices:true}"{for tax in taxList},"${item[ tax.no ]|viviFormatPrices:true}"{/for}
{/for}
,""
"${_( 'Summary' ) + ':'}","${foot.summary.total|default:0|viviFormatPrices:true}","${foot.summary.discount_subtotal|default:0|viviFormatPrices:true}","${foot.summary.surcharge_subtotal|default:0|viviFormatPrices:true}","${foot.summary.tax_subtotal|default:0|viviFormatPrices:true}","${foot.summary.included_tax_subtotal|default:0|viviFormatPrices:true}"{for tax in taxList},"${foot.summary[ tax.no ]|viviFormatPrices:true}"{/for}
