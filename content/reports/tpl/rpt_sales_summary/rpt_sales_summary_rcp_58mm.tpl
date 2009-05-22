[&QSON]${head.store.name|center:15}[&QSOFF]
[&DWON]${head.store.branch|center:14}[&DWOFF]
${head.store.telephone1|center:24}

${_( '(rpt)Terminal' ) + ': '}${head.store.terminal_no}
${_( '(rpt)Clerk' ) + ': '}${head.clerk_displayname}
${head.start_time} ~
${head.end_time}

${head.title|center:24}
------------------------
${_( '(rpt)General Information' )}
${_( '(rpt)Gross Sales' ) + ':'}
${body.sales_summary.ItemSubtotal|default:0|viviFormatPrices:true|right:24}
${_( '(rpt)Add-on Tax' ) + ':'}
${body.sales_summary.TaxSubtotal|default:0|viviFormatTaxes:true|right:24}
${_( '(rpt)Surcharge' ) + ':'}
${body.sales_summary.SurchargeSubtotal|default:0|viviFormatPrices:true|right:24}
${_( '(rpt)Discount' ) + ':'}
${body.sales_summary.DiscountSubtotal|default:0|viviFormatPrices:true|right:24}
${_( '(rpt)Promotion' ) + ':'}
${body.sales_summary.PromotionSubtotal|default:0|viviFormatPrices:true|right:24}
${_( '(rpt)Revalue' ) + ':'}
${body.sales_summary.RevalueSubtotal|default:0|viviFormatPrices:true|right:24}
${_( '(rpt)Net Sales' ) + ':'}
${body.sales_summary.NetSales|default:0|viviFormatPrices:true|right:24}
------------------------
${_( '(rpt)Sales Summary' )}
${_( '(rpt)Number of Orders' ) + ':'}
${body.sales_summary.OrderNum|default:0|format:0|right:24}
${_( '(rpt)Net Sales' ) + ':'}
${body.sales_summary.NetSales|default:0|viviFormatPrices:true|right:24}
${_( '(rpt)Number of Guests' ) + ':'}
${body.sales_summary.Guests|default:0|right:24}
${_( '(rpt)Number of Items' ) + ':'}
${body.sales_summary.ItemsCount|default:0|right:24}
${_( '(rpt)Number of Voided Orders' ) + ':'}
${body.sales_summary.VoidedOrders|default:0|right:24}
${_( '(rpt)Net Sales/Order' ) + ':'}
${body.sales_summary.AvgTotal|default:0|format:2|right:24}
${_( '(rpt)Net Sales/Guest' ) + ':'}
${body.sales_summary.AvgTotalPerGuest|default:0|format:2|right:24}
${_( '(rpt)Number of Guests/Order' ) + ':'}
${body.sales_summary.AvgGuests|default:0|format:2|right:24}
${_( '(rpt)Number of Items/Order' ) + ':'}
${body.sales_summary.AvgItemsCount|default:0|format:2|right:24}
------------------------
${_( '(rpt)Payment List' )}
{for detail in body.payment_list.records}
${detail.name}:
${detail.total|default:0|viviFormatPrices:true|right:24}
{for payment in detail.detail}
  ${payment.memo1}:
  ${payment.amount - payment.change|default:0|viviFormatPrices:true|right:22}
{/for}
{/for}
${_( '(rpt)Summary' ) + ':'}
${body.payment_list.summary.payment_total - body.payment_list.summary.change_total|default:0|viviFormatPrices:true|right:24}
------------------------
${_( '(rpt)Destination Summary' )}
{for detail in body.destination_summary.data}
${detail.destination} ${_( '(rpt)Times' ) + ':'}
${detail.num_trans|default:0|right:24}
${detail.destination} ${_( '(rpt)Amount' ) + ':'}
${detail.total|default:0|viviFormatPrices:true|right:24}
{/for}
------------------------
${_( '(rpt)Tax Summary' )}
{for detail in body.tax_summary.records}
${_( '(rpt)Tax Name' ) + ':'}
${detail.tax_name|right:24}
${_( '(rpt)Tax Rate' ) + ':'}
${detail.tax_rate|right:24}
${_( '(rpt)Tax Type' ) + ':'}
${detail.tax_type|right:24}
${_( '(rpt)Total' ) + ':'}
${detail.tax_subtotal|default:0|viviFormatTaxes:true|right:24}
  
{/for}
${_( '(rpt)Summary' ) + ':'}
${body.tax_summary.summary.tax_total|default:0|viviFormatTaxes:true|right:24}
------------------------
${_( '(rpt)Top Department Sales' )}
{for detail in body.dept_sales.records}
${_( '(rpt)Department' ) + ':'}
${detail.cate_no + '-' + detail.cate_name|right:24}
${_( '(rpt)Quantity' ) + ':'}
${detail.qty|default:0|right:24}
${_( '(rpt)Total' ) + ':'}
${detail.total|default:0|viviFormatPrices:true|right:24}
  
{/for}
${_( '(rpt)Summary' ) + ':'}
${_( '(rpt)Quantity' ) + ':'}
${body.dept_sales.summary.qty|default:0|right:24}
${_( '(rpt)Total' ) + ':' }
${body.dept_sales.summary.total|default:0|viviFormatPrices:true|right:24}
------------------------
${_( '(rpt)Top Product Sales' )}
{for detail in body.prod_sales.records}
${_( '(rpt)Product' ) + ':'}
${detail.product_name|right:24}
${_( '(rpt)Quantity' ) + ':'}
${detail.qty|default:0|right:24}
${_( '(rpt)Total' ) + ':'}
${detail.total|default:0|viviFormatPrices:true|right:24}
  
{/for}
${_( '(rpt)Summary' ) + ':'}
${_( '(rpt)Quantity' ) + ':'}
${body.prod_sales.summary.qty|default:0|right:24}
${_( '(rpt)Total' ) + ':'}
${body.prod_sales.summary.total|default:0|viviFormatPrices:true|right:24}
------------------------
${_( '(rpt)Hourly Sales' )}
{for detail in body.hourly_sales.records}
${_( '(rpt)Time' ) + ':'}
${detail.Hour|right:24}
${_( '(rpt)Number of Guests' ) + ':'}
${detail.Guests|default:0|right:24}
${_( '(rpt)Number of Orders' ) + ':'}
${detail.OrderNum|default:0|right:24}
${_( '(rpt)Gross Sales' ) + ':'}
${detail.HourTotal|default:0|viviFormatPrices:true|right:24}
  
{/for}
${_( '(rpt)Summary' ) + ':'}
${_( '(rpt)Number of Guests' ) + ':'}
${body.hourly_sales.summary.Guests|default:0|right:24}
${_( '(rpt)Number of Orders' ) + ':'}
${body.hourly_sales.summary.OrderNum|default:0|right:24}
${_( '(rpt)Gross Sales' ) + ':'}
${body.hourly_sales.summary.HourTotal|default:0|viviFormatPrices:true|right:24}
------------------------
${_( '(rpt)Discount Summary' )}
{for detail in body.discount_summary.data}
${_( '(rpt)Name' ) + ':'}
${detail.discount_name|right:24}
${_( '(rpt)TYPE' ) + ':'}
${detail.itemOrAddition|right:24}
${_( '(rpt)Count' ) + ':'}
${detail.num_rows|default:0|right:24}
${_( '(rpt)Amount' ) + ':'}
${detail.amount|default:0|viviFormatPrices:true|right:24}
	
{/for}
${_( '(rpt)Summary' ) + ':'}
${_( '(rpt)Count' ) + ':'}
${body.discount_summary.summary.num_rows|default:0|right:24}
${_( '(rpt)Amount' ) + ':'}
${body.discount_summary.summary.amount|default:0|viviFormatPrices:true|right:24}
------------------------
${_( '(rpt)Surcharge Summary' )}
{for detail in body.surcharge_summary.data}
${_( '(rpt)Name' ) + ':'}
${detail.surcharge_name|right:24}
${_( '(rpt)TYPE' ) + ':'}
${detail.itemOrAddition|right:24}
${_( '(rpt)Count' ) + ':'}
${detail.num_rows|default:0|right:24}
${_( '(rpt)Amount' ) + ':'}
${detail.amount|default:0|viviFormatPrices:true|right:24}

{/for}
${_( '(rpt)Summary' ) + ':'}
${_( '(rpt)Count' ) + ':'}
${body.surcharge_summary.summary.num_rows|default:0|right:24}
${_( '(rpt)Amount' ) + ':'}
${body.surcharge_summary.summary.amount|default:0|viviFormatPrices:true|right:24}
------------------------
${_( '(rpt)Promotion Summary' )}
{for detail in body.promotion_summary.results}
${_( '(rpt)Name' )}
${detail.name|right:24}
${_( '(rpt)Code' )}
${detail.code|right:24}
${_( '(rpt)Count' )}
${detail.matched_count|default:0|right:24}
${_( '(rpt)Discount' )}
${detail.discount_subtotal|default:0|viviFormatPrices:true|right:24}

{/for}
${_( '(rpt)Summary' ) + ':'}
${_( '(rpt)Count' )}
${body.promotion_summary.summary.matched_count|default:0}
${_( '(rpt)Discount' )}
${body.promotion_summary.summary.discount_subtotal|default:0|viviFormatPrices:true}
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
