"${head.title}"

"${head.store.name}"
"${head.store.branch}"
"${_( '(rpt)Telephone' ) + ':'}","${head.store.telephone1}"
"${_( '(rpt)Terminal' ) + ':'}","${head.store.terminal_no}"
"${_( '(rpt)Clerk' ) + ':'}","${head.clerk_displayname}"
"${_( '(rpt)Printed Time' ) + ':'}","${foot.gen_time}"
"${_( '(rpt)Start Time' ) + ':'}","${head.start_time}"
"${_( '(rpt)End Time' ) + ':'}","${head.end_time}"
"${_('(rpt)Condition') + ' - '}"
"${queryFormLabel.terminal_no_label}","${queryFormLabel.terminal_no}"
"${queryFormLabel.shift_no_label}","${queryFormLabel.shift_no}"
"${queryFormLabel.period_type_label}","${queryFormLabel.period_type}"
"${queryFormLabel.orderstatus_label}","${queryFormLabel.orderstatus}"
"${queryFormLabel.sortby_label}","${queryFormLabel.sortby}"
"${queryFormLabel.database_label}","${queryFormLabel.database}"

"${_( '(rpt)Terminal' )}","${_( '(rpt)Clerk' )}","${_( '(rpt)Sale Period')}","${_( '(rpt)Shift' )}","${_( '(rpt)Time' )}","${_( '(rpt)Sequence' )}","${_( '(rpt)Status' )}","${_( '(rpt)Void Clerk' )}","${_( '(rpt)Void Sale Period' )}","${_( '(rpt)Void Shift' )}","${_( '(rpt)Void Time' )}","${_( '(rpt)Invoice Number' )}","${_( '(rpt)Invoice Count' )}","${_( '(rpt)Gross Sales' )}","${_( '(rpt)Surcharge' )}","${_( '(rpt)Discount' )}","${_( '(rpt)Promotion' )}","${_( '(rpt)Revalue' )}","${_( '(rpt)Add-on Tax' )}","${_( '(rpt)Total' )}","${_( '(rpt)Payment' )}"
{for detail in body}
{eval}
  TrimPath.RoundingPrices = detail.rounding_prices;
  TrimPath.PrecisionPrices = detail.precision_prices;
  TrimPath.RoundingTaxes = detail.rounding_taxes;
  TrimPath.PrecisionTaxes = detail.precision_taxes;
{/eval}
"'${detail.terminal_no}","'${detail.service_clerk_displayname|default:''}/${detail.proceeds_clerk_displayname|default:''}","${detail.sale_period|unixTimeToString:'saleperiod'}","${detail.shift_number}","${detail.time|unixTimeToString}","'${detail.sequence}","'${detail.status_str}",{if detail.status == -2}"${detail.void_clerk_displayname|default:''}","${detail.void_sale_period|unixTimeToString:'saleperiod'}","${detail.void_shift_number|default:''}","${detail.transaction_voided|unixTimeToString}",{else}"","","","",{/if}"'${detail.invoice_no|default:''}","'${detail.invoice_count|default:''}","${detail.item_subtotal|viviFormatPrices:true}","${detail.surcharge_subtotal|viviFormatPrices:true}","${detail.discount_subtotal|viviFormatPrices:true}","${detail.promotion_subtotal|viviFormatPrices:true}","${detail.revalue_subtotal|viviFormatPrices:true}","${detail.tax_subtotal|viviFormatTaxes:true}","${detail.total|viviFormatPrices:true}","${detail.payment|viviFormatPrices:true}"
{/for}
{eval}
  delete TrimPath.RoundingPrices;
  delete TrimPath.PrecisionPrices;
  delete TrimPath.RoundingTaxes;
  delete TrimPath.PrecisionTaxes;
{/eval}
"${_( '(rpt)Records Found' ) + ':'}","${body.length}","","","","","","","","","","","${_( '(rpt)Summary' ) + ':'}","${foot.foot_datas.item_subtotal|viviFormatPrices:true}","${foot.foot_datas.surcharge_subtotal|viviFormatPrices:true}","${foot.foot_datas.discount_subtotal|viviFormatPrices:true}","${foot.foot_datas.promotion_subtotal|viviFormatPrices:true}","${foot.foot_datas.revalue_subtotal|viviFormatPrices:true}","${foot.foot_datas.tax_subtotal|viviFormatTaxes:true}","${foot.foot_datas.total|viviFormatPrices:true}","${foot.foot_datas.payment_subtotal|viviFormatPrices:true}"
