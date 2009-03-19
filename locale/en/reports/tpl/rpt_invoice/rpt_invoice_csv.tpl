"${head.store.name}"
"${head.store.branch}"
"電話:","'${head.store.telephone1}"
"機器編號:","'${head.store.terminal_no}"
"收銀員:","'${head.clerk_displayname}"
"列印時間:","${foot.gen_time}"
"起始時間:","${head.start_time}"
"結束時間:","${head.end_time}"

"時間","班別","發票號碼","統一編號","備註","發票張數","總計","折扣金額","附加費","外加稅","內含稅"{for tax in taxList},"${tax.no}"{/for}
{for item in body}
,""
"${item.created}","${item.shift_number}","${item.invoice_no}","${item.uniform_business_number}","${item.status}","${item.num_invoices}","${item.Order.total|default:0|viviFormatPrices:true}","${item.discount_subtotal|default:0|viviFormatPrices:true}","${item.surcharge_subtotal|default:0|viviFormatPrices:true}","${item.Order.tax_subtotal|default:0|viviFormatPrices:true}","${item.Order.included_tax_subtotal|default:0|viviFormatPrices:true}"{for tax in taxList},"${item[ tax.no ]|viviFormatPrices:true}"{/for}
{/for}
,""
"","","","","總計:","${foot.summary.num_invoices|default:0}","${foot.summary.total|default:0|viviFormatPrices:true}","${foot.summary.discount_subtotal|default:0|viviFormatPrices:true}","${foot.summary.surcharge_subtotal|default:0|viviFormatPrices:true}","${foot.summary.tax_subtotal|default:0|viviFormatPrices:true}","${foot.summary.included_tax_subtotal|default:0|viviFormatPrices:true}"{for tax in taxList},"${foot.summary[ tax.no ]|viviFormatPrices:true}"{/for}
