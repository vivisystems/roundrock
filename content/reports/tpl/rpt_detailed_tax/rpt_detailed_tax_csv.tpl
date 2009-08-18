"${head.store.name}"
"${head.store.branch}"
"${_( '(rpt)Telephone' ) + ':'}","${head.store.telephone1}"
"${_( '(rpt)Terminal' ) + ':'}","${head.store.terminal_no}"
"${_( '(rpt)Clerk' ) + ':'}","${head.clerk_displayname}"
"${_( '(rpt)Printed Time' ) + ':'}","${foot.gen_time}"
"${_( '(rpt)Start Time' ) + ':'}","${head.start_time}"
"${_( '(rpt)End Time' ) + ':'}","${head.end_time}"

"${_( '(rpt)Terminal' )}","${_( '(rpt)Sale Period' )}","${_( '(rpt)Shift' )}","${_( '(rpt)Time' )}","${_( '(rpt)Sequence' )}","${_( '(rpt)Invoice Number' )}","${_( '(rpt)Net Sales' )}","${_( '(rpt)Order Surcharge' )}","${_( '(rpt)Order Discount' )}","${_( '(rpt)Promotion' )}","${_( '(rpt)Revalue' )}","${_( '(rpt)Add-on Tax' )}","${_( '(rpt)Included Tax' )}"{for tax in taxList},"${tax.no + ' ' + _( '(rpt)Gross Sales' )}","${tax.no}"{/for}
{for item in body}
{eval}
  TrimPath.RoundingPrices = item.Order.rounding_prices;
  TrimPath.PrecisionPrices = item.Order.precision_prices;
  TrimPath.RoundingTaxes = item.Order.rounding_taxes;
  TrimPath.PrecisionTaxes = item.Order.precision_taxes;
{/eval}
,""
"'${item.Order.terminal_no}","'${item.Order.sale_period|unixTimeToString:'saleperiod'}","'${item.Order.shift_number}","'${item.Order.time|unixTimeToString}","'${item.Order.sequence}","'${item.Order.invoice_no|default:''}","${item.Order.total|default:0|viviFormatPrices:true}","${item.surcharge_subtotal|default:0|viviFormatPrices:true}","${item.discount_subtotal|default:0|viviFormatPrices:true}","${item.Order.promotion_subtotal|default:0|viviFormatPrices:true}","${item.Order.revalue_subtotal|default:0|viviFormatPrices:true}","${item.Order.tax_subtotal|default:0|viviFormatTaxes:true}","${item.Order.included_tax_subtotal|default:0|viviFormatTaxes:true}"{for tax in taxList}
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
,"${item_subtotal|default:0|viviFormatPrices:true}","${tax_subtotal|default:0|viviFormatTaxes:true}"{/for}
{/for}
{eval}
  delete TrimPath.RoundingPrices;
  delete TrimPath.PrecisionPrices;
  delete TrimPath.RoundingTaxes;
  delete TrimPath.PrecisionTaxes;
{/eval}
,""
"${_( '(rpt)Records Found' )}","${GeckoJS.BaseObject.getKeys(body).length|format:0}","","","","${_( '(rpt)Summary' ) + ':'}","${foot.summary.total|default:0|viviFormatPrices:true}","${foot.summary.surcharge_subtotal|default:0|viviFormatPrices:true}","${foot.summary.discount_subtotal|default:0|viviFormatPrices:true}","${foot.summary.promotion_subtotal|default:0|viviFormatPrices:true}","${foot.summary.revalue_subtotal|default:0|viviFormatPrices:true}","${foot.summary.tax_subtotal|default:0|viviFormatTaxes:true}","${foot.summary.included_tax_subtotal|default:0|viviFormatTaxes:true}"{for tax in taxList}
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
,"${item_subtotal|default:0|viviFormatPrices:true}","${tax_subtotal|default:0|viviFormatTaxes:true}"{/for}
