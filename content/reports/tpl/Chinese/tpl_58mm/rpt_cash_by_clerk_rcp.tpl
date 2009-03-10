[&QSON]${head.store.name|center:15}[&QSOFF]
[&DWON]${head.store.branch|center:14}[&DWOFF]
${head.store.telephone1|center:24}

機臺: ${head.store.terminal_no}
櫃員: ${head.clerk_displayname}
${head.start_time} ~
${head.end_time}

${head.title|center:24}
{for master in body}
========================
機器編號   :${master.terminal_no}
起始時間   :${master.starttime|left:10}
結束時間   :${master.endtime|left:10}
營業日   　:${master.sale_period}
班別      :${master.shift_number}
總金額   　:${master.balance|default:0|viviFormatPrices:true}
現金淨額   :${master.cash|default:0|viviFormatPrices:true}
銷售金額   :${master.sales|default:0|viviFormatPrices:true}
溢收金額   :${master.sxcess|default:0|viviFormatPrices:true}
代收代付淨額:${master.ledger|default:0|viviFormatPrices:true}
------------------------
{for detail in master.ShiftChangeDetail}
{if detail.name.length > 0}${detail.name|left:10}{else}${detail.type|left:10}{/if}
:${detail.amount|default:0|viviFormatPrices:true|right:13}
{/for}
{/for}
========================
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
