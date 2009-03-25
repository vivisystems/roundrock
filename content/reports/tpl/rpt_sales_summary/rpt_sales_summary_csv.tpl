"${head.store.name}"
"${head.store.branch}"
"${_( 'Telphone' ) + ':'}","'${head.store.telephone1}"
"${_( 'Terminal' ) + ':'}","'${head.store.terminal_no}"
"${_( 'Clerk' ) + ':'}","'${head.clerk_displayname}"
"${_( 'Printed Time' ) + ':'}","'${foot.gen_time}"
"${_( 'Start' ) + ':'}","${head.start_time}"
"${_( 'End' ) + ':'}","${head.end_time}"
""
"${head.title} ${head.subtitle}"
"",""
"${_( 'General Information' )}"
"","${_( 'Total' )}","${body.sales_summary.ItemSubtotal|default:0|viviFormatPrices:true}"
"","${_( 'Add-on Tax' )}","${body.sales_summary.TaxSubtotal|default:0|viviFormatPrices:true}"
"","${_( 'Surcharge' )}","${body.sales_summary.SurchargeSubtotal|default:0|viviFormatPrices:true}"
"","${_( 'Discount' )}","${body.sales_summary.DiscountSubtotal|default:0|viviFormatPrices:true}"
"","${_( 'Revenue' )}","${body.sales_summary.Total|default:0|viviFormatPrices:true}"
"",""
"${_( 'Sales Summary' )}"
"","${_( 'Orders' ) + ':'}","${body.sales_summary.OrderNum|default:0}"
"","${_( 'Total' ) + ':'}","${body.sales_summary.Total|default:0|viviFormatPrices:true}"
"","${_( 'Guests' ) + ':'}","${body.sales_summary.Guests|default:0}"
"","${_( 'Items' ) + ':'}","${body.sales_summary.ItemsCount|default:0}"
"","${_( 'Average Total' ) + ':'}","${body.sales_summary.AvgTotal|default:0|viviFormatPrices:true}"
"","${_( 'Average Guest' ) + ':'}","${body.sales_summary.AvgGuests|default:0|viviFormatPrices:true}"
"","${_( 'Average Items' ) + ':'}","${body.sales_summary.AvgItemsCount|default:0|viviFormatPrices:true}"
"",""
"${_( 'Payment List' )}"
"","${_( 'Payment' )}","${_( 'Total' )}"
{for detail in body.payment_list.records}
"","${detail.name}","${detail.total|default:0|viviFormatPrices:true}"
{for payment in detail.detail}
"","(${payment.memo1})","${payment.amount - payment.change|default:0|viviFormatPrices:true}"
{/for}
{/for}
"${_( 'Summary' ) + ':'}","","${body.payment_list.summary.payment_total - body.payment_list.summary.change_total|default:0|viviFormatPrices:true}"
"",""
"${_( 'Destination Summary' )}"
{for detail in body.destination_summary.data}
"","${detail.destination} ${_( 'Times' ) + ':'}","${detail.num_trans|default:0}"
"","${detail.destination} ${_( 'Amount' ) + ':'}","${detail.total|default:0|viviFormatPrices:true}"
{/for}
"",""
"${_( 'Tax summary' )}"
"","${_( 'Tax Name' )}","${_( 'Tax Rate' )}","${_( 'Tax Type' )}","${_( 'Total' )}"
{for detail in body.tax_summary.records}
"","${detail.tax_name}","${detail.tax_rate}","${detail.tax_type}","${detail.tax_subtotal|default:0|viviFormatPrices:true}"
{/for}
"${_( 'Summary' ) + ':'}","","","","${body.tax_summary.summary.tax_total|default:0|viviFormatPrices:true}"
"",""
"${_( 'Top Department Sales' )}"
"","${_( 'Department' )}","${_( 'Qty' )}","${_( 'Total' )}"
{for detail in body.dept_sales.records}
"","'${detail.cate_no}-${detail.cate_name}","${detail.qty|default:0}","${detail.total|default:0|viviFormatPrices:true}"
{/for}
"${_( 'Summary' ) + ':'}","","${body.dept_sales.summary.qty|default:0}","${body.dept_sales.summary.total|default:0|viviFormatPrices:true}"
"",""
"${_( 'Top Product Sales' )}"
"","${_( 'Product' )}","${_( 'Qty' )}","${_( 'Total' )}"
{for detail in body.prod_sales.records}
"","${detail.product_name}","${detail.qty|default:0}","${detail.total|default:0|viviFormatPrices:true}"
{/for}
"${_( 'Summary' ) + ':'}","","${body.prod_sales.summary.qty|default:0}","${body.prod_sales.summary.total|default:0|viviFormatPrices:true}"
"",""
"${_( 'Hourly Sales' )}"
"","${_( 'Time' )}","${_( 'Guests' )}","${_( 'Orders' )}","${_( 'Total' )}"
{for detail in body.hourly_sales.records}
"","${detail.Hour}","${detail.Guests|default:0}","${detail.OrderNum|default:0}","${detail.HourTotal|default:0|viviFormatPrices:true}"
{/for}
"${_( 'Summary' ) + ':'}","","${body.hourly_sales.summary.Guests|default:0}","${body.hourly_sales.summary.OrderNum|default:0}","${body.hourly_sales.summary.HourTotal|default:0|viviFormatPrices:true}"
"",""
"${_( 'Discount Summary' )}"
"","${_( 'Name' )}","${_( 'Type' )}","${_( 'Count' )}","${_( 'Amount' )}"
{for detail in body.discount_summary.data}
"","${detail.discount_name}","${detail.itemOrAddition}","${detail.num_rows|default:0}","${detail.amount|default:0|viviFormatPrices:true}"
{/for}
"${_( 'Summary' ) + ':'}","","","${body.discount_summary.summary.num_rows|default:0}","${body.discount_summary.summary.amount|default:0|viviFormatPrices:true}"
"",""
"${_( 'Surcharge Summary' )}"
"","${_( 'Name' )}","${_( 'Type' )}","${_( 'Count' )}","${_( 'Amount' )}"
{for detail in body.surcharge_summary.data}
"","${detail.surcharge_name}","${detail.itemOrAddition}","${detail.num_rows|default:0}","${detail.amount|default:0|viviFormatPrices:true}"
{/for}
"${_( 'Summary' ) + ':'}","","","${body.surcharge_summary.summary.num_rows|default:0}","${body.surcharge_summary.summary.amount|default:0|viviFormatPrices:true}"
