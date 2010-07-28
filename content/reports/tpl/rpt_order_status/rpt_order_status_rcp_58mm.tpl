[&INIT]
[&QSON]${head.store.name|center:12}[&QSOFF]
[&DWON]${head.store.branch|center:12}[&DWOFF]
${head.store.telephone1|center:24}
[&CR]
${_( '(rpt)Terminal' ) + ': '}${head.store.terminal_no}
${_( '(rpt)Clerk' ) + ': '}${head.clerk_displayname}
${head.start_time} ~
${head.end_time}

${_('(rpt)Condition') + ' - '}
${queryFormLabel.terminal_no_label}${queryFormLabel.terminal_no}
${queryFormLabel.shift_no_label}${queryFormLabel.shift_no}
${queryFormLabel.period_type_label}${queryFormLabel.period_type}
${queryFormLabel.orderstatus_label}${queryFormLabel.orderstatus}
${queryFormLabel.sortby_label}${queryFormLabel.sortby}

[&CR]
${head.title|center:24}
{for detail in body}
{eval}
  TrimPath.RoundingPrices = detail.rounding_prices;
  TrimPath.PrecisionPrices = detail.precision_prices;
  TrimPath.RoundingTaxes = detail.rounding_taxes;
  TrimPath.PrecisionTaxes = detail.precision_taxes;
{/eval}
------------------------
${_( '(rpt)Terminal' ) + ':'}
${detail.terminal_no|right:24}
${_( '(rpt)Clerk' ) + ':'}
  ${detail.service_clerk_displayname|right:22}
  ${detail.proceeds_clerk_displayname|right:22}
${_( '(rpt)Sale Period' ) + ':'}
${detail.sale_period|unixTimeToString:'saleperiod'|right:24}
${_( '(rpt)Shift' ) + ':'}
${detail.shift_number|default:''|right:24}
${_( '(rpt)Time' ) + ':'}
${detail.time|unixTimeToString|right:24}
${_( '(rpt)Sequence' ) + ':'}
${detail.sequence|right:24}
${_( '(rpt)Status' ) + ':'}
${detail.status_str|right:24}
{if detail.status == -2}
${_( '(rpt)Void Clerk' ) + ':'}
  ${detail.void_clerk_displayname|right:22}
${_( '(rpt)Void Sale Period' ) + ':'}
${detail.void_sale_period|unixTimeToString:'saleperiod'|right:24}
${_( '(rpt)Void Shift' ) + ':'}
${detail.void_shift_number|default:''|right:24}
${_( '(rpt)Void Time' ) + ':'}
${detail.transaction_voided|unixTimeToString|right:24}
{/if}
${_( '(rpt)Invoice Number' ) + ':'}
${detail.invoice_no|right:24}
${_( '(rpt)Invoice Count' ) + ':'}
${detail.invoice_count|right:24}
${_( '(rpt)Gross Sales' ) + ':'}
${detail.item_subtotal|viviFormatPrices:true|right:24}
${_( '(rpt)Surcharge' ) + ':'}
${detail.surcharge_subtotal|viviFormatPrices:true|right:24}
${_( '(rpt)Discount' ) + ':'}
${detail.discount_subtotal|viviFormatPrices:true|right:24}
${_( '(rpt)Promotion' ) + ':'}
${detail.promotion_subtotal|viviFormatPrices:true|right:24}
${_( '(rpt)Revalue' ) + ':'}
${detail.revalue_subtotal|viviFormatPrices:true|right:24}
${_( '(rpt)Add-on Tax' ) + ':'}
${detail.tax_subtotal|viviFormatTaxes:true|right:24}
${_( '(rpt)Total' ) + ':'}
${detail.total|viviFormatPrices:true|right:24}
${_( '(rpt)Payment' ) + ':'}
${detail.payment|viviFormatPrices:true|right:24}
{/for}
{eval}
  delete TrimPath.RoundingPrices;
  delete TrimPath.PrecisionPrices;
  delete TrimPath.RoundingTaxes;
  delete TrimPath.PrecisionTaxes;
{/eval}
------------------------
${_( '(rpt)Records Found' ) + ':'|left:24}
${foot.foot_datas.rowCount|format:0|right:24}
${_( '(rpt)Records Displayed' ) + ':'|left:24}
${body.length|format:0|right:24}
------------------------
${_( '(rpt)Summary' )}
${_( '(rpt)Gross Sales' ) + ':'}
${foot.foot_datas.item_subtotal|viviFormatPrices:true|right:24}
${_( '(rpt)Surcharge' ) + ':'}
${foot.foot_datas.surcharge_subtotal|viviFormatPrices:true|right:24}
${_( '(rpt)Discount' ) + ':'}
${foot.foot_datas.discount_subtotal|viviFormatPrices:true|right:24}
${_( '(rpt)Promotion' ) + ':'}
${foot.foot_datas.promotion_subtotal|viviFormatPrices:true|right:24}
${_( '(rpt)Revalue' ) + ':'}
${foot.foot_datas.revalue_subtotal|viviFormatPrices:true|right:24}
${_( '(rpt)Add-on Tax' ) + ':'}
${foot.foot_datas.tax_subtotal|viviFormatTaxes:true|right:24}
${_( '(rpt)Total' ) + ':'}
${foot.foot_datas.total|viviFormatPrices:true|right:24}
${_( '(rpt)Payment' ) + ':'}
${foot.foot_datas.payment_subtotal|viviFormatPrices:true|right:24}
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
