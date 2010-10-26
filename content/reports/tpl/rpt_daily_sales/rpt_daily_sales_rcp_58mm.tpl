[&INIT]
[&QSON]${head.store.name|center:12}[&QSOFF]
[&DWON]${head.store.branch|center:12}[&DWOFF]
${head.store.telephone1|center:24}

${_( '(rpt)Terminal' ) + ': '}${head.store.terminal_no}
${_( '(rpt)Clerk' ) + ': '}${head.clerk_displayname}
${head.start_time} ~
${head.end_time}

${_('(rpt)Condition') + ' - '}
${queryFormLabel.terminal_no_label}${queryFormLabel.terminal_no}
${queryFormLabel.shift_no_label}${queryFormLabel.shift_no}
${queryFormLabel.period_type_label}${queryFormLabel.period_type}
${queryFormLabel.sortby_label}${queryFormLabel.sortby}
${queryFormLabel.database_label}${queryFormLabel.database}

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
${_( '(rpt)Service Clerk' ) + ':'}
${detail.service_clerk_displayname|default:''|right:24}
${_( '(rpt)Proceeds Clerk' ) + ':'}
${detail.proceeds_clerk_displayname|default:''|right:24}
${_( '(rpt)Sale Period' ) + ':'}
${detail.sale_period|unixTimeToString:'saleperiod'|right:24}
${_( '(rpt)Shift' ) + ':'}
${detail.shift_number|right:24}
${_( '(rpt)Time' ) + ':'}
${detail.time|unixTimeToString|right:24}
${_( '(rpt)Sequence' ) + ':'}
${detail.sequence|right:24}
${_( '(rpt)Invoice Number' ) + ':'}
${detail.invoice_no|default:''|right:24}
${_( '(rpt)Number of Guests' ) + ':'}
${detail.no_of_customers|format:0|right:24}
${_( '(rpt)Number of Items' ) + ':'}
${detail.qty_subtotal|format:0|right:24}
${_( '(rpt)Gross Sales' ) + ':'}
${detail.item_subtotal|default:0|viviFormatPrices:true|right:24}
${_( '(rpt)Add-on Tax' ) + ':'}
${detail.tax_subtotal|default:0|viviFormatTaxes:true|right:24}
${_( '(rpt)Surcharge' ) + ':'}
${detail.surcharge_subtotal|default:0|viviFormatPrices:true|right:24}
${_( '(rpt)Discount' ) + ':'}
${detail.discount_subtotal|default:0|viviFormatPrices:true|right:24}
${_( '(rpt)Promotion' ) + ':'}
${detail.promotion_subtotal|default:0|viviFormatPrices:true|right:24}
${_( '(rpt)Revalue' ) + ':'}
${detail.revalue_subtotal|default:0|viviFormatPrices:true|right:24}
${_( '(rpt)Total' ) + ':'}
${detail.total|default:0|viviFormatPrices:true|right:24}
${_( '(rpt)Payment' ) + ':'}
${detail.payment|default:0|viviFormatPrices:true|right:24}
${_( '(rpt)Cash' ) + ':'}
${detail.cash|default:0|viviFormatPrices:true|right:24}
${_( '(rpt)Check' ) + ':'}
${detail.check|default:0|viviFormatPrices:true|right:24}
${_( '(rpt)Credit Card' ) + ':'}
${detail.creditcard|default:0|viviFormatPrices:true|right:24}
${_( '(rpt)Coupon' ) + ':'}
${detail.coupon|default:0|viviFormatPrices:true|right:24}
${_( '(rpt)Gift Card' ) + ':'}
${detail.giftcard|default:0|viviFormatPrices:true|right:24}
{/for}
{eval}
  delete TrimPath.RoundingPrices;
  delete TrimPath.PrecisionPrices;
  delete TrimPath.RoundingTaxes;
  delete TrimPath.PrecisionTaxes;
{/eval}
------------------------
${_( '(rpt)Records Found' ) + ':'|left:24}
${foot.foot_datas.rowCount|default:0|format:0|right:24}
${_( '(rpt)Records Displayed' ) + ':'|left:24}
${body.length|default:0|format:0|right:24}
[&CR]
------------------------
${_( '(rpt)Summary' )}
${_( '(rpt)Number of Guests' ) + ':'}
${foot.foot_datas.guests|format:0|right:24}
${_( '(rpt)Number of Items' ) + ':'}
${foot.foot_datas.items|format:0|right:24}
${_( '(rpt)Gross Sales' ) + ':'}
${foot.foot_datas.item_subtotal|default:0|viviFormatPrices:true|right:24}
${_( '(rpt)Add-on Tax' ) + ':'}
${foot.foot_datas.tax_subtotal|default:0|viviFormatTaxes:true|right:24}
${_( '(rpt)Surcharge' ) + ':'}
${foot.foot_datas.surcharge_subtotal|default:0|viviFormatPrices:true|right:24}
${_( '(rpt)Discount' ) + ':'}
${foot.foot_datas.discount_subtotal|default:0|viviFormatPrices:true|right:24}
${_( '(rpt)Promotion' ) + ':'}
${foot.foot_datas.promotion_subtotal|default:0|viviFormatPrices:true|right:24}
${_( '(rpt)Revalue' ) + ':'}
${foot.foot_datas.revalue_subtotal|default:0|viviFormatPrices:true|right:24}
${_( '(rpt)Total' ) + ':'}
${foot.foot_datas.total|default:0|viviFormatPrices:true|right:24}
${_( '(rpt)Payment' ) + ':'}
${foot.foot_datas.payment|default:0|viviFormatPrices:true|right:24}
${_( '(rpt)Cash' ) + ':'}
${foot.foot_datas.cash|default:0|viviFormatPrices:true|right:24}
${_( '(rpt)Check' ) + ':'}
${foot.foot_datas.check|default:0|viviFormatPrices:true|right:24}
${_( '(rpt)Credit Card' ) + ':'}
${foot.foot_datas.creditcard|default:0|viviFormatPrices:true|right:24}
${_( '(rpt)Coupon' ) + ':'}
${foot.foot_datas.coupon|default:0|viviFormatPrices:true|right:24}
${_( '(rpt)Gift Card' ) + ':'}
${foot.foot_datas.giftcard|default:0|viviFormatPrices:true|right:24}
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
