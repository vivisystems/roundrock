[&QSON]${head.store.name|center:15}[&QSOFF]
[&DWON]${head.store.branch|center:15}[&DWOFF]
${head.store.telephone1|center:42}
Terminal: ${head.store.terminal_no|left:10} Clerk: ${head.clerk_displayname|left:14}
${head.start_time} ~ ${head.end_time}

${head.title|center:42}
${head.subtitle|center:42}
------------------------------------------
General Information
  Total:     ${body.sales_summary.ItemSubtotal|default:0|viviFormatPrices:true|right:29}
  Add-on Tax:${body.sales_summary.TaxSubtotal|default:0|viviFormatPrices:true|right:29}
  Surcharge: ${body.sales_summary.SurchargeSubtotal|default:0|viviFormatPrices:true|right:29}
  Discount:  ${body.sales_summary.DiscountSubtotal|default:0|viviFormatPrices:true|right:29}
  Revenue:   ${body.sales_summary.Total|default:0|viviFormatPrices:true|right:29}
------------------------------------------
Sales Summary
  Orders:       ${body.sales_summary.OrderNum|default:0|right:26}
  Total:        ${body.sales_summary.Total|default:0|viviFormatPrices:true|right:26}
  Guests:       ${body.sales_summary.Guests|default:0|viviFormatPrices:true|right:26}
  Items:        ${body.sales_summary.ItemsCount|default:0|viviFormatPrices:true|right:26}
  Average Total:${body.sales_summary.AvgTotal|default:0|viviFormatPrices:true|right:26}
  Average Guest:${body.sales_summary.AvgGuests|default:0|viviFormatPrices:true|right:26}
  Average Items:${body.sales_summary.AvgItemsCount|default:0|viviFormatPrices:true|right:26}
------------------------------------------
Payment List
{for detail in body.payment_list.records}
${'  ' + detail.name + ':'|left:19}${detail.total|default:0|viviFormatPrices:true|right:23}
{for payment in detail.detail}
${'    ' + payment.memo1 + ':'|left:19}${payment.amount - payment.change|default:0|viviFormatPrices:true|right:23}
{/for}
{/for}
[&CR]
Summary:${body.payment_list.summary.payment_total - body.payment_list.summary.change_total|default:0|viviFormatPrices:true|right:34}
------------------------------------------
Destination Summary
{for detail in body.destination_summary.data}
${'  ' + detail.destination + ' Times:'|left:20}${detail.num_trans|default:0|viviFormatPrices:false|right:22}
${'  ' + detail.destination + ' Amount:'|left:20}${detail.total|default:0|viviFormatPrices:true|right:22}
{/for}
------------------------------------------
Tax summary
{for detail in body.tax_summary.records}
  Tax Name: ${detail.tax_name|right:30}
  Tax Rate: ${detail.tax_rate|right:30}
  Tax Type: ${detail.tax_type|right:30}
  Total:    ${detail.tax_subtotal|default:0|viviFormatPrices:true|right:30}
  
{/for}
Summary:${body.tax_summary.summary.tax_total|default:0|viviFormatPrices:true|right:34}
------------------------------------------
Top ${body.dept_sales.num_rows_to_get} Department Sales
{for detail in body.dept_sales.records}
  Department:${detail.cate_no + '-' + detail.cate_name|right:29}
  Quantity:  ${detail.qty|right:29}
  Total:     ${detail.total|default:0|viviFormatPrices:true|right:29}
  
{/for}
Summary:
  Quantity:${body.dept_sales.summary.qty|right:31}
  Total:   ${body.dept_sales.summary.total|default:0|viviFormatPrices:true|right:31}
------------------------------------------
Top ${body.prod_sales.num_rows_to_get} Product Sales
{for detail in body.prod_sales.records}
  Product: ${detail.product_name|right:31}
  Quantity:${detail.qty|right:31}
  Total:   ${detail.total|default:0|viviFormatPrices:true|right:31}
  
{/for}
Summary:
  Quantity:${body.prod_sales.summary.qty|right:31}
  Total:   ${body.prod_sales.summary.total|default:0|viviFormatPrices:true|right:31}
------------------------------------------
Hourly Sales
{for detail in body.hourly_sales.records}
  Time:  ${detail.Hour|right:33}
  Guests:${detail.Guests|right:33}
  Orders:${detail.OrderNum|right:33}
  Total: ${detail.HourTotal|default:0|viviFormatPrices:true|right:33}
  
{/for}
Summary:
  Guests:${body.hourly_sales.summary.Guests|right:33}
  Orders:${body.hourly_sales.summary.OrderNum|right:33}
  Total: ${body.hourly_sales.summary.HourTotal|default:0|viviFormatPrices:true|right:33}
------------------------------------------
Discount Summary
{for detail in body.discount_summary.data}
${'  Name:'|left:18}${detail.discount_name|right:24}
${'  Type:'|left:18}${detail.itemOrAddition|right:24}
${'  Count:'|left:18}${detail.num_rows|right:24}
${'  Amount:'|left:18}${detail.amount|default:0|viviFormatPrices:true|right:24}

{/for}
Summary:
${'  Count:'|left:18}${body.discount_summary.summary.num_rows|right:24}
${'  Amount:'|left:18}${body.discount_summary.summary.amount|default:0|viviFormatPrices:true|right:24}
------------------------------------------
Surcharge Summary
{for detail in body.surcharge_summary.data}
${'  Name:'|left:18}${detail.surcharge_name|right:24}
${'  Type:'|left:18}${detail.itemOrAddition|right:24}
${'  Count:'|left:18}${detail.num_rows|right:24}
${'  Amount:'|left:18}${detail.amount|default:0|viviFormatPrices:true|right:24}

{/for}
Summary:
${'  Count:'|left:18}${body.surcharge_summary.summary.num_rows|right:24}
${'  Amount:'|left:18}${body.surcharge_summary.summary.amount|default:0|viviFormatPrices:true|right:24}
------------------------------------------
${foot.gen_time}
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&PC]
