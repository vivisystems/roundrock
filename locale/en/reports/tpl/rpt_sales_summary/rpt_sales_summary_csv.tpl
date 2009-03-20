"${head.store.name}"
"${head.store.branch}"
"Telphone:","'${head.store.telephone1}"
"Terminal:","'${head.store.terminal_no}"
"Clerk:","'${head.clerk_displayname}"
"Printed Time:","'${foot.gen_time}"
"Start:","${head.start_time}"
"End:","${head.end_time}"
""
"${head.title} ${head.subtitle}"
"",""
"General Information"
"","Total","${body.sales_summary.ItemSubtotal|default:0|viviFormatPrices:true}"
"","Add-on Tax","${body.sales_summary.TaxSubtotal|default:0|viviFormatPrices:true}"
"","Surcharge","${body.sales_summary.SurchargeSubtotal|default:0|viviFormatPrices:true}"
"","Discount","${body.sales_summary.DiscountSubtotal|default:0|viviFormatPrices:true}"
"","Revenue","${body.sales_summary.Total|default:0|viviFormatPrices:true}"
"",""
"Sales Summary"
"","Orders:","${body.sales_summary.OrderNum|default:0}"
"","Total:","${body.sales_summary.Total|default:0|viviFormatPrices:true}"
"","Guests:","${body.sales_summary.Guests|default:0|viviFormatPrices:true}"
"","Items:","${body.sales_summary.ItemsCount|default:0|viviFormatPrices:true}"
"","Average Total:","${body.sales_summary.AvgTotal|default:0|viviFormatPrices:true}"
"","Average Guest:","${body.sales_summary.AvgGuests|default:0|viviFormatPrices:true}"
"","Average Items:","${body.sales_summary.AvgItemsCount|default:0|viviFormatPrices:true}"
"",""
"Payment List"
"","Payment","Total"
{for detail in body.payment_list.records}
"","${detail.name}","${detail.total|default:0|viviFormatPrices:true}"
{for payment in detail.detail}
"","(${payment.memo1})","${payment.amount - payment.change|default:0|viviFormatPrices:true}"
{/for}
{/for}
"Summary:","","${body.payment_list.summary.payment_total - body.payment_list.summary.change_total|default:0|viviFormatPrices:true}"
"",""
"Destination Summary"
{for detail in body.destination_summary.data}
"","${detail.destination} Times:","${detail.num_trans|default:0|viviFormatPrices:false}"
"","${detail.destination} Amount:","${detail.total|default:0|viviFormatPrices:true}"
{/for}
"",""
"Tax summary"
"","Tax Name","Tax Rate","Tax Type","Total"
{for detail in body.tax_summary.records}
"","${detail.tax_name}","${detail.tax_rate}","${detail.tax_type}","${detail.tax_subtotal|default:0|viviFormatPrices:true}"
{/for}
"Summary:","","","","${body.tax_summary.summary.tax_total|default:0|viviFormatPrices:true}"
"",""
"Top ${body.dept_sales.num_rows_to_get} Department Sales"
"","Department","Qty","Total"
{for detail in body.dept_sales.records}
"","'${detail.cate_no}-${detail.cate_name}","${detail.qty}","${detail.total|default:0|viviFormatPrices:true}"
{/for}
"Summary:","","${body.dept_sales.summary.qty}","${body.dept_sales.summary.total|default:0|viviFormatPrices:true}"
"",""
"Top ${body.prod_sales.num_rows_to_get} Product Sales"
"","Product","Qty","Total"
{for detail in body.prod_sales.records}
"","${detail.product_name}","${detail.qty}","${detail.total|default:0|viviFormatPrices:true}"
{/for}
"Summary:","","${body.prod_sales.summary.qty}","${body.prod_sales.summary.total|default:0|viviFormatPrices:true}"
"",""
"Hourly Sales"
"","Time","Guests","Orders","Total"
{for detail in body.hourly_sales.records}
"","${detail.Hour}","${detail.Guests}","${detail.OrderNum}","${detail.HourTotal|default:0|viviFormatPrices:true}"
{/for}
"Summary:","","${body.hourly_sales.summary.Guests}","${body.hourly_sales.summary.OrderNum}","${body.hourly_sales.summary.HourTotal|default:0|viviFormatPrices:true}"
"",""
"Discount Summary"
"","Name","Type","Count","Amount"
{for detail in body.discount_summary.data}
"","${detail.discount_name}","${detail.itemOrAddition}","${detail.num_rows}","${detail.amount|default:0|viviFormatPrices:true}"
{/for}
"Summary:","","","${body.discount_summary.summary.num_rows}","${body.discount_summary.summary.amount|default:0|viviFormatPrices:true}"
"",""
"Surcharge Summary"
"","Name","Type","Count","Amount"
{for detail in body.surcharge_summary.data}
"","${detail.surcharge_name}","${detail.itemOrAddition}","${detail.num_rows}","${detail.amount|default:0|viviFormatPrices:true}"
{/for}
"Summary:","","","${body.surcharge_summary.summary.num_rows}","${body.surcharge_summary.summary.amount|default:0|viviFormatPrices:true}"
