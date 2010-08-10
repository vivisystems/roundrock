[&INIT]
[&QSON]${head.store.name|center:21}[&QSOFF]
[&DWON]${head.store.branch|center:21}[&DWOFF]
${head.store.telephone1|center:42}
${_( '(rpt)Terminal' ) + ':'} ${head.store.terminal_no + ' '|left:11}${_( '(rpt)Clerk' ) + ': '}${head.clerk_displayname|left:14}
${head.start_time} ~ ${head.end_time}

${_('(rpt)Condition') + ' - '}
${queryFormLabel.terminal_no_label}${queryFormLabel.terminal_no}
${queryFormLabel.shift_no_label}${queryFormLabel.shift_no}
${queryFormLabel.period_type_label}${queryFormLabel.period_type}
${queryFormLabel.sequence_no_label}${queryFormLabel.sequence_no}
${queryFormLabel.sortby_label}${queryFormLabel.sortby}

${head.title|center:42}
{for detail in body}
{eval}
  TrimPath.RoundingPrices = detail.rounding_prices;
  TrimPath.PrecisionPrices = detail.precision_prices;
  TrimPath.RoundingTaxes = detail.rounding_taxes;
  TrimPath.PrecisionTaxes = detail.precision_taxes;
{/eval}
------------------------------------------
${_( '(rpt)Terminal' )|left:14} ${_( '(rpt)Time' )|left:16} ${_( '(rpt)Sequence' )|right:10}
-------- ---------- -------- ------- -----
${detail.terminal_no|left:14} ${detail.Order.time|unixTimeToString|left:16} ${detail.sequence|right:10}
------------------------------------------
${_( '(rpt)Sale Period' ) + ':'|left:15}${detail.sale_period|unixTimeToString:'saleperiod'|right:26}
${_( '(rpt)Shift' ) + ':'|left:15}${detail.shift_number|right:26}
${_( '(rpt)Invoice Number' ) + ':'|left:15}${detail.invoice_no|default:''|right:26}
${_( '(rpt)Number of Guests' ) + ':'|left:15}${detail.no_of_customers|right:26}
${_( '(rpt)Number of Items' ) + ':'|left:15}${detail.qty_subtotal|right:26}
${_( '(rpt)Gross Sales' ) + ':'|left:15}${detail.item_subtotal|default:0|viviFormatPrices:true|right:26}
${_( '(rpt)Add-on Tax' ) + ':'|left:15}${detail.tax_subtotal|default:0|viviFormatTaxes:true|right:26}
${_( '(rpt)Surcharge' ) + ':'|left:15}${detail.surcharge_subtotal|default:0|viviFormatPrices:true|right:26}
${_( '(rpt)Discount' ) + ':'|left:15}${detail.discount_subtotal|default:0|viviFormatPrices:true|right:26}
${_( '(rpt)Promotion' ) + ':'|left:15}${detail.promotion_subtotal|default:0|viviFormatPrices:true|right:26}
${_( '(rpt)Revalue' ) + ':'|left:15}${detail.revalue_subtotal|default:0|viviFormatPrices:true|right:26}
${_( '(rpt)Total' ) + ':'|left:15}${detail.total|default:0|viviFormatPrices:true|right:26}
{for items in detail.OrderItem}
------------------------------------------
${'  ' + _( '(rpt)Product Number' ) + ':'|left:15}${items.product_no|right:26}
${'  ' + _( '(rpt)Product Name' ) + ':'|left:15}${items.product_name|default:''|right:26}
${'  ' + _( '(rpt)Tax Name' ) + ':'|left:15}${items.tax_name|default:''|right:26}
${'  ' + _( '(rpt)Discount' ) + ':'|left:15}${items.current_discount|default:0|viviFormatPrices:true|right:26}
${'  ' + _( '(rpt)Surcharge' ) + ':'|left:15}${items.current_surcharge|default:0|viviFormatPrices:true|right:26}
${'  ' + _( '(rpt)Price' ) + ':'|left:15}${items.current_price|default:0|viviFormatPrices:true|right:26}
${'  ' + _( '(rpt)Quantity' ) + ':'|left:15}${items.current_qty|default:''|right:26}
${'  ' + _( '(rpt)Subtotal' ) + ':'|left:15}${items.current_subtotal|default:0|viviFormatPrices:true|right:26}
{/for}
{/for}
{eval}
  delete TrimPath.RoundingPrices;
  delete TrimPath.PrecisionPrices;
  delete TrimPath.RoundingTaxes;
  delete TrimPath.PrecisionTaxes;
{/eval}
------------------------------------------
${_( '(rpt)Records Found' ) + ': '|left:30}${foot.foot_datas.rowCount|default:0|format:0|right:11}
${_( '(rpt)Records Displayed' ) + ': '|left:30}${body.length|default:0|format:0|right:11}
------------------------------------------
${_( '(rpt)Summary' )}
${'    ' + _( '(rpt)Number of Guests' ) + ': '|left:19}${foot.foot_datas.guests|default:0|format:0|right:22}
${'    ' + _( '(rpt)Number of Items' ) + ': '|left:19}${foot.foot_datas.items|default:0|format:0|right:22}
${'    ' + _( '(rpt)Gross Sales' ) + ': '|left:19}${foot.foot_datas.item_subtotal|default:0|viviFormatPrices:true|right:22}
${'    ' + _( '(rpt)Add-on Tax' ) + ': '|left:19}${foot.foot_datas.tax_subtotal|default:0|viviFormatTaxes:true|right:22}
${'    ' + _( '(rpt)Surcharge' ) + ': '|left:19}${foot.foot_datas.surcharge_subtotal|default:0|viviFormatPrices:true|right:22}
${'    ' + _( '(rpt)Discount' ) + ': '|left:19}${foot.foot_datas.discount_subtotal|default:0|viviFormatPrices:true|right:22}
${'    ' + _( '(rpt)Promotion' ) + ': '|left:19}${foot.foot_datas.promotion_subtotal|default:0|viviFormatPrices:true|right:22}
${'    ' + _( '(rpt)Revalue' ) + ': '|left:19}${foot.foot_datas.revalue_subtotal|default:0|viviFormatPrices:true|right:22}
${'    ' + _( '(rpt)Total' ) + ': '|left:19}${foot.foot_datas.total|default:0|viviFormatPrices:true|right:22}
------------------------------------------
${foot.gen_time}
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&PC]
