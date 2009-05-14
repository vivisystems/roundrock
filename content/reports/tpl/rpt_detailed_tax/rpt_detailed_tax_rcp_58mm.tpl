[&QSON]${head.store.name|center:15}[&QSOFF]
[&DWON]${head.store.branch|center:14}[&DWOFF]
${head.store.telephone1|center:24}

${_( '(rpt)Terminal' ) + ': '}${head.store.terminal_no}
${_( '(rpt)Clerk' ) + ': '}${head.clerk_displayname}
${head.start_time} ~
${head.end_time}

${head.title|center:24}
{for item in body}
{eval}
  TrimPath.RoundingPrices = item.Order.rounding_prices;
  TrimPath.PrecisionPrices = item.Order.precision_prices;
  TrimPath.RoundingTaxes = item.Order.rounding_taxes;
  TrimPath.PrecisionTaxes = item.Order.precision_taxes;
{/eval}
------------------------
${_( '(rpt)Terminal' ) + ':'|left:24}
${item.Order.terminal_no|right:24}
${_( '(rpt)Time' ) + ':'|left:24}
${item.Order.time|unixTimeToString|right:24}
${_( '(rpt)Sale Period' ) + ':'|left:24}
${item.Order.sale_period|unixTimeToString:'saleperiod'|right:24}
${_( '(rpt)Shift' ) + ':'|left:24}
${item.Order.shift_number|right:24}
${_( '(rpt)Sequence' ) + ':'|left:24}
${item.Order.sequence|right:24}
${_( '(rpt)Invoice Number' ) + ':'|left:24}
${item.Order.invoice_no|default:''|right:24}
${_( '(rpt)Net' ) + ':'|left:24}
${item.Order.total|default:0|viviFormatPrices:true|right:24}
${_( '(rpt)Order Surcharge' ) + ':'|left:24}
${item.surcharge_subtotal|default:0|viviFormatPrices:true|right:24}
${_( '(rpt)Order Discount' ) + ':'|left:24}
${item.discount_subtotal|default:0|viviFormatPrices:true|right:24}
${_( '(rpt)Promotion' ) + ':'|left:24}
${item.Order.promotion_subtotal|default:0|viviFormatPrices:true|right:24}
${_( '(rpt)Revalue' ) + ':'|left:24}
${item.Order.revalue_subtotal|default:0|viviFormatPrices:true|right:24}
${_( '(rpt)Add-on Tax' ) + ':'|left:24}
${item.Order.tax_subtotal|default:0|viviFormatTaxes:true|right:24}
${_( '(rpt)Included Tax' ) + ':'|left:24}
${item.Order.included_tax_subtotal|default:0|viviFormatTaxes:true|right:24}
{for tax in taxList}
{eval}
if (tax.no in item) {
   item_subtotal = item[tax.no].item_subtotal;
   tax_subtotal = item[tax.no].tax_subtotal;
}
else {
   item_subtotal = 0;
   tax_subtotal = 0;
}
{/eval}
${tax.no + ' ' + _( '(rpt)Gross' ) + ':'|left:24}
${item_subtotal|viviFormatPrices:true|right:24}
${tax.no + ':'|left:24}
${tax_subtotal|viviFormatTaxes:true|right:24}
{/for}
{/for}
------------------------
${_( '(rpt)Records Found' ) + ': '|left:16}${GeckoJS.BaseObject.getKeys(body).length|default:0|format:0|right:8}
[&CR]
------------------------
{eval}
  delete TrimPath.RoundingPrices;
  delete TrimPath.PrecisionPrices;
  delete TrimPath.RoundingTaxes;
  delete TrimPath.PrecisionTaxes;
{/eval}
${_( '(rpt)Summary' )}
${_( '(rpt)Total' ) + ':'|left:24}
${foot.summary.total|default:0|viviFormatPrices:true|right:24}
${_( '(rpt)Order Surcharge' ) + ':'|left:24}
${foot.summary.surcharge_subtotal|default:0|viviFormatPrices:true|right:24}
${_( '(rpt)Order Discount' ) + ':'|left:24}
${foot.summary.discount_subtotal|default:0|viviFormatPrices:true|right:24}
${_( '(rpt)Promotion' ) + ':'|left:24}
${foot.summary.promotion_subtotal|default:0|viviFormatPrices:true|right:24}
${_( '(rpt)Revalue' ) + ':'|left:24}
${foot.summary.revalue_subtotal|default:0|viviFormatPrices:true|right:24}
${_( '(rpt)Add-on Tax' ) + ':'|left:24}
${foot.summary.tax_subtotal|default:0|viviFormatTaxes:true|right:24}
${_( '(rpt)Included Tax' ) + ':'|left:24}
${foot.summary.included_tax_subtotal|default:0|viviFormatTaxes:true|right:24}
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
${tax.no + ' ' + _( '(rpt)Gross' ) + ':'|left:24}
${item_subtotal|viviFormatPrices:true|right:24}
${tax.no + ':'|left:24}
${tax_subtotal|viviFormatTaxes:true|right:24}
{/for}
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
