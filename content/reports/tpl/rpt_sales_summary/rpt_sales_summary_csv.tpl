"${head.store.name}"
"${head.store.branch}"
"${_( '(rpt)Telphone' ) + ':'}","${head.store.telephone1}"
"${_( '(rpt)Terminal' ) + ':'}","${head.store.terminal_no}"
"${_( '(rpt)Clerk' ) + ':'}","${head.clerk_displayname}"
"${_( '(rpt)Printed Time' ) + ':'}","${foot.gen_time}"
"${_( '(rpt)Start' ) + ':'}","${head.start_time}"
"${_( '(rpt)End' ) + ':'}","${head.end_time}"
""
"${head.title} ${head.subtitle}"
"",""
"${_( '(rpt)General Information' )}"
"","${_( '(rpt)Total' )}","${body.sales_summary.ItemSubtotal|default:0|viviFormatPrices:true}"
"","${_( '(rpt)Add-on Tax' )}","${body.sales_summary.TaxSubtotal|default:0|viviFormatPrices:true}"
"","${_( '(rpt)Surcharge' )}","${body.sales_summary.SurchargeSubtotal|default:0|viviFormatPrices:true}"
"","${_( '(rpt)Discount' )}","${body.sales_summary.DiscountSubtotal|default:0|viviFormatPrices:true}"
"","${_( '(rpt)Revenue' )}","${body.sales_summary.Total|default:0|viviFormatPrices:true}"
"",""
"${_( '(rpt)Sales Summary' )}"
"","${_( '(rpt)Orders' ) + ':'}","${body.sales_summary.OrderNum|default:0}"
"","${_( '(rpt)Total' ) + ':'}","${body.sales_summary.Total|default:0|viviFormatPrices:true}"
"","${_( '(rpt)Guests' ) + ':'}","${body.sales_summary.Guests|default:0}"
"","${_( '(rpt)Items' ) + ':'}","${body.sales_summary.ItemsCount|default:0}"
"","${_( '(rpt)Average Total' ) + ':'}","${body.sales_summary.AvgTotal|default:0|format:2}"
"","${_( '(rpt)Average Guest' ) + ':'}","${body.sales_summary.AvgGuests|default:0|format:2}"
"","${_( '(rpt)Average Items' ) + ':'}","${body.sales_summary.AvgItemsCount|default:0|format:2}"
"",""
"${_( '(rpt)Payment List' )}"
"","${_( '(rpt)Payment' )}","${_( '(rpt)Total' )}"
{for detail in body.payment_list.records}
"","${detail.name}","${detail.total|default:0|viviFormatPrices:true}"
{for payment in detail.detail}
"","(${payment.memo1})","${payment.amount - payment.change|default:0|viviFormatPrices:true}"
{/for}
{/for}
"${_( '(rpt)Summary' ) + ':'}","","${body.payment_list.summary.payment_total - body.payment_list.summary.change_total|default:0|viviFormatPrices:true}"
"",""
"${_( '(rpt)Destination Summary' )}"
{for detail in body.destination_summary.data}
"","${detail.destination} ${_( '(rpt)Times' ) + ':'}","${detail.num_trans|default:0}"
"","${detail.destination} ${_( '(rpt)Amount' ) + ':'}","${detail.total|default:0|viviFormatPrices:true}"
{/for}
"",""
"${_( '(rpt)Tax summary' )}"
"","${_( '(rpt)Tax Name' )}","${_( '(rpt)Tax Rate' )}","${_( '(rpt)Tax Type' )}","${_( '(rpt)Total' )}"
{for detail in body.tax_summary.records}
"","${detail.tax_name}","${detail.tax_rate}","${detail.tax_type}","${detail.tax_subtotal|default:0|viviFormatPrices:true}"
{/for}
"${_( '(rpt)Summary' ) + ':'}","","","","${body.tax_summary.summary.tax_total|default:0|viviFormatPrices:true}"
"",""
"${_( '(rpt)Top Department Sales' )}"
"","${_( '(rpt)Department' )}","${_( '(rpt)Qty' )}","${_( '(rpt)Total' )}"
{for detail in body.dept_sales.records}
"","${detail.cate_no}-${detail.cate_name}","${detail.qty|default:0}","${detail.total|default:0|viviFormatPrices:true}"
{/for}
"${_( '(rpt)Summary' ) + ':'}","","${body.dept_sales.summary.qty|default:0}","${body.dept_sales.summary.total|default:0|viviFormatPrices:true}"
"",""
"${_( '(rpt)Top Product Sales' )}"
"","${_( '(rpt)Product' )}","${_( '(rpt)Qty' )}","${_( '(rpt)Total' )}"
{for detail in body.prod_sales.records}
"","${detail.product_name}","${detail.qty|default:0}","${detail.total|default:0|viviFormatPrices:true}"
{/for}
"${_( '(rpt)Summary' ) + ':'}","","${body.prod_sales.summary.qty|default:0}","${body.prod_sales.summary.total|default:0|viviFormatPrices:true}"
"",""
"${_( '(rpt)Hourly Sales' )}"
"","${_( '(rpt)Time' )}","${_( '(rpt)Guests' )}","${_( '(rpt)Orders' )}","${_( '(rpt)Total' )}"
{for detail in body.hourly_sales.records}
"","${detail.Hour}","${detail.Guests|default:0}","${detail.OrderNum|default:0}","${detail.HourTotal|default:0|viviFormatPrices:true}"
{/for}
"${_( '(rpt)Summary' ) + ':'}","","${body.hourly_sales.summary.Guests|default:0}","${body.hourly_sales.summary.OrderNum|default:0}","${body.hourly_sales.summary.HourTotal|default:0|viviFormatPrices:true}"
"",""
"${_( '(rpt)Discount Summary' )}"
"","${_( '(rpt)Name' )}","${_( '(rpt)Type' )}","${_( '(rpt)Count' )}","${_( '(rpt)Amount' )}"
{for detail in body.discount_summary.data}
"","${detail.discount_name}","${detail.itemOrAddition}","${detail.num_rows|default:0}","${detail.amount|default:0|viviFormatPrices:true}"
{/for}
"${_( '(rpt)Summary' ) + ':'}","","","${body.discount_summary.summary.num_rows|default:0}","${body.discount_summary.summary.amount|default:0|viviFormatPrices:true}"
"",""
"${_( '(rpt)Surcharge Summary' )}"
"","${_( '(rpt)Name' )}","${_( '(rpt)Type' )}","${_( '(rpt)Count' )}","${_( '(rpt)Amount' )}"
{for detail in body.surcharge_summary.data}
"","${detail.surcharge_name}","${detail.itemOrAddition}","${detail.num_rows|default:0}","${detail.amount|default:0|viviFormatPrices:true}"
{/for}
"${_( '(rpt)Summary' ) + ':'}","","","${body.surcharge_summary.summary.num_rows|default:0}","${body.surcharge_summary.summary.amount|default:0|viviFormatPrices:true}"
