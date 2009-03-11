[&QSON]${head.store.name|center:15}[&QSOFF]
[&DWON]${head.store.branch|center:14}[&DWOFF]
${head.store.telephone1|center:24}

Terminal: ${head.store.terminal_no}
Clerk: ${head.clerk_displayname}
${head.start_time} ~
${head.end_time}

${head.title|center:24}
------------------------
General Information
Total:
${body.sales_summary.ItemSubtotal|default:0|viviFormatPrices:true|right:24}
Add-on Tax:
${body.sales_summary.TaxSubtotal|default:0|viviFormatPrices:true|right:24}
Surcharge:
${body.sales_summary.SurchargeSubtotal|default:0|viviFormatPrices:true|right:24}
Discount:
${body.sales_summary.DiscountSubtotal|default:0|viviFormatPrices:true|right:24}
Revenue:
${body.sales_summary.Total|default:0|viviFormatPrices:true|right:24}
------------------------
Sales Summary
Orders:
${body.sales_summary.OrderNum|default:0|viviFormatPrices:true|right:24}
Total:
${body.sales_summary.Total|default:0|viviFormatPrices:true|right:24}
Guests:
${body.sales_summary.Guests|default:0|viviFormatPrices:true|right:24}
Items:
${body.sales_summary.ItemsCount|default:0|viviFormatPrices:true|right:24}
Average Total:
${body.sales_summary.AvgTotal|default:0|viviFormatPrices:true|right:24}
Average Guest:
${body.sales_summary.AvgGuests|default:0|viviFormatPrices:true|right:24}
Average Items:
${body.sales_summary.AvgItemsCount|default:0|viviFormatPrices:true|right:24}
------------------------
Payment List
{for detail in body.payment_list.records}
${detail.name}:
${detail.amount - detail.change|default:0|viviFormatPrices:true|right:24}
{/for}
Summary:
${body.payment_list.summary.payment_total - body.payment_list.summary.change_total|default:0|viviFormatPrices:true|right:24}
------------------------
Destination Summary
Total Orders:
${body.destination_summary.total_trans|right:24}
{for detail in body.destination_summary.data}
${detail.destination} Times:
${detail.num_trans|default:0|viviFormatPrices:false|right:24}
${detail.destination} Amount:
${detail.total|default:0|viviFormatPrices:true|right:24}
{/for}
------------------------
Tax summary
{for detail in body.tax_summary.records}
Tax Name:
${detail.tax_name|right:24}
Tax Rate:
${detail.tax_rate|right:24}
Rate Type:
${detail.rate_type|right:24}
Tax Type:
${detail.tax_type|right:24}
Total:
${detail.tax_subtotal|default:0|viviFormatPrices:true|right:24}
  
{/for}
Summary:
${body.tax_summary.summary.tax_total|default:0|viviFormatPrices:true|right:24}
------------------------
Top ${body.dept_sales.num_rows_to_get} Department Sales
{for detail in body.dept_sales.records}
Department:
${detail.cate_no}-${detail.cate_name|right:24}
Quantity:
${detail.qty|right:24}
Total:
${detail.total|default:0|viviFormatPrices:true|right:24}
  
{/for}
Summary:
Quantity:
${body.dept_sales.summary.qty|right:24}
Total:
${body.dept_sales.summary.total|default:0|viviFormatPrices:true|right:24}
------------------------
Top ${body.prod_sales.num_rows_to_get} Product Sales
{for detail in body.prod_sales.records}
Product:
${detail.product_name|right:24}
Quantity:
${detail.qty|right:24}
Total:
${detail.total|default:0|viviFormatPrices:true|right:24}
  
{/for}
Summary:
Quantity:
${body.prod_sales.summary.qty|right:24}
Total:
${body.prod_sales.summary.total|default:0|viviFormatPrices:true|right:24}
------------------------
Hourly Sales
{for detail in body.hourly_sales.records}
Time:
${detail.Hour|right:24}
Guests:
${detail.Guests|right:24}
Orders:
${detail.OrderNum|right:24}
Total:
${detail.HourTotal|default:0|viviFormatPrices:true|right:24}
  
{/for}
Summary:
Guests:
${body.hourly_sales.summary.Guests|right:24}
Orders:
${body.hourly_sales.summary.OrderNum|right:24}
Total:
${body.hourly_sales.summary.HourTotal|default:0|viviFormatPrices:true|right:24}
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
