[&QSON]${head.store.name|center:15}[&QSOFF]
[&DWON]${head.store.branch|center:15}[&DWOFF]
${head.store.telephone1|center:42}
${_( '(rpt)Terminal' ) + ': '}${head.store.terminal_no + ' '|left:11}${_( '(rpt)Clerk' ) + ': '}${head.clerk_displayname|left:14}
${head.start_time} ~ ${head.end_time}

${head.title|center:42}
${head.subtitle|center:42}
------------------------------------------
${_( '(rpt)General Information' )}
${'  ' + _( '(rpt)Total' ) + ':'|left:13}${body.sales_summary.ItemSubtotal|default:0|viviFormatPrices:true|right:29}
${'  ' + _( '(rpt)Add-on Tax' ) + ':'|left:13}${body.sales_summary.TaxSubtotal|default:0|viviFormatPrices:true|right:29}
${'  ' + _( '(rpt)Surcharge' ) + ':'|left:13}${body.sales_summary.SurchargeSubtotal|default:0|viviFormatPrices:true|right:29}
${'  ' + _( '(rpt)Discount' ) + ':'|left:13}${body.sales_summary.DiscountSubtotal|default:0|viviFormatPrices:true|right:29}
${'  ' + _( '(rpt)Promotion' ) + ':'|left:13}${body.sales_summary.PromotionSubtotal|default:0|viviFormatPrices:true|right:29}
${'  ' + _( '(rpt)Revalue' ) + ':'|left:13}${body.sales_summary.RevalueSubtotal|default:0|viviFormatPrices:true|right:29}
${'  ' + _( '(rpt)Revenue' ) + ':'|left:13}${body.sales_summary.Total|default:0|viviFormatPrices:true|right:29}
------------------------------------------
${_( '(rpt)Sales Summary' )}
${'  ' + _( '(rpt)Orders' ) + ':'|left:16}${body.sales_summary.OrderNum|default:0|right:26}
${'  ' + _( '(rpt)Total' ) + ':'|left:16}${body.sales_summary.Total|default:0|viviFormatPrices:true|right:26}
${'  ' + _( '(rpt)Guests' ) + ':'|left:16}${body.sales_summary.Guests|default:0|right:26}
${'  ' + _( '(rpt)Items' ) + ':'|left:16}${body.sales_summary.ItemsCount|default:0|right:26}
${'  ' + _( '(rpt)Voided Orders' ) + ':'|left:16}${body.sales_summary.VoidedOrders|default:0|right:26}
${'  ' + _( '(rpt)Average Total' ) + ':'|left:16}${body.sales_summary.AvgTotal|default:0|format:2|right:26}
${'  ' + _( '(rpt)Average Guest' ) + ':'|left:16}${body.sales_summary.AvgGuests|default:0|format:2|right:26}
${'  ' + _( '(rpt)Average Items' ) + ':'|left:16}${body.sales_summary.AvgItemsCount|default:0|format:2|right:26}
------------------------------------------
${_( '(rpt)Payment List' )}
{for detail in body.payment_list.records}
${'  ' + detail.name + ':'|left:19}${detail.total|default:0|viviFormatPrices:true|right:23}
{for payment in detail.detail}
${'    ' + payment.memo1 + ':'|left:19}${payment.amount - payment.change|default:0|viviFormatPrices:true|right:23}
{/for}
{/for}
[&CR]
${_( '(rpt)Summary' ) + ':'}${body.payment_list.summary.payment_total - body.payment_list.summary.change_total|default:0|viviFormatPrices:true|right:34}
------------------------------------------
${_( '(rpt)Destination Summary' )}
{for detail in body.destination_summary.data}
${'  ' + detail.destination + ' Times:'|left:20}${detail.num_trans|default:0|viviFormatPrices:false|right:22}
${'  ' + detail.destination + ' Amount:'|left:20}${detail.total|default:0|viviFormatPrices:true|right:22}
{/for}
------------------------------------------
${_( '(rpt)Tax summary' )}
{for detail in body.tax_summary.records}
${'  ' + _( '(rpt)Tax Name' ) + ':'|left:12}${detail.tax_name|right:30}
${'  ' + _( '(rpt)Tax Rate' ) + ':'|left:12}${detail.tax_rate|right:30}
${'  ' + _( '(rpt)Tax Type' ) + ':'|left:12}${detail.tax_type|right:30}
${'  ' + _( '(rpt)Total' ) + ':'|left:12}${detail.tax_subtotal|default:0|viviFormatPrices:true|right:30}
  
{/for}
${_( '(rpt)Summary' ) + ':'}${body.tax_summary.summary.tax_total|default:0|viviFormatPrices:true|right:34}
------------------------------------------
${_( '(rpt)Top Department Sales' )}
{for detail in body.dept_sales.records}
${'  ' + _( '(rpt)Department' ) + ':'|left:13}${detail.cate_no + '-' + detail.cate_name|right:29}
${'  ' + _( '(rpt)Quantity' ) + ':'|left:13}${detail.qty|default:0|right:29}
${'  ' + _( '(rpt)Total' ) + ':'|left:13}${detail.total|default:0|viviFormatPrices:true|right:29}
  
{/for}
${_( '(rpt)Summary' ) + ':'}
${'  ' + _( '(rpt)Quantity' ) + ':'|left:11}${body.dept_sales.summary.qty|default:0|right:31}
${'  ' + _( '(rpt)Total' ) + ':'|left:11}${body.dept_sales.summary.total|default:0|viviFormatPrices:true|right:31}
------------------------------------------
${_( '(rpt)Top Product Sales' )}
{for detail in body.prod_sales.records}
${'  ' + _( '(rpt)Product' ) + ': '|left:11}${detail.product_name|right:31}
${'  ' + _( '(rpt)Quantity' ) + ':'|left:11}${detail.qty|default:0|right:31}
${'  ' + _( '(rpt)Total' ) + ':'|left:11}${detail.total|default:0|viviFormatPrices:true|right:31}
  
{/for}
${_( '(rpt)Summary' ) + ':'}
${'  ' + _( '(rpt)Quantity' ) + ':'|left:11}${body.prod_sales.summary.qty|default:0|right:31}
${'  ' + _( '(rpt)Total' ) + ':'|left:11}${body.prod_sales.summary.total|default:0|viviFormatPrices:true|right:31}
------------------------------------------
${_( '(rpt)Hourly Sales' )}
{for detail in body.hourly_sales.records}
${'  ' + _( '(rpt)Time' ) + ':'|left:9}${detail.Hour|right:33}
${'  ' + _( '(rpt)Guests' ) + ':'|left:9}${detail.Guests|default:0|right:33}
${'  ' + _( '(rpt)Orders' ) + ':'|left:9}${detail.OrderNum|default:0|right:33}
${'  ' + _( '(rpt)Total' ) + ':'|left:9}${detail.HourTotal|default:0|viviFormatPrices:true|right:33}
  
{/for}
${_( '(rpt)Summary' ) + ':'}
${'  ' + _( '(rpt)Guests' ) + ':'|left:9}${body.hourly_sales.summary.Guests|default:0|right:33}
${'  ' + _( '(rpt)Orders' ) + ':'|left:9}${body.hourly_sales.summary.OrderNum|default:0|right:33}
${'  ' + _( '(rpt)Total' ) + ':'|left:9}${body.hourly_sales.summary.HourTotal|default:0|viviFormatPrices:true|right:33}
------------------------------------------
${_( '(rpt)Discount Summary' )}
{for detail in body.discount_summary.data}
${'  ' + _( '(rpt)Name' ) + ':'|left:18}${detail.discount_name|right:24}
${'  ' + _( '(rpt)TYPE' ) + ':'|left:18}${detail.itemOrAddition|right:24}
${'  ' + _( '(rpt)Count' ) + ':'|left:18}${detail.num_rows|default:0|right:24}
${'  ' + _( '(rpt)Amount' ) + ':'|left:18}${detail.amount|default:0|viviFormatPrices:true|right:24}

{/for}
${_( '(rpt)Summary' ) + ':'}
${'  ' + _( '(rpt)Count' ) + ':'|left:18}${body.discount_summary.summary.num_rows|default:0|right:24}
${'  ' + _( '(rpt)Amount' ) + ':'|left:18}${body.discount_summary.summary.amount|default:0|viviFormatPrices:true|right:24}
------------------------------------------
${_( '(rpt)Surcharge Summary' )}
{for detail in body.surcharge_summary.data}
${'  ' + _( '(rpt)Name' ) + ':'|left:18}${detail.surcharge_name|right:24}
${'  ' + _( '(rpt)TYPE' ) + ':'|left:18}${detail.itemOrAddition|right:24}
${'  ' + _( '(rpt)Count' ) + ':'|left:18}${detail.num_rows|default:0|right:24}
${'  ' + _( '(rpt)Amount' ) + ':'|left:18}${detail.amount|default:0|viviFormatPrices:true|right:24}

{/for}
${_( '(rpt)Summary' ) + ':'}
${'  ' + _( '(rpt)Count' ) + ':'|left:18}${body.surcharge_summary.summary.num_rows|default:0|right:24}
${'  ' + _( '(rpt)Amount' ) + ':'|left:18}${body.surcharge_summary.summary.amount|default:0|viviFormatPrices:true|right:24}
------------------------------------------
${_( '(rpt)Promotion Summary' )}
{for detail in body.promotion_summary.results}
${'  ' + _( '(rpt)Name' ) + ':'|left:18}${detail.name|right:24}
${'  ' + _( '(rpt)Code' ) + ':'|left:18}${detail.code|right:24}
${'  ' + _( '(rpt)Count' ) + ':'|left:18}${detail.matched_count|default:0|right:24}
${'  ' + _( '(rpt)Discount' ) + ':'|left:18}${detail.discount_subtotal|default:0|viviFormatPrices:true|right:24}

{/for}
${_( '(rpt)Summary' ) + ':'}
${'  ' + _( '(rpt)Count' ) + ':'|left:18}${body.promotion_summary.summary.matched_count|default:0|right:24}
${'  ' + _( '(rpt)Discount' ) + ':'|left:18}${body.promotion_summary.summary.discount_subtotal|default:0|viviFormatPrices:true|right:24}
------------------------------------------
${foot.gen_time}
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&PC]
