[&QSON]${head.store.name|center:15}[&QSOFF]
[&DWON]${head.store.branch|center:15}[&DWOFF]
${head.store.telephone1|center:42}
Terminal: ${head.store.terminal_no|left:10} Clerk: ${head.clerk_displayname|left:14}
${head.start_time} ~ ${head.end_time}

${head.title|center:42}
------------------------------------------
General Information
  Total:       ${body.sales_summary.ItemSubtotal|default:0|viviFormatPrices:true}
  Add-on Tax:  ${body.sales_summary.TaxSubtotal|default:0|viviFormatPrices:true}
  Surcharge:   ${body.sales_summary.SurchargeSubtotal|default:0|viviFormatPrices:true}
  Discount:    ${body.sales_summary.DiscountSubtotal|default:0|viviFormatPrices:true}
  Revenue:     ${body.sales_summary.Total|default:0|viviFormatPrices:true}
------------------------------------------
Sales Summary
  Orders:         ${body.sales_summary.OrderNum|default:0|viviFormatPrices:true}
  Total:          ${body.sales_summary.Total|default:0|viviFormatPrices:true}
  Guests:         ${body.sales_summary.Guests|default:0|viviFormatPrices:true}
  Items:          ${body.sales_summary.ItemsCount|default:0|viviFormatPrices:true}
  Average Total:  ${body.sales_summary.AvgTotal|default:0|viviFormatPrices:true}
  Average Guest:  ${body.sales_summary.AvgGuests|default:0|viviFormatPrices:true}
  Average Items:  ${body.sales_summary.AvgItemsCount|default:0|viviFormatPrices:true}
------------------------------------------
Payment List
{for detail in body.payment_list.records}
  ${detail.name}:    ${detail.amount - detail.change|default:0|viviFormatPrices:true}
{/for}
Summary:    ${body.payment_list.summary.payment_total - body.payment_list.summary.change_total|default:0|viviFormatPrices:true}
------------------------------------------
Destination Summary
  Total Orders:	${body.destination_summary.total_trans }
{for detail in body.destination_summary.data}
  ${detail.destination} Times:  ${detail.num_trans|default:0|viviFormatPrices:false}
  ${detail.destination} Amount: ${detail.total|default:0|viviFormatPrices:true}
{/for}
------------------------------------------
Tax summary
{for detail in body.tax_summary.records}
  Tax Name:   ${detail.tax_name}
  Tax Rate:   ${detail.tax_rate}
  Rate Type:
  Tax Type:   ${detail.tax_type}
  Total:      ${detail.tax_subtotal|default:0|viviFormatPrices:true}
  
{/for}
Summary:		${body.tax_summary.summary.tax_total|default:0|viviFormatPrices:true}
------------------------------------------
Top ${body.dept_sales.num_rows_to_get} Department Sales
{for detail in body.dept_sales.records}
  Department:   ${detail.cate_no}-${detail.cate_name}
  Quantity:     ${detail.qty}
  Total:        ${detail.total|default:0|viviFormatPrices:true}
  
{/for}
Summary:
  Quantity: ${body.dept_sales.summary.qty}
  Total:    ${body.dept_sales.summary.total|default:0|viviFormatPrices:true}
------------------------------------------
Top ${body.prod_sales.num_rows_to_get} Product Sales
{for detail in body.prod_sales.records}
  Product:  ${detail.product_name}
  Quantity: ${detail.qty}
  Total:    ${detail.total|default:0|viviFormatPrices:true}
  
{/for}
Summary:
  Quantity: ${body.prod_sales.summary.qty}
  Total:    ${body.prod_sales.summary.total|default:0|viviFormatPrices:true}
------------------------------------------
Hourly Sales
{for detail in body.hourly_sales.records}
  Time:     ${detail.Hour}
  Guests:   ${detail.Guests}
  Orders:   ${detail.OrderNum}
  Total:    ${detail.HourTotal|default:0|viviFormatPrices:true}
  
{/for}
Summary:
  Guests:   ${body.hourly_sales.summary.Guests}
  Orders:   ${body.hourly_sales.summary.OrderNum}
  Total:    ${body.hourly_sales.summary.HourTotal|default:0|viviFormatPrices:true}
------------------------------------------
${foot.gen_time}
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&PC]
