[&INIT]
[&QSON]${head.store.name|center:21}[&QSOFF]
[&DWON]${head.store.branch|center:21}[&DWOFF]
${head.store.telephone1|center:42}
${_( '(rpt)Terminal' ) + ': '}${head.store.terminal_no + ' '|left:11}${_( '(rpt)Clerk' ) + ': '}${head.clerk_displayname|left:14}
${head.start_time} ~ ${head.end_time}

${_('(rpt)Condition') + ' - '}
${queryFormLabel.terminal_no_label}${queryFormLabel.terminal_no}
${queryFormLabel.shift_no_label}${queryFormLabel.shift_no}
${queryFormLabel.period_type_label}${queryFormLabel.period_type}
${queryFormLabel.orderstatus_label}${queryFormLabel.orderstatus}
${queryFormLabel.sortby_label}${queryFormLabel.sortby}

[&CR]
${head.title|center:42}
------------------------------------------
${_( '(rpt)Terminal' )|left:8}  ${_( '(rpt)Time' )|left:16}  ${_( '(rpt)Sequence' )|right:14}
--------  ----------  --------------------
{for detail in body}
{eval}
  TrimPath.RoundingPrices = detail.rounding_prices;
  TrimPath.PrecisionPrices = detail.precision_prices;
  TrimPath.RoundingTaxes = detail.rounding_taxes;
  TrimPath.PrecisionTaxes = detail.precision_taxes;
{/eval}
${detail.terminal_no|left:8}  ${detail.time|unixTimeToString|left:16}  ${detail.sequence|left:14}
${'  ' + _( '(rpt)Clerk' ) + ':'|left:16}${detail.service_clerk_displayname|default:''|right:26}
${detail.proceeds_clerk_displayname|default:''|right:42}
${'  ' + _( '(rpt)Sale Period' ) + ':'|left:16}${detail.sale_period|unixTimeToString:'saleperiod'|right:26}
${'  ' + _( '(rpt)Shift' ) + ':'|left:16}${detail.shift_number|default:''|right:26}
${'  ' + _( '(rpt)Status' ) + ':'|left:16}${detail.status_str|right:26}
{if detail.status == -2}
${'  ' + _( '(rpt)Void Clerk' ) + ':'|left:16}${detail.void_clerk_displayname|default:''|right:26}
${'  ' + _( '(rpt)Void Sale Period' ) + ':'|left:16}${detail.void_sale_period|unixTimeToString:'saleperiod'|right:26}
${'  ' + _( '(rpt)Void Shift' ) + ':'|left:16}${detail.void_shift_number|default:''|right:26}
${'  ' + _( '(rpt)Void Time' ) + ':'|left:16}${detail.transaction_voided|unixTimeToString|right:26}
{/if}
${'  ' + _( '(rpt)Invoice Number' ) + ':'|left:16}${detail.invoice_no|default:''|right:26}
${'  ' + _( '(rpt)Invoice Count' ) + ':'|left:16}${detail.invoice_count|default:''|right:26}
${'  ' + _( '(rpt)Gross Sales' ) + ':'|left:16}${detail.item_subtotal|viviFormatPrices:true|right:26}
${'  ' + _( '(rpt)Surcharge' ) + ':'|left:16}${detail.surcharge_subtotal|viviFormatPrices:true|right:26}
${'  ' + _( '(rpt)Discount' ) + ':'|left:16}${detail.discount_subtotal|viviFormatPrices:true|right:26}
${'  ' + _( '(rpt)Promotion' ) + ':'|left:16}${detail.promotion_subtotal|viviFormatPrices:true|right:26}
${'  ' + _( '(rpt)Revalue' ) + ':'|left:16}${detail.revalue_subtotal|viviFormatPrices:true|right:26}
${'  ' + _( '(rpt)Add-on Tax' ) + ':'|left:16}${detail.tax_subtotal|viviFormatTaxes:true|right:26}
${'  ' + _( '(rpt)Total' ) + ':'|left:16}${detail.total|viviFormatPrices:true|right:26}
${'  ' + _( '(rpt)Payment' ) + ':'|left:16}${detail.payment|viviFormatPrices:true|right:26}
------------------------------------------
{/for}
{eval}
  delete TrimPath.RoundingPrices;
  delete TrimPath.PrecisionPrices;
  delete TrimPath.RoundingTaxes;
  delete TrimPath.PrecisionTaxes;
{/eval}
${_( '(rpt)Records Found' ) + ':'|left:30}${foot.foot_datas.rowCount|right:12}
${_( '(rpt)Records Displayed' ) + ':'|left:30}${body.length|right:12}
------------------------------------------
${_( '(rpt)Summary' )}
${'  ' + _( '(rpt)Gross Sales' ) + ':'|left:16}${foot.foot_datas.item_subtotal|viviFormatPrices:true|right:26}
${'  '+ _( '(rpt)Surcharge' ) + ':'|left:16}${foot.foot_datas.surcharge_subtotal|viviFormatPrices:true|right:26}
${'  ' + _( '(rpt)Discount' ) + ':'|left:16}${foot.foot_datas.discount_subtotal|viviFormatPrices:true|right:26}
${'  ' + _( '(rpt)Promotion' ) + ':'|left:16}${foot.foot_datas.promotion_subtotal|viviFormatPrices:true|right:26}
${'  ' + _( '(rpt)Revalue' ) + ':'|left:16}${foot.foot_datas.revalue_subtotal|viviFormatPrices:true|right:26}
${'  ' + _( '(rpt)Add-on Tax' ) + ':'|left:16}${foot.foot_datas.tax_subtotal|viviFormatTaxes:true|right:26}
${'  ' + _( '(rpt)Total' ) + ':'|left:16}${foot.foot_datas.total|viviFormatPrices:true|right:26}
${'  ' + _( '(rpt)Payment' ) + ':'|left:16}${foot.foot_datas.payment_subtotal|viviFormatPrices:true|right:26}
------------------------------------------
${foot.gen_time}
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&PC]
