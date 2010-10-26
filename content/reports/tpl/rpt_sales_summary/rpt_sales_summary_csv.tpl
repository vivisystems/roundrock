"${head.title}"

"${head.store.name}"
"${head.store.branch}"
"${_( '(rpt)Telephone' ) + ':'}","${head.store.telephone1}"
"${_( '(rpt)Terminal' ) + ':'}","${head.store.terminal_no}"
"${_( '(rpt)Clerk' ) + ':'}","${head.clerk_displayname}"
"${_( '(rpt)Printed Time' ) + ':'}","${foot.gen_time}"
"${_( '(rpt)Start Time' ) + ':'}","${head.start_time}"
"${_( '(rpt)End Time' ) + ':'}","${head.end_time}"
"${_('(rpt)Condition') + ' - '}"
"${queryFormLabel.terminal_no_label}","${queryFormLabel.terminal_no}"
"${queryFormLabel.shift_no_label}","${queryFormLabel.shift_no}"
"${queryFormLabel.period_type_label}","${queryFormLabel.period_type}"
"${queryFormLabel.num_dept_label}","${queryFormLabel.num_dept}"
"${queryFormLabel.num_product_label}","${queryFormLabel.num_product}"
"${queryFormLabel.database_label}","${queryFormLabel.database}"
"${head.title} ${head.subtitle}"
"",""
"${_( '(rpt)Sales Overview' )}"
"","${_( '(rpt)Gross Sales' )}","${body.sales_summary.GrossSales|default:0|viviFormatPrices:true}"
"","${_( '(rpt)Add-on Tax' )}","${body.sales_summary.TaxSubtotal|default:0|viviFormatTaxes:true}"
"","${_( '(rpt)Surcharge' )}","${body.sales_summary.SurchargeSubtotal|default:0|viviFormatPrices:true}"
"","${_( '(rpt)Discount' )}","${body.sales_summary.DiscountSubtotal|default:0|viviFormatPrices:true}"
"","${_( '(rpt)Promotion' )}","${body.sales_summary.PromotionSubtotal|default:0|viviFormatPrices:true}"
"","${_( '(rpt)Revalue' )}","${body.sales_summary.RevalueSubtotal|default:0|viviFormatPrices:true}"
"","${_( '(rpt)Total' )}","${body.sales_summary.NetSales|default:0|viviFormatPrices:true}"
"",""
"${_( '(rpt)Sales Summary' )}"
"","${_( '(rpt)Number of Orders' ) + ':'}","${body.sales_summary.OrderNum|default:0}"
"","${_( '(rpt)Number of Guests' ) + ':'}","${body.sales_summary.Guests|default:0}"
"","${_( '(rpt)Number of Items' ) + ':'}","${body.sales_summary.QtySubtotal|default:0}"
"","${_( '(rpt)Number of Voided Orders' ) + ':'}","${body.sales_summary.VoidedOrders|default:0}"
"","${_( '(rpt)Gross Sales' ) + ':'}","${body.sales_summary.GrossSales|default:0|viviFormatPrices:true}"
"","${_( '(rpt)Gross Sales/Order' ) + ':'}","${body.sales_summary.AvgGrossSales|default:0|viviFormatPrices:true}"
"","${_( '(rpt)Gross Sales/Guest' ) + ':'}","${body.sales_summary.AvgGrossSalesPerGuest|default:0|viviFormatPrices:true}"
"","${_( '(rpt)Total' ) + ':'}","${body.sales_summary.NetSales|default:0|viviFormatPrices:true}"
"","${_( '(rpt)Total/Order' ) + ':'}","${body.sales_summary.AvgNetSales|default:0|viviFormatPrices:true}"
"","${_( '(rpt)Total/Guest' ) + ':'}","${body.sales_summary.AvgNetSalesPerGuest|default:0|viviFormatPrices:true}"
"","${_( '(rpt)Number of Guests/Order' ) + ':'}","${body.sales_summary.AvgGuests|default:0|format:2}"
"","${_( '(rpt)Number of Items/Order' ) + ':'}","${body.sales_summary.AvgQtySubtotal|default:0|format:2}"
"",""
"${_( '(rpt)Payment List' )}"
"","${_( '(rpt)Payment' )}","${_( '(rpt)Payment Amount' )}"
{for detail in body.payment_list.records}
"","'${_('(rpt)' + detail.name)|default:''}","","${detail.total|default:0|viviFormatPrices:true}"
{for payment in detail.detail}
"","","'${payment.memo1|default:''}","${payment.amount|default:0|viviFormatPrices:true}"
{/for}
{/for}
"${_( '(rpt)Summary' ) + ':'}","","","${body.payment_list.summary.payment_total|default:0|viviFormatPrices:true}"
"",""
"${_( '(rpt)Groupable Payments' )}"
"","${_( '(rpt)Groupable Payment Type' )}","${_( '(rpt)Groupable Payment Count' )}"
{for detail in body.groupable_payments.records}
"","'${detail.memo1|default:''} ${detail.amount|viviFormatPrices:true}","${detail.count}"
{/for}
"",""
"${_( '(rpt)Destination Summary' )}"
"","${_( '(rpt)Destination' )}","${_( '(rpt)Destination Count' )}","${_( '(rpt)Destination Gross Sales' )}","${_( '(rpt)Destination Average Gross Sales' )}"
{for detail in body.destination_summary.data}
"","'${detail.destination|default:''}","${detail.num_trans|default:0}","${detail.gross|default:0|viviFormatPrices:true}","${detail.gross_per_trans|default:0|viviFormatPrices:true}"
{/for}
"",""
"${_( '(rpt)Tax Summary' )}"
"","${_( '(rpt)Tax Name' )}","${_( '(rpt)Taxable Amount' )}","${_( '(rpt)Add-On Tax Amount' )}","${_( '(rpt)Included Tax Amount' )}"
{for detail in body.tax_summary.records}
"","'${detail.tax_name|default:''}","${detail.taxable_amount|default:0|viviFormatTaxes:true}","${detail.tax_subtotal|default:0|viviFormatTaxes:true}","${detail.included_tax|default:0|viviFormatTaxes:true}"
{/for}
"${_( '(rpt)Summary' ) + ':'}","","","${body.tax_summary.summary.addon_tax_total|default:0|viviFormatTaxes:true}","${body.tax_summary.summary.included_tax_total|default:0|viviFormatTaxes:true}"
"",""
"${_( '(rpt)Top Department Sales' )}"
"","${_( '(rpt)Department' )}","${_( '(rpt)Quantity' )}","${_( '(rpt)Gross Sales' )}"
{for detail in body.dept_sales.records}
"","'${detail.cate_no|default:''}-${detail.cate_name|default:''}","${detail.qty|default:0}","${detail.gross|default:0|viviFormatPrices:true}"
{/for}
"${_( '(rpt)Summary' ) + ':'}","","${body.dept_sales.summary.qty|default:0}","${body.dept_sales.summary.gross|default:0|viviFormatPrices:true}"
"",""
"${_( '(rpt)Top Product Sales' )}"
"","${_( '(rpt)Product' )}","${_( '(rpt)Quantity' )}","${_( '(rpt)Gross Sales' )}"
{for detail in body.prod_sales.records}
"","'${detail.product_name|default:''}","${detail.qty|default:0}","${detail.gross|default:0|viviFormatPrices:true}"
{/for}
"${_( '(rpt)Summary' ) + ':'}","","${body.prod_sales.summary.qty|default:0}","${body.prod_sales.summary.gross|default:0|viviFormatPrices:true}"
"",""
"${_( '(rpt)Hourly Sales' )}"
"","${_( '(rpt)Hour' )}","${_( '(rpt)Number of Guests' )}","${_( '(rpt)Number of Orders' )}","${_( '(rpt)Gross Sales' )}"
{for detail in body.hourly_sales.records}
"","'${detail.Hour}","${detail.Guests|default:0}","${detail.OrderNum|default:0}","${detail.HourGrossSales|default:0|viviFormatPrices:true}"
{/for}
"${_( '(rpt)Summary' ) + ':'}","","${body.hourly_sales.summary.Guests|default:0}","${body.hourly_sales.summary.OrderNum|default:0}","${body.hourly_sales.summary.HourGrossSales|default:0|viviFormatPrices:true}"
"",""
"${_( '(rpt)Discount Summary' )}"
"","${_( '(rpt)Discount Name' )}","${_( '(rpt)Discount Type' )}","${_( '(rpt)Discount Count' )}","${_( '(rpt)Discount Amount' )}"
{for detail in body.discount_summary.data}
"","'${detail.discount_name|default:''}","'${detail.itemOrAddition}","${detail.num_rows|default:0}","${detail.amount|default:0|viviFormatPrices:true}"
{/for}
"${_( '(rpt)Summary' ) + ':'}","","","${body.discount_summary.summary.num_rows|default:0}","${body.discount_summary.summary.amount|default:0|viviFormatPrices:true}"
"",""
"${_( '(rpt)Surcharge Summary' )}"
"","${_( '(rpt)Surcharge Name' )}","${_( '(rpt)Surcharge Type' )}","${_( '(rpt)Surcharge Count' )}","${_( '(rpt)Surcharge Amount' )}"
{for detail in body.surcharge_summary.data}
"","'${detail.surcharge_name}","${detail.itemOrAddition}","${detail.num_rows|default:0}","${detail.amount|default:0|viviFormatPrices:true}"
{/for}
"${_( '(rpt)Summary' ) + ':'}","","","${body.surcharge_summary.summary.num_rows|default:0}","${body.surcharge_summary.summary.amount|default:0|viviFormatPrices:true}"
"",""
"${_( '(rpt)Promotion Summary' )}"
"","${_( '(rpt)Promotion Name' )}","${_( '(rpt)Promotion Count' )}","${_( '(rpt)Promotion Amount' )}"
{for detail in body.promotion_summary.results}
"","'${detail.name|default:''}","${detail.matched_count|default:0}","${detail.discount_subtotal|default:0|viviFormatPrices:true}"
{/for}
"${_( '(rpt)Summary' ) + ':'}","","${body.promotion_summary.summary.matched_count|default:0}","${body.promotion_summary.summary.discount_subtotal|default:0|viviFormatPrices:true}"
