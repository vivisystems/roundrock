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
"${queryFormLabel.sortby_label}","${queryFormLabel.sortby}"

"${_( '(rpt)Terminal' )}","${_( '(rpt)Service Clerk' )}","${_( '(rpt)Proceeds Clerk' )}","${_( '(rpt)Sale Period' )}","${_( '(rpt)Shift' )}","${_( '(rpt)Time' )}","${_( '(rpt)Sequence' )}","${_( '(rpt)Invoice Number' )}","${_( '(rpt)Number of Guests' )}","${_( '(rpt)Number of Items' )}","${_( '(rpt)Gross Sales' )}","${_( '(rpt)Add-on Tax' )}","${_( '(rpt)Surcharge' )}","${_( '(rpt)Discount' )}","${_( '(rpt)Promotion' )}","${_( '(rpt)Revalue' )}","${_( '(rpt)Total' )}","${_( '(rpt)Payment' )}","${_( '(rpt)Cash' )}","${_( '(rpt)Check' )}","${_( '(rpt)Credit Card' )}","${_( '(rpt)Coupon' )}","${_( '(rpt)Gift Card' )}"
{for detail in body}
{eval}
  TrimPath.RoundingPrices = detail.rounding_prices;
  TrimPath.PrecisionPrices = detail.precision_prices;
  TrimPath.RoundingTaxes = detail.rounding_taxes;
  TrimPath.PrecisionTaxes = detail.precision_taxes;
{/eval}
"'${detail.terminal_no}","'${detail.service_clerk_displayname|default:''}","'${detail.proceeds_clerk_displayname|default:''}","${detail.sale_period|unixTimeToString:'saleperiod'}","${detail.shift_number}","${detail.time|unixTimeToString}","'${detail.sequence}","'${detail.invoice_no|default:''}","${detail.no_of_customers}","${detail.qty_subtotal}","${detail.item_subtotal|default:0|viviFormatPrices:true}","${detail.tax_subtotal|default:0|viviFormatTaxes:true}","${detail.surcharge_subtotal|default:0|viviFormatPrices:true}","${detail.discount_subtotal|default:0|viviFormatPrices:true}","${detail.promotion_subtotal|default:0|viviFormatPrices:true}","${detail.revalue_subtotal|default:0|viviFormatPrices:true}","${detail.total|default:0|viviFormatPrices:true}","${detail.payment|default:0|viviFormatPrices:true}","${detail.cash|default:0|viviFormatPrices:true}","${detail.check|default:0|viviFormatPrices:true}","${detail.creditcard|default:0|viviFormatPrices:true}","${detail.coupon|default:0|viviFormatPrices:true}","${detail.giftcard|default:0|viviFormatPrices:true}"
{/for}
{eval}
  delete TrimPath.RoundingPrices;
  delete TrimPath.PrecisionPrices;
  delete TrimPath.RoundingTaxes;
  delete TrimPath.PrecisionTaxes;
{/eval}
"${_( '(rpt)Records Found' ) + ':'}","${body.length}","","","","","","${_( '(rpt)Summary' ) + ':'}","${foot.foot_datas.guests}","${foot.foot_datas.items}","${foot.foot_datas.item_subtotal|default:0|viviFormatPrices:true}","${foot.foot_datas.tax_subtotal|default:0|viviFormatTaxes:true}","${foot.foot_datas.surcharge_subtotal|default:0|viviFormatPrices:true}","${foot.foot_datas.discount_subtotal|default:0|viviFormatPrices:true}","${foot.foot_datas.promotion_subtotal|default:0|viviFormatPrices:true}","${foot.foot_datas.revalue_subtotal|default:0|viviFormatPrices:true}","${foot.foot_datas.total|default:0|viviFormatPrices:true}","${foot.foot_datas.payment|default:0|viviFormatPrices:true}","${foot.foot_datas.cash|default:0|viviFormatPrices:true}","${foot.foot_datas.check|default:0|viviFormatPrices:true}","${foot.foot_datas.creditcard|default:0|viviFormatPrices:true}","${foot.foot_datas.coupon|default:0|viviFormatPrices:true}","${foot.foot_datas.giftcard|default:0|viviFormatPrices:true}"
