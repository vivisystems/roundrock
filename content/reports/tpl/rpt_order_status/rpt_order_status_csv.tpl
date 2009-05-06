"${head.store.name}"
"${head.store.branch}"
"${_( '(rpt)Telphone' ) + ':'}","${head.store.telephone1}"
"${_( '(rpt)Terminal' ) + ':'}","${head.store.terminal_no}"
"${_( '(rpt)Clerk' ) + ':'}","${head.clerk_displayname}"
"${_( '(rpt)Printed Time' ) + ':'}","${foot.gen_time}"
"${_( '(rpt)Start' ) + ':'}","${head.start_time}"
"${_( '(rpt)End' ) + ':'}","${head.end_time}"

"${_( '(rpt)Terminal' )}","${_( '(rpt)Service Clerk' )}","${_( '(rpt)Status' )}","${_( '(rpt)Time' )}","${_( '(rpt)Sequence' )}","${_( '(rpt)Invoice Number' )}","${_( '(rpt)Invoice Count' )}","${_( '(rpt)Total' )}","${_( '(rpt)Add-on Tax' )}","${_( '(rpt)Surcharge' )}","${_( '(rpt)Discount' )}","${_( '(rpt)Promotion' )}","${_( '(rpt)Revalue' )}","${_( '(rpt)Net Sales' )}","${_( '(rpt)Payment' )}"
{for detail in body}
{eval}
  TrimPath.RoundingPrices = detail.rounding_prices;
  TrimPath.PrecisionPrices = detail.precision_prices;
  TrimPath.RoundingTaxes = detail.rounding_taxes;
  TrimPath.PrecisionTaxes = detail.precision_taxes;
{/eval}
"${detail.terminal_no}","${detail.service_clerk_displayname}","${detail.status}","${detail.time|unixTimeToString}","${detail.sequence}","${detail.invoice_no}","${detail.invoice_count}","${detail.item_subtotal|viviFormatPrices:true}","${detail.tax_subtotal|viviFormatTaxes:true}","${detail.surcharge_subtotal|viviFormatPrices:true}","${detail.discount_subtotal|viviFormatPrices:true}","${detail.promotion_subtotal|viviFormatPrices:true}","${detail.revalue_subtotal|viviFormatPrices:true}","${detail.total|viviFormatPrices:true}","${detail.payment|viviFormatPrices:true}"
{/for}
{eval}
  delete TrimPath.RoundingPrices;
  delete TrimPath.PrecisionPrices;
  delete TrimPath.RoundingTaxes;
  delete TrimPath.PrecisionTaxes;
{/eval}
${_( '(rpt)Records Found' ) + ':'},${body.length},"","","","","${_( '(rpt)Summary' ) + ':'}","${foot.foot_datas.item_subtotal|viviFormatPrices:true}","${foot.foot_datas.tax_subtotal|viviFormatTaxes:true}","${foot.foot_datas.surcharge_subtotal|viviFormatPrices:true}","${foot.foot_datas.discount_subtotal|viviFormatPrices:true}","${foot.foot_datas.promotion_subtotal|viviFormatPrices:true}","${foot.foot_datas.revalue_subtotal|viviFormatPrices:true}","${foot.foot_datas.total|viviFormatPrices:true}","${foot.foot_datas.payment_subtotal|viviFormatPrices:true}"
