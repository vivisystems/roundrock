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
${queryFormLabel.num_dept_label}${queryFormLabel.num_dept}
${queryFormLabel.num_product_label}${queryFormLabel.num_product}
${queryFormLabel.database_label}${queryFormLabel.database}

${head.title|center:24}
------------------------
${_( '(rpt)Sales Overview' )}
------------------------
${_( '(rpt)Gross Sales' ) + ':'}
${body.sales_summary.GrossSales|default:0|viviFormatPrices:true|right:24}
${_( '(rpt)Add-on Tax' ) + ':'}
${body.sales_summary.TaxSubtotal|default:0|viviFormatTaxes:true|right:24}
${_( '(rpt)Surcharge' ) + ':'}
${body.sales_summary.SurchargeSubtotal|default:0|viviFormatPrices:true|right:24}
${_( '(rpt)Discount' ) + ':'}
${body.sales_summary.DiscountSubtotal|default:0|viviFormatPrices:true|right:24}
${_( '(rpt)Promotion' ) + ':'}
${body.sales_summary.PromotionSubtotal|default:0|viviFormatPrices:true|right:24}
${_( '(rpt)Revalue' ) + ':'}
${body.sales_summary.RevalueSubtotal|default:0|viviFormatPrices:true|right:24}
${_( '(rpt)Total' ) + ':'}
${body.sales_summary.NetSales|default:0|viviFormatPrices:true|right:24}
------------------------
${_( '(rpt)Sales Summary' )}
------------------------
${_( '(rpt)Number of Orders' ) + ':'}
${body.sales_summary.OrderNum|default:0|format:0|right:24}
${_( '(rpt)Number of Guests' ) + ':'}
${body.sales_summary.Guests|default:0|format:0|right:24}
${_( '(rpt)Number of Items' ) + ':'}
${body.sales_summary.QtySubtotal|default:0|format:0|right:24}
${_( '(rpt)Number of Voided Orders' ) + ':'}
${body.sales_summary.VoidedOrders|default:0|format:0|right:24}
${_( '(rpt)Gross Sales' ) + ':'}
${body.sales_summary.GrossSales|default:0|viviFormatPrices:true|right:24}
${_( '(rpt)Gross Sales/Order' ) + ':'}
${body.sales_summary.AvgGrossSales|default:0|viviFormatPrices:true|right:24}
${_( '(rpt)Gross Sales/Guest' ) + ':'}
${body.sales_summary.AvgGrossSalesPerGuest|default:0|viviFormatPrices:true|right:24}
${_( '(rpt)Total' ) + ':'}
${body.sales_summary.NetSales|default:0|viviFormatPrices:true|right:24}
${_( '(rpt)Total/Order' ) + ':'}
${body.sales_summary.AvgNetSales|default:0|viviFormatPrices:true|right:24}
${_( '(rpt)Total/Guest' ) + ':'}
${body.sales_summary.AvgNetSalesPerGuest|default:0|viviFormatPrices:true|right:24}
${_( '(rpt)Number of Guests/Order' ) + ':'}
${body.sales_summary.AvgGuests|default:0|format:2|right:24}
${_( '(rpt)Number of Items/Order' ) + ':'}
${body.sales_summary.AvgQtySubtotal|default:0|format:2|right:24}
------------------------
${_( '(rpt)Payment List' )}
------------------------
{for detail in body.payment_list.records}
${_('(rpt)' + detail.name) + ':'|left:24}
${detail.total|default:0|viviFormatPrices:true|right:24}
{for payment in detail.detail}
${'  ' + payment.memo1|left:24}
${payment.amount|default:0|viviFormatPrices:true|right:24}
{/for}
{/for}
${_( '(rpt)Summary' ) + ':'}
${body.payment_list.summary.payment_total|default:0|viviFormatPrices:true|right:24}
------------------------
${_( '(rpt)Groupable Payments' )}
------------------------
{for detail in body.groupable_payments.records}
${detail.memo1|default:''} ${detail.amount|viviFormatPrices:true}
${'X ' + detail.count|right:24}
{/for}
------------------------
${_( '(rpt)Destination Summary' )}
------------------------
{for detail in body.destination_summary.data}
${detail.destination + ':'|left:24}
${'  ' + _('(rpt)Destination Count') + ':'|left:24}
${detail.num_trans|default:0|format:0|right:24}
${'  ' + _('(rpt)Destination Gross Sales') + ':'|left:24}
${detail.gross|default:0|viviFormatPrices:true|right:24}
${'  ' + _('(rpt)Destination Average Gross Sales') + ':'|left:24}
${detail.gross_per_trans|default:0|viviFormatPrices:true|right:24}
{/for}
------------------------
${_( '(rpt)Tax Summary' )}
------------------------
{for detail in body.tax_summary.records}
${_( '(rpt)Tax Name' ) + ':'}
${detail.tax_name|right:24}
${'  ' + _( '(rpt)Taxable Amount' ) + ':'}
${detail.taxable_amount|default:0|viviFormatTaxes:true|right:24}
${'  ' + _( '(rpt)Add-On Tax Amount' ) + ':'}
${detail.tax_subtotal|default:0|viviFormatTaxes:true|right:24}
${'  ' + _( '(rpt)Included Tax Amount' ) + ':'}
${detail.included_tax|default:0|viviFormatTaxes:true|right:24}
  
{/for}
${_( '(rpt)Summary' ) + ':'}
${'  ' + _( '(rpt)Add-On Tax Amount' ) + ':'|left:24}
${body.tax_summary.summary.addon_tax_total|default:0|viviFormatTaxes:true|right:24}
${'  ' + _( '(rpt)Included Tax Amount' ) + ':'|left:24}
${body.tax_summary.summary.included_tax_total|default:0|viviFormatTaxes:true|right:24}
{if !settings.skip_printing_top_department_sales}
------------------------
${_( '(rpt)Top Department Sales' )}
------------------------
{for detail in body.dept_sales.records}
${_( '(rpt)Department' ) + ':'}
${detail.cate_no + '-' + detail.cate_name|right:24}
${'  ' + _( '(rpt)Quantity' ) + ':'}
${detail.qty|default:0|right:24}
${'  ' + _( '(rpt)Gross Sales' ) + ':'}
${detail.gross|default:0|viviFormatPrices:true|right:24}
  
{/for}
${_( '(rpt)Summary' ) + ':'}
${'  ' + _( '(rpt)Quantity' ) + ':'}
${body.dept_sales.summary.qty|default:0|right:24}
${'  ' + _( '(rpt)Gross Sales' ) + ':' }
${body.dept_sales.summary.gross|default:0|viviFormatPrices:true|right:24}
{/if}
{if !settings.skip_printing_top_product_sales}
------------------------
${_( '(rpt)Top Product Sales' )}
------------------------
{for detail in body.prod_sales.records}
${_( '(rpt)Product' ) + ':'}
${detail.product_name|right:24}
${'  ' + _( '(rpt)Quantity' ) + ':'}
${detail.qty|default:0|format:0|right:24}
${'  ' + _( '(rpt)Gross Sales' ) + ':'}
${detail.gross|default:0|viviFormatPrices:true|right:24}
  
{/for}
${_( '(rpt)Summary' ) + ':'}
${'  ' + _( '(rpt)Quantity' ) + ':'}
${body.prod_sales.summary.qty|default:0|format:0|right:24}
${'  ' + _( '(rpt)Gross Sales' ) + ':'}
${body.prod_sales.summary.gross|default:0|viviFormatPrices:true|right:24}
{/if}
{if !settings.skip_printing_hourly_sales}
------------------------
${_( '(rpt)Hourly Sales' )}
------------------------
{for detail in body.hourly_sales.records}
${_( '(rpt)Hour' ) + ':'}
${detail.Hour|right:24}
${'  ' + _( '(rpt)Number of Guests' ) + ':'}
${detail.Guests|default:0|format:0|right:24}
${'  ' + _( '(rpt)Number of Orders' ) + ':'}
${detail.OrderNum|default:0|format:0|right:24}
${'  ' + _( '(rpt)Gross Sales' ) + ':'}
${detail.HourGrossSales|default:0|viviFormatPrices:true|right:24}
  
{/for}
${_( '(rpt)Summary' ) + ':'}
${'  ' + _( '(rpt)Number of Guests' ) + ':'}
${body.hourly_sales.summary.Guests|default:0|format:0|right:24}
${'  ' + _( '(rpt)Number of Orders' ) + ':'}
${body.hourly_sales.summary.OrderNum|default:0|format:0|right:24}
${'  ' + _( '(rpt)Gross Sales' ) + ':'}
${body.hourly_sales.summary.HourGrossSales|default:0|viviFormatPrices:true|right:24}
{/if}
------------------------
${_( '(rpt)Discount Summary' )}
------------------------
{for detail in body.discount_summary.data}
${_( '(rpt)Discount Name' ) + ':'}
${detail.discount_name|right:24}
${'  ' + _( '(rpt)Discount Type' ) + ':'}
${detail.itemOrAddition|right:24}
${'  ' + _( '(rpt)Discount Count' ) + ':'}
${detail.num_rows|default:0|format:0|right:24}
${'  ' + _( '(rpt)Discount Amount' ) + ':'}
${detail.amount|default:0|viviFormatPrices:true|right:24}
	
{/for}
${_( '(rpt)Summary' ) + ':'}
${'  ' + _( '(rpt)Discount Count' ) + ':'}
${body.discount_summary.summary.num_rows|default:0|format:0|right:24}
${'  ' + _( '(rpt)Discount Amount' ) + ':'}
${body.discount_summary.summary.amount|default:0|viviFormatPrices:true|right:24}
------------------------
${_( '(rpt)Surcharge Summary' )}
------------------------
{for detail in body.surcharge_summary.data}
${_( '(rpt)Surcharge Name' ) + ':'}
${detail.surcharge_name|right:24}
${'  ' + _( '(rpt)Surcharge Type' ) + ':'}
${detail.itemOrAddition|right:24}
${'  ' + _( '(rpt)Surcharge Count' ) + ':'}
${detail.num_rows|default:0|format:0|right:24}
${_( '(rpt)Surcharge Amount' ) + ':'}
${detail.amount|default:0|viviFormatPrices:true|right:24}

{/for}
${_( '(rpt)Summary' ) + ':'}
${'  ' + _( '(rpt)Surcharge Count' ) + ':'}
${body.surcharge_summary.summary.num_rows|default:0|format:0|right:24}
${'  ' + _( '(rpt)Surcharge Amount' ) + ':'}
${body.surcharge_summary.summary.amount|default:0|viviFormatPrices:true|right:24}
------------------------
${_( '(rpt)Promotion Summary' )}
------------------------
{for detail in body.promotion_summary.results}
${_( '(rpt)Promotion Name' )}
${detail.name|right:24}
${'  ' + _( '(rpt)Promotion Count' )}
${detail.matched_count|default:0|format:0|right:24}
${'  ' + _( '(rpt)Promotion Amount' )}
${detail.discount_subtotal|default:0|viviFormatPrices:true|right:24}

{/for}
${_( '(rpt)Summary' ) + ':'}
${'  ' + _( '(rpt)Promotion Count' )}
${body.promotion_summary.summary.matched_count|default:0|format:0|right:24}
${'  ' + _( '(rpt)Promotion Amount' )}
${body.promotion_summary.summary.discount_subtotal|default:0|viviFormatPrices:true|right:24}
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
