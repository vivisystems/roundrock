[&QSON]${head.store.name|center:15}[&QSOFF]
[&DWON]${head.store.branch|center:14}[&DWOFF]
${head.store.telephone1|center:24}

${_( 'Terminal' ) + ': '}${head.store.terminal_no}
${_( 'Clerk' ) + ': '}${head.clerk_displayname}
${head.start_time} ~
${head.end_time}

${head.title|center:24}
------------------------
${_( 'General Information' )}
${_( 'Total' ) + ':'}
${body.sales_summary.ItemSubtotal|default:0|viviFormatPrices:true|right:24}
${_( 'Add-on Tax' ) + ':'}
${body.sales_summary.TaxSubtotal|default:0|viviFormatPrices:true|right:24}
${_( 'Surcharge' ) + ':'}
${body.sales_summary.SurchargeSubtotal|default:0|viviFormatPrices:true|right:24}
${_( 'Discount' ) + ':'}
${body.sales_summary.DiscountSubtotal|default:0|viviFormatPrices:true|right:24}
${_( 'Revenue' ) + ':'}
${body.sales_summary.Total|default:0|viviFormatPrices:true|right:24}
------------------------
${_( 'Sales Summary' )}
${_( 'Orders' ) + ':'}
${body.sales_summary.OrderNum|default:0|right:24}
${_( 'Total' ) + ':'}
${body.sales_summary.Total|default:0|viviFormatPrices:true|right:24}
${_( 'Guests' ) + ':'}
${body.sales_summary.Guests|default:0|right:24}
${_( 'Items' ) + ':'}
${body.sales_summary.ItemsCount|default:0|right:24}
${_( 'Average Total' ) + ':'}
${body.sales_summary.AvgTotal|default:0|viviFormatPrices:true|right:24}
${_( 'Average Guest' ) + ':'}
${body.sales_summary.AvgGuests|default:0|viviFormatPrices:true|right:24}
${_( 'Average Items' ) + ':'}
${body.sales_summary.AvgItemsCount|default:0|viviFormatPrices:true|right:24}
------------------------
${_( 'Payment List' )}
{for detail in body.payment_list.records}
${detail.name}:
${detail.total|default:0|viviFormatPrices:true|right:24}
{for payment in detail.detail}
  ${payment.memo1}:
  ${payment.amount - payment.change|default:0|viviFormatPrices:true|right:22}
{/for}
{/for}
${_( 'Summary' ) + ':'}
${body.payment_list.summary.payment_total - body.payment_list.summary.change_total|default:0|viviFormatPrices:true|right:24}
------------------------
${_( 'Destination Summary' )}
{for detail in body.destination_summary.data}
${detail.destination} ${_( 'Times' ) + ':'}
${detail.num_trans|default:0|right:24}
${detail.destination} ${_( 'Amount' ) + ':'}
${detail.total|default:0|viviFormatPrices:true|right:24}
{/for}
------------------------
${_( 'Tax summary' )}
{for detail in body.tax_summary.records}
${_( 'Tax Name' ) + ':'}
${detail.tax_name|right:24}
${_( 'Tax Rate' ) + ':'}
${detail.tax_rate|right:24}
${_( 'Tax Type' ) + ':'}
${detail.tax_type|right:24}
${_( 'Total' ) + ':'}
${detail.tax_subtotal|default:0|viviFormatPrices:true|right:24}
  
{/for}
${_( 'Summary' ) + ':'}
${body.tax_summary.summary.tax_total|default:0|viviFormatPrices:true|right:24}
------------------------
${_( 'Top Department Sales' )}
{for detail in body.dept_sales.records}
${_( 'Department' ) + ':'}
${detail.cate_no + '-' + detail.cate_name|right:24}
${_( 'Quantity' ) + ':'}
${detail.qty||default:0|right:24}
${_( 'Total' ) + ':'}
${detail.total|default:0|viviFormatPrices:true|right:24}
  
{/for}
${_( 'Summary' ) + ':'}
${_( 'Quantity' ) + ':'}
${body.dept_sales.summary.qty|default:0|right:24}
${_( 'Total' ) + ':' }
${body.dept_sales.summary.total|default:0|viviFormatPrices:true|right:24}
------------------------
${_( 'Top Product Sales' )}
{for detail in body.prod_sales.records}
${_( 'Product' ) + ':'}
${detail.product_name|right:24}
${_( 'Quantity' ) + ':'}
${detail.qty|default:0|right:24}
${_( 'Total' ) + ':'}
${detail.total|default:0|viviFormatPrices:true|right:24}
  
{/for}
${_( 'Summary' ) + ':'}
${_( 'Quantity' ) + ':'}
${body.prod_sales.summary.qty|default:0|right:24}
${_( 'Total' ) + ':'}
${body.prod_sales.summary.total|default:0|viviFormatPrices:true|right:24}
------------------------
${_( 'Hourly Sales' )}
{for detail in body.hourly_sales.records}
${_( 'Time' ) + ':'}
${detail.Hour|right:24}
${_( 'Guests' ) + ':'}
${detail.Guests|default:0|right:24}
${_( 'Orders' ) + ':'}
${detail.OrderNum|default:0|right:24}
${_( 'Total' ) + ':'}
${detail.HourTotal|default:0|viviFormatPrices:true|right:24}
  
{/for}
${_( 'Summary' ) + ':'}
${_( 'Guests' ) + ':'}
${body.hourly_sales.summary.Guests|default:0|right:24}
${_( 'Orders' ) + ':'}
${body.hourly_sales.summary.OrderNum|default:0|right:24}
${_( 'Total' ) + ':'}
${body.hourly_sales.summary.HourTotal|default:0|viviFormatPrices:true|right:24}
------------------------
${_( 'Discount Summary' )}
{for detail in body.discount_summary.data}
${_( 'Name' ) + ':'}
${detail.discount_name|right:24}
${_( 'Type' ) + ':'}
${detail.itemOrAddition|right:24}
${_( 'Count' ) + ':'}
${detail.num_rows|default:0|right:24}
${_( 'Amount' ) + ':'}
${detail.amount|default:0|viviFormatPrices:true|right:24}
	
{/for}
${_( 'Summary' ) + ':'}
${_( 'Count' ) + ':'}
${body.discount_summary.summary.num_rows|default:0|right:24}
${_( 'Amount' ) + ':'}
${body.discount_summary.summary.amount|default:0|viviFormatPrices:true|right:24}
------------------------
${_( 'Surcharge Summary' )}
{for detail in body.surcharge_summary.data}
${_( 'Name' ) + ':'}
${detail.surcharge_name|right:24}
${_( 'Type' ) + ':'}
${detail.itemOrAddition|right:24}
${_( 'Count' ) + ':'}
${detail.num_rows|default:0|right:24}
${_( 'Amount' ) + ':'}
${detail.amount|default:0|viviFormatPrices:true|right:24}

{/for}
${_( 'Summary' ) + ':'}
${_( 'Count' ) + ':'}
${body.surcharge_summary.summary.num_rows|default:0|right:24}
${_( 'Amount' ) + ':'}
${body.surcharge_summary.summary.amount|default:0|viviFormatPrices:true|right:24}
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
