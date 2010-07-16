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
"${queryFormLabel.sequence_no_label}","${queryFormLabel.sequence_no}"
"${queryFormLabel.sortby_label}","${queryFormLabel.sortby}"

"${_( '(rpt)Terminal' )}","${_( '(rpt)Sale Period' )}","${_( '(rpt)Shift' )}","${_( '(rpt)Time' )}","${_( '(rpt)Sequence' )}","${_( '(rpt)Invoice Number' )}","${_( '(rpt)Number of Guests' )}","${_( '(rpt)Number of Items' )}","${_( '(rpt)Gross Sales' )}","${_( '(rpt)Add-on Tax' )}","${_( '(rpt)Surcharge' )}","${_( '(rpt)Discount' )}","${_( '(rpt)Promotion' )}","${_( '(rpt)Revalue' )}","${_( '(rpt)Total' )}"
{for detail in body}
{eval}
  TrimPath.RoundingPrices = detail.rounding_prices;
  TrimPath.PrecisionPrices = detail.precision_prices;
  TrimPath.RoundingTaxes = detail.rounding_taxes;
  TrimPath.PrecisionTaxes = detail.precision_taxes;
{/eval}
"'${detail.terminal_no}","${detail.sale_period|unixTimeToString:'saleperiod'}","${detail.shift_number}","${detail.Order.time|unixTimeToString}","'${detail.sequence}","'${detail.invoice_no|default:''}","${detail.no_of_customers|format:0}","${detail.qty_subtotal|format:0}","${detail.item_subtotal|default:0|viviFormatPrices:true}","${detail.tax_subtotal|default:0|viviFormatTaxes:true}","${detail.surcharge_subtotal|default:0|viviFormatPrices:true}","${detail.discount_subtotal|default:0|viviFormatPrices:true}","${detail.promotion_subtotal|default:0|viviFormatPrices:true}","${detail.revalue_subtotal|default:0|viviFormatPrices:true}","${detail.total|default:0|viviFormatPrices:true}"
"","","","","${_( '(rpt)Product Number' )}","${_( '(rpt)Product Name' )}","${_( '(rpt)Tax Name' )}","${_( '(rpt)Discount' )}","${_( '(rpt)Surcharge' )}","${_( '(rpt)Price' )}","${_( '(rpt)Quantity' )}","${_( '(rpt)Subtotal' )}"
{for items in detail.OrderItem}
"","","","","'${items.product_no}","'${items.product_name|default:''}","'${items.tax_name|default:''}","${items.current_discount|default:0|viviFormatPrices:true}","${items.current_surcharge|default:0|viviFormatPrices:true}","${items.current_price|default:0|viviFormatPrices:true}","${items.current_qty|default:0}","${items.current_subtotal|default:0|viviFormatPrices:true}"
{/for}
{/for}
{eval}
  delete TrimPath.RoundingPrices;
  delete TrimPath.PrecisionPrices;
  delete TrimPath.RoundingTaxes;
  delete TrimPath.PrecisionTaxes;
{/eval}
"${_( '(rpt)Records Found' ) + ':'}","${body.length|default:0}","","","","${_( '(rpt)Summary' ) + ':'}","${foot.foot_datas.guests|default:0|format:0}","${foot.foot_datas.items|default:0|format:0}","${foot.foot_datas.item_subtotal|viviFormatPrices:true}","${foot.foot_datas.tax_subtotal|viviFormatTaxes:true}","${foot.foot_datas.surcharge_subtotal|viviFormatPrices:true}","${foot.foot_datas.discount_subtotal|viviFormatPrices:true}","${foot.foot_datas.promotion_subtotal|viviFormatPrices:true}","${foot.foot_datas.revalue_subtotal|viviFormatPrices:true}","${foot.foot_datas.payment|viviFormatPrices:true}"
