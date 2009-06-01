[&QSON]${head.store.name|center:15}[&QSOFF]
[&DWON]${head.store.branch|center:15}[&DWOFF]
${head.store.telephone1|center:42}
${_( '(rpt)Terminal' ) + ': '}${head.store.terminal_no + ' '|left:10}${_( '(rpt)Clerk' ) + ': '}${head.clerk_displayname|left:14}
${head.start_time} ~ ${head.end_time}

${head.title|center:42}
{for item in body}
{eval}
  TrimPath.RoundingPrices = item.Order.rounding_prices;
  TrimPath.PrecisionPrices = item.Order.precision_prices;
  TrimPath.RoundingTaxes = item.Order.rounding_taxes;
  TrimPath.PrecisionTaxes = item.Order.precision_taxes;
{/eval}
------------------------------------------
${_( '(rpt)Terminal' ) + ':'|left:14}${item.Order.terminal_no|right:28}
${_( '(rpt)Sale Period' ) + ':'|left:14}${item.Order.sale_period|unixTimeToString:'saleperiod'|right:28}
${_( '(rpt)Shift' ) + ':'|left:14}${item.Order.shift_number|right:28}
${_( '(rpt)Time' ) + ':'|left:14}${item.Order.time|unixTimeToString|right:28}
${_( '(rpt)Sequence' ) + ':'|left:14}${item.Order.sequence|right:28}
${_( '(rpt)Invoice Number' ) + ':'|left:14}${item.Order.invoice_no|default:''|right:28}
${_( '(rpt)Net Sales' ) + ':'|left:14}${item.Order.total|default:0|viviFormatPrices:true|right:28}
${_( '(rpt)Order Surcharge' ) + ':'|left:14}${item.surcharge_subtotal|default:0|viviFormatPrices:true|right:28}
${_( '(rpt)Order Discount' ) + ':'|left:14}${item.discount_subtotal|default:0|viviFormatPrices:true|right:28}
${_( '(rpt)Promotion' ) + ':'|left:14}${item.Order.promotion_subtotal|default:0|viviFormatPrices:true|right:28}
${_( '(rpt)Revalue' ) + ':'|left:14}${item.Order.revalue_subtotal|default:0|viviFormatPrices:true|right:28}
${_( '(rpt)Add-on Tax' ) + ':'|left:14}${item.Order.tax_subtotal|default:0|viviFormatTaxes:true|right:28}
${_( '(rpt)Included Tax' ) + ':'|left:14}${item.Order.included_tax_subtotal|default:0|viviFormatTaxes:true|right:28}
{for tax in taxList}
{eval}
if (tax.no in foot.summary) {
   item_subtotal = foot.summary[tax.no].item_subtotal;
   tax_subtotal = foot.summary[tax.no].tax_subtotal;
}
else {
   item_subtotal = 0;
   tax_subtotal = 0;
}
{/eval}
${tax.no + ' ' + _( '(rpt)Gross Sales') + ':'|left:14}${item_subtotal|viviFormatPrices:true|right:28}
${tax.no + ':'|left:14}${tax_subtotal|viviFormatTaxes:true|right:28}
{/for}
{/for}
------------------------------------------
${_( '(rpt)Records Found' ) + ': '|left:19}${GeckoJS.BaseObject.getKeys(body).length|default:0|format:0|right:22}
[&CR]
------------------------------------------
${_( '(rpt)Summary' )}
${_( '(rpt)Net Sales' ) + ':'|left:14}${foot.summary.total|default:0|viviFormatPrices:true|right:28}
${_( '(rpt)Order Surcharge' ) + ':'|left:14}${foot.summary.surcharge_subtotal|default:0|viviFormatPrices:true|right:28}
${_( '(rpt)Order Discount' ) + ':'|left:14}${foot.summary.discount_subtotal|default:0|viviFormatPrices:true|right:28}
${_( '(rpt)Promotion' ) + ':'|left:14}${foot.summary.promotion_subtotal|default:0|viviFormatPrices:true|right:28}
${_( '(rpt)Revalue' ) + ':'|left:14}${foot.summary.revalue_subtotal|default:0|viviFormatPrices:true|right:28}
${_( '(rpt)Add-on Tax' ) + ':'|left:14}${foot.summary.tax_subtotal|default:0|viviFormatTaxes:true|right:28}
${_( '(rpt)Included Tax' ) + ':'|left:14}${foot.summary.included_tax_subtotal|default:0|viviFormatTaxes:true|right:28}
{for tax in taxList}
{eval}
if (tax.no in foot.summary) {
   item_subtotal = foot.summary[tax.no].item_subtotal;
   tax_subtotal = foot.summary[tax.no].tax_subtotal;
}
else {
   item_subtotal = 0;
   tax_subtotal = 0;
}
{/eval}
${tax.no + ' ' + _( '(rpt)Gross Sales') + ':'|left:14}${item_subtotal|viviFormatPrices:true|right:28}
${tax.no + ':'|left:14}${tax_subtotal|viviFormatTaxes:true|right:28}
{/for}
------------------------------------------
${foot.gen_time}
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&PC]
