[&INIT]
[&QSON]${head.store.name|center:21}[&QSOFF]
[&DWON]${head.store.branch|center:21}[&DWOFF]
${head.store.telephone1|center:42}
Terminal: ${head.store.terminal_no|left:10} Clerk: ${head.clerk_displayname|left:14}
${head.start_time} ~ ${head.end_time}

${_('(rpt)Condition') + ' - '}
${queryFormLabel.terminal_no_label}${queryFormLabel.terminal_no}
${queryFormLabel.shift_no_label}${queryFormLabel.shift_no}
${queryFormLabel.period_type_label}${queryFormLabel.period_type}
${queryFormLabel.sortby_label}${queryFormLabel.sortby}

${head.title|center:42}
------------------------------------------
${_( '(rpt)Terminal' )|left:8}  ${_( '(rpt)Time' )|left:16}  ${_( '(rpt)Sequence' )|left:14}
--------  ----------  --------------------
{for detail in body}
{eval}
  TrimPath.RoundingPrices = detail.rounding_prices;
  TrimPath.PrecisionPrices = detail.precision_prices;
  TrimPath.RoundingTaxes = detail.rounding_taxes;
  TrimPath.PrecisionTaxes = detail.precision_taxes;
{/eval}
${detail.terminal_no|left:8}  ${detail.time|unixTimeToString|left:16}  ${detail.sequence|left:14}
${'    ' + _( '(rpt)Service Clerk' ) + ': '|left:19}${detail.service_clerk_displayname|default:''|right:22}
${'    ' + _( '(rpt)Proceeds Clerk' ) + ': '|left:19}${detail.proceeds_clerk_displayname|default:''|right:22}
${'    ' + _( '(rpt)Sale Period' ) + ': '|left:19}${detail.sale_period|unixTimeToString:'saleperiod'|right:22}
${'    ' + _( '(rpt)Shift' ) + ': '|left:19}${detail.shift_number|right:22}
${'    ' + _( '(rpt)Invoice Number' ) + ': '|left:19}${detail.invoice_no|default:''|right:22}
${'    ' + _( '(rpt)Number of Guests' ) + ': '|left:19}${detail.no_of_customers|format:0|right:22}
${'    ' + _( '(rpt)Number of Items' ) + ': '|left:19}${detail.qty_subtotal|format:0|right:22}
${'    ' + _( '(rpt)Gross Sales' ) + ': '|left:19}${detail.item_subtotal|default:0|viviFormatPrices:true|right:22}
${'    ' + _( '(rpt)Add-on Tax' ) + ': '|left:19}${detail.tax_subtotal|default:0|viviFormatTaxes:true|right:22}
${'    ' + _( '(rpt)Surcharge' ) + ': '|left:19}${detail.surcharge_subtotal|default:0|viviFormatPrices:true|right:22}
${'    ' + _( '(rpt)Discount' ) + ': '|left:19}${detail.discount_subtotal|default:0|viviFormatPrices:true|right:22}
${'    ' + _( '(rpt)Promotion' ) + ': '|left:19}${detail.promotion_subtotal|default:0|viviFormatPrices:true|right:22}
${'    ' + _( '(rpt)Revalue' ) + ': '|left:19}${detail.revalue_subtotal|default:0|viviFormatPrices:true|right:22}
${'    ' + _( '(rpt)Total' ) + ': '|left:19}${detail.total|default:0|viviFormatPrices:true|right:22}
${'    ' + _( '(rpt)Payment' ) + ': '|left:19}${detail.payment|default:0|viviFormatPrices:true|right:22}
${'    ' + _( '(rpt)Cash' ) + ': '|left:19}${detail.cash|default:0|viviFormatPrices:true|right:22}
${'    ' + _( '(rpt)Check' ) + ': '|left:19}${detail.check|default:0|viviFormatPrices:true|right:22}
${'    ' + _( '(rpt)Credit Card' ) + ': '|left:19}${detail.creditcard|default:0|viviFormatPrices:true|right:22}
${'    ' + _( '(rpt)Coupon' ) + ': '|left:19}${detail.coupon|default:0|viviFormatPrices:true|right:22}
${'    ' + _( '(rpt)Gift Card' ) + ': '|left:19}${detail.giftcard|default:0|viviFormatPrices:true|right:22}
{/for}
{eval}
  delete TrimPath.RoundingPrices;
  delete TrimPath.PrecisionPrices;
  delete TrimPath.RoundingTaxes;
  delete TrimPath.PrecisionTaxes;
{/eval}
------------------------------------------
${_( '(rpt)Records Found' ) + ': '|left:19}${foot.foot_datas.rowCount|default:0|format:0|right:22}
${_( '(rpt)Records Displayed' ) + ': '|left:19}${body.length|default:0|format:0|right:22}
[&CR]
------------------------------------------
${_( '(rpt)Summary' )}
${'    ' + _( '(rpt)Number of Guests' ) + ': '|left:19}${foot.foot_datas.guests|format:0|right:22}
${'    ' + _( '(rpt)Number of Items' ) + ': '|left:19}${foot.foot_datas.items|format:0|right:22}
${'    ' + _( '(rpt)Gross Sales' ) + ': '|left:19}${foot.foot_datas.item_subtotal|default:0|viviFormatPrices:true|right:22}
${'    ' + _( '(rpt)Add-on Tax' ) + ': '|left:19}${foot.foot_datas.tax_subtotal|default:0|viviFormatTaxes:true|right:22}
${'    ' + _( '(rpt)Surcharge' ) + ': '|left:19}${foot.foot_datas.surcharge_subtotal|default:0|viviFormatPrices:true|right:22}
${'    ' + _( '(rpt)Discount' ) + ': '|left:19}${foot.foot_datas.discount_subtotal|default:0|viviFormatPrices:true|right:22}
${'    ' + _( '(rpt)Promotion' ) + ': '|left:19}${foot.foot_datas.promotion_subtotal|default:0|viviFormatPrices:true|right:22}
${'    ' + _( '(rpt)Revalue' ) + ': '|left:19}${foot.foot_datas.revalue_subtotal|default:0|viviFormatPrices:true|right:22}
${'    ' + _( '(rpt)Total' ) + ': '|left:19}${foot.foot_datas.total|default:0|viviFormatPrices:true|right:22}
${'    ' + _( '(rpt)Payment' ) + ': '|left:19}${foot.foot_datas.payment|default:0|viviFormatPrices:true|right:22}
${'    ' + _( '(rpt)Cash' ) + ': '|left:19}${foot.foot_datas.cash|default:0|viviFormatPrices:true|right:22}
${'    ' + _( '(rpt)Check' ) + ': '|left:19}${foot.foot_datas.check|default:0|viviFormatPrices:true|right:22}
${'    ' + _( '(rpt)Credit Card' ) + ': '|left:19}${foot.foot_datas.creditcard|default:0|viviFormatPrices:true|right:22}
${'    ' + _( '(rpt)Coupon' ) + ': '|left:19}${foot.foot_datas.coupon|default:0|viviFormatPrices:true|right:22}
${'    ' + _( '(rpt)Gift Card' ) + ': '|left:19}${foot.foot_datas.giftcard|default:0|viviFormatPrices:true|right:22}
------------------------------------------
${foot.gen_time}
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&PC]
