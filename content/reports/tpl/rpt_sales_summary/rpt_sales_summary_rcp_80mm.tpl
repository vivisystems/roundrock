[&QSON]${head.store.name|center:15}[&QSOFF]
[&DWON]${head.store.branch|center:15}[&DWOFF]
${head.store.telephone1|center:42}
${_( 'Terminal' ) + ': '}${head.store.terminal_no + ' '|left:11}${_( 'Clerk' ) + ': '}${head.clerk_displayname|left:14}
${head.start_time} ~ ${head.end_time}

${head.title|center:42}
${head.subtitle|center:42}
------------------------------------------
${_( 'General Information' )}
${'  ' + _( 'Total' ) + ':'|left:13}${body.sales_summary.ItemSubtotal|default:0|viviFormatPrices:true|right:29}
${'  ' + _( 'Add-on Tax' ) + ':'|left:13}${body.sales_summary.TaxSubtotal|default:0|viviFormatPrices:true|right:29}
${'  ' + _( 'Surcharge' ) + ':'|left:13}${body.sales_summary.SurchargeSubtotal|default:0|viviFormatPrices:true|right:29}
${'  ' + _( 'Discount' ) + ':'|left:13}${body.sales_summary.DiscountSubtotal|default:0|viviFormatPrices:true|right:29}
${'  ' + _( 'Revenue' ) + ':'|left:13}${body.sales_summary.Total|default:0|viviFormatPrices:true|right:29}
------------------------------------------
${_( 'Sales Summary' )}
${'  ' + _( 'Orders' ) + ':'|left:16}${body.sales_summary.OrderNum|default:0|right:26}
${'  ' + _( 'Total' ) + ':'|left:16}${body.sales_summary.Total|default:0|viviFormatPrices:true|right:26}
${'  ' + _( 'Guests' ) + ':'|left:16}${body.sales_summary.Guests|default:0|right:26}
${'  ' + _( 'Items' ) + ':'|left:16}${body.sales_summary.ItemsCount|default:0|right:26}
${'  ' + _( 'Average Total' ) + ':'|left:16}${body.sales_summary.AvgTotal|default:0|viviFormatPrices:true|right:26}
${'  ' + _( 'Average Guest' ) + ':'|left:16}${body.sales_summary.AvgGuests|default:0|viviFormatPrices:true|right:26}
${'  ' + _( 'Average Items' ) + ':'|left:16}${body.sales_summary.AvgItemsCount|default:0|viviFormatPrices:true|right:26}
------------------------------------------
${_( 'Payment List' )}
{for detail in body.payment_list.records}
${'  ' + detail.name + ':'|left:19}${detail.total|default:0|viviFormatPrices:true|right:23}
{for payment in detail.detail}
${'    ' + payment.memo1 + ':'|left:19}${payment.amount - payment.change|default:0|viviFormatPrices:true|right:23}
{/for}
{/for}
[&CR]
${_( 'Summary' ) + ':'}${body.payment_list.summary.payment_total - body.payment_list.summary.change_total|default:0|viviFormatPrices:true|right:34}
------------------------------------------
${_( 'Destination Summary' )}
{for detail in body.destination_summary.data}
${'  ' + detail.destination + ' Times:'|left:20}${detail.num_trans|default:0|viviFormatPrices:false|right:22}
${'  ' + detail.destination + ' Amount:'|left:20}${detail.total|default:0|viviFormatPrices:true|right:22}
{/for}
------------------------------------------
${_( 'Tax summary' )}
{for detail in body.tax_summary.records}
${'  ' + _( 'Tax Name' ) + ':'|left:12}${detail.tax_name|right:30}
${'  ' + _( 'Tax Rate' ) + ':'|left:12}${detail.tax_rate|right:30}
${'  ' + _( 'Tax Type' ) + ':'|left:12}${detail.tax_type|right:30}
${'  ' + _( 'Total' ) + ':'|left:12}${detail.tax_subtotal|default:0|viviFormatPrices:true|right:30}
  
{/for}
${_( 'Summary' ) + ':'}${body.tax_summary.summary.tax_total|default:0|viviFormatPrices:true|right:34}
------------------------------------------
${_( 'Top Department Sales' )}
{for detail in body.dept_sales.records}
${'  ' + _( 'Department' ) + ':'|left:13}${detail.cate_no + '-' + detail.cate_name|right:29}
${'  ' + _( 'Quantity' ) + ':'|left:13}${detail.qty|default:0|right:29}
${'  ' + _( 'Total' ) + ':'|left:13}${detail.total|default:0|viviFormatPrices:true|right:29}
  
{/for}
${_( 'Summary' ) + ':'}
${'  ' + _( 'Quantity' ) + ':'|left:11}${body.dept_sales.summary.qty|default:0|right:31}
${'  ' + _( 'Total' ) + ':'|left:11}${body.dept_sales.summary.total|default:0|viviFormatPrices:true|right:31}
------------------------------------------
${_( 'Top Product Sales' )}
{for detail in body.prod_sales.records}
${'  ' + _( 'Product' ) + ': '|left:11}${detail.product_name|right:31}
${'  ' + _( 'Quantity' ) + ':'|left:11}${detail.qty|default:0|right:31}
${'  ' + _( 'Total' ) + ':'|left:11}${detail.total|default:0|viviFormatPrices:true|right:31}
  
{/for}
${_( 'Summary' ) + ':'}
${'  ' + _( 'Quantity' ) + ':'|left:11}${body.prod_sales.summary.qty|default:0|right:31}
${'  ' + _( 'Total' ) + ':'|left:11}${body.prod_sales.summary.total|default:0|viviFormatPrices:true|right:31}
------------------------------------------
${_( 'Hourly Sales' )}
{for detail in body.hourly_sales.records}
${'  ' + _( 'Time' ) + ':'|left:9}${detail.Hour|right:33}
${'  ' + _( 'Guests' ) + ':'|left:9}${detail.Guests|default:0|right:33}
${'  ' + _( 'Orders' ) + ':'|left:9}${detail.OrderNum|default:0|right:33}
${'  ' + _( 'Total' ) + ':'|left:9}${detail.HourTotal|default:0|viviFormatPrices:true|right:33}
  
{/for}
${_( 'Summary' ) + ':'}
${'  ' + _( 'Guests' ) + ':'|left:9}${body.hourly_sales.summary.Guests|default:0|right:33}
${'  ' + _( 'Orders' ) + ':'|left:9}${body.hourly_sales.summary.OrderNum|default:0|right:33}
${'  ' + _( 'Total' ) + ':'|left:9}${body.hourly_sales.summary.HourTotal|default:0|viviFormatPrices:true|right:33}
------------------------------------------
${_( 'Discount Summary' )}
{for detail in body.discount_summary.data}
${'  ' + _( 'Name' ) + ':'|left:18}${detail.discount_name|right:24}
${'  ' + _( 'Type' ) + ':'|left:18}${detail.itemOrAddition|right:24}
${'  ' + _( 'Count' ) + ':'|left:18}${detail.num_rows|default:0|right:24}
${'  ' + _( 'Amount' ) + ':'|left:18}${detail.amount|default:0|viviFormatPrices:true|right:24}

{/for}
${_( 'Summary' ) + ':'}
${'  ' + _( 'Count' ) + ':'|left:18}${body.discount_summary.summary.num_rows|default:0|right:24}
${'  ' + _( 'Amount' ) + ':'|left:18}${body.discount_summary.summary.amount|default:0|viviFormatPrices:true|right:24}
------------------------------------------
${_( 'Surcharge Summary' )}
{for detail in body.surcharge_summary.data}
${'  ' + _( 'Name' ) + ':'|left:18}${detail.surcharge_name|right:24}
${'  ' + _( 'Type' ) + ':'|left:18}${detail.itemOrAddition|right:24}
${'  ' + _( 'Count' ) + ':'|left:18}${detail.num_rows|default:0|right:24}
${'  ' + _( 'Amount' ) + ':'|left:18}${detail.amount|default:0|viviFormatPrices:true|right:24}

{/for}
${_( 'Summary' ) + ':'}
${'  ' + _( 'Count' ) + ':'|left:18}${body.surcharge_summary.summary.num_rows|default:0|right:24}
${'  ' + _( 'Amount' ) + ':'|left:18}${body.surcharge_summary.summary.amount|default:0|viviFormatPrices:true|right:24}
------------------------------------------
${foot.gen_time}
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&PC]
