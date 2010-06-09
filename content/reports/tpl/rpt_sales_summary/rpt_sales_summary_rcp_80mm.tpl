[&INIT]
[&QSON]${head.store.name|center:21}[&QSOFF]
[&DWON]${head.store.branch|center:21}[&DWOFF]
${head.store.telephone1|center:42}
${_( '(rpt)Terminal' ) + ': '}${head.store.terminal_no + ' '|left:11}${_( '(rpt)Clerk' ) + ': '}${head.clerk_displayname|left:14}
${head.start_time} ~ ${head.end_time}

${head.title|center:42}
${head.subtitle|center:42}
------------------------------------------
${_( '(rpt)Sales Overview' )}
${'  ' + _( '(rpt)Gross Sales' ) + ':'|left:26}${body.sales_summary.GrossSales|default:0|viviFormatPrices:true|right:16}
${'  ' + _( '(rpt)Add-on Tax' ) + ':'|left:26}${body.sales_summary.TaxSubtotal|default:0|viviFormatTaxes:true|right:16}
${'  ' + _( '(rpt)Surcharge' ) + ':'|left:26}${body.sales_summary.SurchargeSubtotal|default:0|viviFormatPrices:true|right:16}
${'  ' + _( '(rpt)Discount' ) + ':'|left:26}${body.sales_summary.DiscountSubtotal|default:0|viviFormatPrices:true|right:16}
${'  ' + _( '(rpt)Promotion' ) + ':'|left:26}${body.sales_summary.PromotionSubtotal|default:0|viviFormatPrices:true|right:16}
${'  ' + _( '(rpt)Revalue' ) + ':'|left:26}${body.sales_summary.RevalueSubtotal|default:0|viviFormatPrices:true|right:16}
${'  ' + _( '(rpt)Total' ) + ':'|left:26}${body.sales_summary.NetSales|default:0|viviFormatPrices:true|right:16}
------------------------------------------
${_( '(rpt)Sales Summary' )}
${'  ' + _( '(rpt)Number of Orders' ) + ':'|left:26}${body.sales_summary.OrderNum|default:0|format:0|right:16}
${'  ' + _( '(rpt)Number of Guests' ) + ':'|left:26}${body.sales_summary.Guests|default:0|format:0|right:16}
${'  ' + _( '(rpt)Number of Items' ) + ':'|left:26}${body.sales_summary.QtySubtotal|default:0|format:0|right:16}
${'  ' + _( '(rpt)Number of Voided Orders' ) + ':'|left:26}${body.sales_summary.VoidedOrders|default:0|format:0|right:16}
${'  ' + _( '(rpt)Gross Sales' ) + ':'|left:26}${body.sales_summary.GrossSales|default:0|viviFormatPrices:true|right:16}
${'  ' + _( '(rpt)Gross Sales/Order' ) + ':'|left:26}${body.sales_summary.AvgGrossSales|default:0|viviFormatPrices:2|right:16}
${'  ' + _( '(rpt)Gross Sales/Guest' ) + ':'|left:26}${body.sales_summary.AvgGrossSalesPerGuest|default:0|viviFormatPrices:2|right:16}
${'  ' + _( '(rpt)Total' ) + ':'|left:26}${body.sales_summary.NetSales|default:0|viviFormatPrices:true|right:16}
${'  ' + _( '(rpt)Total/Order' ) + ':'|left:26}${body.sales_summary.AvgNetSales|default:0|viviFormatPrices:2|right:16}
${'  ' + _( '(rpt)Total/Guest' ) + ':'|left:26}${body.sales_summary.AvgNetSalesPerGuest|default:0|viviFormatPrices:2|right:16}
${'  ' + _( '(rpt)Number of Guests/Order' ) + ':'|left:26}${body.sales_summary.AvgGuests|default:0|format:2|right:16}
${'  ' + _( '(rpt)Number of Items/Order' ) + ':'|left:26}${body.sales_summary.AvgQtySubtotal|default:0|format:2|right:16}
------------------------------------------
${_( '(rpt)Payment List' )}
{for detail in body.payment_list.records}
${'  ' + _('(rpt)' + detail.name) + ':'|left:26}${detail.total|default:0|viviFormatPrices:true|right:16}
{for payment in detail.detail}
${'    ' + payment.memo1 + ':'|left:26}${payment.amount|default:0|viviFormatPrices:true|right:16}
{/for}
{/for}

${_( '(rpt)Summary' ) + ':'|left:26}${body.payment_list.summary.payment_total|default:0|viviFormatPrices:true|right:16}
------------------------------------------
${_( '(rpt)Groupable Payments' )}
{for detail in body.groupable_payments.records}
{eval}
   paymentType = detail.memo1 + ' ' + TrimPath.parseTemplate_etc.modifierDef['viviFormatPrices'](detail.amount, true);
{/eval}
  ${paymentType|left:31} ${'X ' + detail.count|right:8}
{/for}
------------------------------------------
${_( '(rpt)Destination Summary' )}
{for detail in body.destination_summary.data}
${'  ' + detail.destination + ':'|left:26}${detail.num_trans|default:0|format:0|right:16}
${'    ' + _('(rpt)Destination Gross Sales') + ':'|left:26}${detail.gross|default:0|viviFormatPrices:true|right:16}
${'    ' + _('(rpt)Destination Average Gross Sales') + ':'|left:26}${detail.gross_per_trans|default:0|viviFormatPrices:true|right:16}
{/for}
------------------------------------------
${_( '(rpt)Tax Summary' )}
{for detail in body.tax_summary.records}
${'  ' + _( '(rpt)Tax Name' ) + ':'|left:26}${detail.tax_name|right:16}
${'  ' + _( '(rpt)Taxable Amount' ) + ':'|left:26}${detail.taxable_amount|default:0|viviFormatTaxes:true|right:16}
${'  ' + _( '(rpt)Add-On Tax Amount' ) + ':'|left:26}${detail.tax_subtotal|default:0|viviFormatTaxes:true|right:16}
${'  ' + _( '(rpt)Included Tax Amount' ) + ':'|left:26}${detail.included_tax|default:0|viviFormatTaxes:true|right:16}
  
{/for}
${_( '(rpt)Summary' ) + ':'|left:42}
${'  ' + _( '(rpt)Add-On Tax Amount' ) + ':'|left:26}${body.tax_summary.summary.addon_tax_total|default:0|viviFormatTaxes:true|right:16}
${'  ' + _( '(rpt)Included Tax Amount' ) + ':'|left:26}${body.tax_summary.summary.included_tax_total|default:0|viviFormatTaxes:true|right:16}
------------------------------------------
{if !settings.skip_printing_top_department_sales}
${_( '(rpt)Top Department Sales' )}
{for detail in body.dept_sales.records}
${'  ' + _( '(rpt)Department' ) + ':'|left:26}${detail.cate_no + '-' + detail.cate_name|right:16}
${'  ' + _( '(rpt)Quantity' ) + ':'|left:26}${detail.qty|default:0|format:0|right:16}
${'  ' + _( '(rpt)Gross Sales' ) + ':'|left:26}${detail.gross|default:0|viviFormatPrices:true|right:16}
  
{/for}
${_( '(rpt)Summary' ) + ':'}
${'  ' + _( '(rpt)Quantity' ) + ':'|left:26}${body.dept_sales.summary.qty|default:0|right:16}
${'  ' + _( '(rpt)Gross Sales' ) + ':'|left:26}${body.dept_sales.summary.gross|default:0|viviFormatPrices:true|right:16}
------------------------------------------
{/if}
{if !settings.skip_printing_top_product_sales}
${_( '(rpt)Top Product Sales' )}
{for detail in body.prod_sales.records}
${'  ' + _( '(rpt)Product' ) + ': '|left:26}${detail.product_name|right:16}
${'  ' + _( '(rpt)Quantity' ) + ':'|left:26}${detail.qty|default:0|right:16}
${'  ' + _( '(rpt)Gross Sales' ) + ':'|left:26}${detail.gross|default:0|viviFormatPrices:true|right:16}
  
{/for}
${_( '(rpt)Summary' ) + ':'}
${'  ' + _( '(rpt)Quantity' ) + ':'|left:26}${body.prod_sales.summary.qty|default:0|right:16}
${'  ' + _( '(rpt)Gross Sales' ) + ':'|left:26}${body.prod_sales.summary.gross|default:0|viviFormatPrices:true|right:16}
------------------------------------------
{/if}
{if !settings.skip_printing_hourly_sales}
${_( '(rpt)Hourly Sales' )}
{for detail in body.hourly_sales.records}
${'  ' + _( '(rpt)Hour' ) + ':'|left:26}${detail.Hour|right:16}
${'  ' + _( '(rpt)Number of Guests' ) + ':'|left:26}${detail.Guests|default:0|format:0|right:16}
${'  ' + _( '(rpt)Number of Orders' ) + ':'|left:26}${detail.OrderNum|default:0|format:0|right:16}
${'  ' + _( '(rpt)Gross Sales' ) + ':'|left:26}${detail.HourGrossSales|default:0|viviFormatPrices:true|right:16}
  
{/for}
${_( '(rpt)Summary' ) + ':'}
${'  ' + _( '(rpt)Number of Guests' ) + ':'|left:26}${body.hourly_sales.summary.Guests|default:0|right:16}
${'  ' + _( '(rpt)Number of Orders' ) + ':'|left:26}${body.hourly_sales.summary.OrderNum|default:0|right:16}
${'  ' + _( '(rpt)Gross Sales' ) + ':'|left:26}${body.hourly_sales.summary.HourGrossSales|default:0|viviFormatPrices:true|right:16}
------------------------------------------
{/if}
${_( '(rpt)Discount Summary' )}
{for detail in body.discount_summary.data}
${'  ' + _( '(rpt)Discount Name' ) + ':'|left:26}${detail.discount_name|right:16}
${'  ' + _( '(rpt)Discount Type' ) + ':'|left:26}${detail.itemOrAddition|right:16}
${'  ' + _( '(rpt)Discount Count' ) + ':'|left:26}${detail.num_rows|default:0|format:0|right:16}
${'  ' + _( '(rpt)Discount Amount' ) + ':'|left:26}${detail.amount|default:0|viviFormatPrices:true|right:16}

{/for}
${_( '(rpt)Summary' ) + ':'}
${'  ' + _( '(rpt)Discount Count' ) + ':'|left:26}${body.discount_summary.summary.num_rows|default:0|format:0|right:16}
${'  ' + _( '(rpt)Discount Amount' ) + ':'|left:26}${body.discount_summary.summary.amount|default:0|viviFormatPrices:true|right:16}
------------------------------------------
${_( '(rpt)Surcharge Summary' )}
{for detail in body.surcharge_summary.data}
${'  ' + _( '(rpt)Surcharge Name' ) + ':'|left:26}${detail.surcharge_name|right:16}
${'  ' + _( '(rpt)Surcharge Type' ) + ':'|left:26}${detail.itemOrAddition|right:16}
${'  ' + _( '(rpt)Surcharge Count' ) + ':'|left:26}${detail.num_rows|default:0|format:0|right:16}
${'  ' + _( '(rpt)Surcharge Amount' ) + ':'|left:26}${detail.amount|default:0|viviFormatPrices:true|right:16}

{/for}
${_( '(rpt)Summary' ) + ':'}
${'  ' + _( '(rpt)Surcharge Count' ) + ':'|left:26}${body.surcharge_summary.summary.num_rows|default:0|format:0|right:16}
${'  ' + _( '(rpt)Surcharge Amount' ) + ':'|left:26}${body.surcharge_summary.summary.amount|default:0|viviFormatPrices:true|right:16}
------------------------------------------
${_( '(rpt)Promotion Summary' )}
{for detail in body.promotion_summary.results}
${'  ' + _( '(rpt)Promotion Name' ) + ':'|left:26}${detail.name|right:16}
${'  ' + _( '(rpt)Promotion Count' ) + ':'|left:26}${detail.matched_count|default:0|right:16}
${'  ' + _( '(rpt)Promotion Amount' ) + ':'|left:26}${detail.discount_subtotal|default:0|viviFormatPrices:true|right:16}

{/for}
${_( '(rpt)Summary' ) + ':'}
${'  ' + _( '(rpt)Promotion Count' ) + ':'|left:26}${body.promotion_summary.summary.matched_count|default:0|format:0|right:16}
${'  ' + _( '(rpt)Promotion Amount' ) + ':'|left:26}${body.promotion_summary.summary.discount_subtotal|default:0|viviFormatPrices:true|right:16}
------------------------------------------
${foot.gen_time}
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&PC]
